// Zoekt rechtenvrije foto's op Wikimedia Commons en zet ze in de site, met fotograaf en licentie.
//   node scripts/commons-images.mjs            (alle tours met een bestand in src/data/commons/)
//   node scripts/commons-images.mjs annefrank1 (één tour)
//
// Per tour leest het src/data/commons/<tour>.json (zoektermen per stop) en:
//  - zoekt per stop op Commons, alleen foto's met een vrije licentie (CC0, publiek domein, CC BY, CC BY-SA),
//    liggend formaat en minstens 1000 px breed;
//  - downloadt de gekozen foto (1280 px breed, als WebP als 'sharp' er is) naar public/images/commons/;
//  - slaat oude archief-persfoto's (Nationaal Archief 'Bestanddeelnr', Stadsarchief 'Afb') over, tenzij 'file' is opgegeven;
//  - zet de foto + bronvermelding in src/data/tours/en/<tour>.json;
//  - zet kleine voorbeelden van de eerste alternatieven in review/commons/<tour>/ om te kunnen kiezen;
//  - schrijft een overzicht naar review/commons/<tour>.md.
// Draait in de GitHub Action 'Commons images' (die heeft internet), maar kan ook lokaal.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const root = new URL('..', import.meta.url).pathname;
const API = 'https://commons.wikimedia.org/w/api.php';
const UA = 'CaptainSebastianSite/1.0 (https://captainsebastian.nl; hello@captainsebastian.nl)';
const FREE = /^(cc0|public domain|pd\b|pd-|cc by(-sa)? \d)/i;
let sharp = null;
try { sharp = (await import('sharp')).default; } catch {}
const EXT = sharp ? 'webp' : 'jpg';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const strip = (html = '') =>
  html.replace(/<[^>]*>/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/\s+/g, ' ').trim();

async function api(params) {
  const url = `${API}?${new URLSearchParams({ format: 'json', formatversion: '2', origin: '*', ...params })}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (res.ok) return res.json();
    await sleep(2000 * (attempt + 1));
  }
  throw new Error(`Commons API faalde: ${url}`);
}

const IMAGEINFO = {
  prop: 'imageinfo',
  iiprop: 'url|size|mime|extmetadata',
  iiurlwidth: '1280',
  iiextmetadatafilter: 'LicenseShortName|Artist|Credit|NonFree|ObjectName',
};

function toCandidate(page) {
  const ii = page.imageinfo?.[0];
  if (!ii) return null;
  const m = ii.extmetadata ?? {};
  const license = strip(m.LicenseShortName?.value);
  return {
    file: page.title,
    url: ii.thumburl ?? ii.url,
    page: ii.descriptionurl,
    width: ii.width, height: ii.height, mime: ii.mime,
    license,
    artist: strip(m.Artist?.value) || strip(m.Credit?.value) || 'Unknown',
    nonFree: m.NonFree?.value === 'true',
    index: page.index ?? 0,
  };
}

const EXCLUDE = /Bestanddeelnr|Afb 0\d{5}|RP-[FPT]-/i; // archief-persfoto's en historische prenten/foto's

function acceptable(c, { allowPortrait = false, exclude = [] } = {}) {
  if (c && (EXCLUDE.test(c.file) || exclude.some((x) => c.file.toLowerCase().includes(x.toLowerCase())))) return false;
  return c && /image\/(jpeg|png|webp)/.test(c.mime) && !c.nonFree && FREE.test(c.license) && !/\b(nc|nd)\b/i.test(c.license)
    && c.width >= 1000 && (allowPortrait || c.width >= c.height * 1.1);
}

async function search(q) {
  const data = await api({ action: 'query', generator: 'search', gsrsearch: `${q} filetype:bitmap`, gsrnamespace: '6', gsrlimit: '25', ...IMAGEINFO });
  return (data.query?.pages ?? []).map(toCandidate).filter(Boolean).sort((a, b) => a.index - b.index);
}

async function byFile(file) {
  const data = await api({ action: 'query', titles: file.startsWith('File:') ? file : `File:${file}`, ...IMAGEINFO });
  return (data.query?.pages ?? []).map(toCandidate).filter(Boolean);
}

async function choose(spec) {
  if (spec.file) {
    const c = (await byFile(spec.file))[0];
    return { chosen: acceptable(c, { allowPortrait: true }) ? c : null, alternatives: [], note: c ? `licentie: ${c.license}` : 'bestand niet gevonden' };
  }
  for (const q of spec.q ?? []) {
    const ok = (await search(q)).filter((c) => acceptable(c, { exclude: spec.exclude ?? [], allowPortrait: Boolean(spec.portrait) }));
    if (ok.length) return { chosen: ok[spec.pick ?? 0] ?? ok[0], alternatives: ok.slice(0, 5), query: q };
    await sleep(300);
  }
  return { chosen: null, alternatives: [] };
}

async function download(url, dest, { width = 1280, quality = 72 } = {}) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`download ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (sharp && dest.endsWith('.webp')) {
    await sharp(buf).rotate().resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(dest);
  } else writeFileSync(dest, buf);
}

const credit = (c) => ({ text: `${c.artist} · ${c.license}`, url: c.page });

async function runTour(slug) {
  const cfgPath = join(root, 'src/data/commons', `${slug}.json`);
  const tourPath = join(root, 'src/data/tours/en', `${slug}.json`);
  const cfgText = readFileSync(cfgPath, 'utf8');
  const cfg = JSON.parse(cfgText);
  const tour = JSON.parse(readFileSync(tourPath, 'utf8'));
  const hash = createHash('sha1').update(cfgText).digest('hex').slice(0, 12);
  if (tour.commonsConfig === hash && !process.env.FORCE) { console.log('  ongewijzigd, overgeslagen'); return; }
  tour.commonsConfig = hash;
  const imgDir = join(root, 'public/images/commons');
  const reviewDir = join(root, 'review/commons', slug);
  mkdirSync(imgDir, { recursive: true });
  rmSync(reviewDir, { recursive: true, force: true });
  mkdirSync(reviewDir, { recursive: true });

  const report = [`# Foto's voor ${slug}`, '', '| # | Stop | Gekozen foto | Licentie | Fotograaf |', '|---|---|---|---|---|'];
  const chosenById = {};

  for (const stop of tour.stops) {
    const spec = cfg.stops?.[stop.id];
    if (!spec) continue;
    const { chosen, alternatives, query } = await choose(spec);
    if (!chosen) {
      console.warn(`✗ ${stop.id}: geen geschikte vrije foto gevonden — oude foto blijft staan`);
      report.push(`| ${stop.number} | ${stop.title} | — niets gevonden | | |`);
      continue;
    }
    const name = `${slug}-${stop.id}.${EXT}`;
    await download(chosen.url, join(imgDir, name));
    stop.images = [`/images/commons/${name}`];
    stop.photoCredit = credit(chosen);
    chosenById[stop.id] = { name, c: chosen };
    console.log(`✓ ${stop.id}: ${chosen.file} (${chosen.license}, ${chosen.artist})`);
    report.push(`| ${stop.number} | ${stop.title} | [${chosen.file.replace(/^File:/, '')}](${chosen.page}) | ${chosen.license} | ${chosen.artist} |`);

    // Kleine voorbeelden van alternatieven, om eventueel een andere te kiezen ('pick')
    for (const [i, alt] of alternatives.entries()) {
      const thumb = alt.url.replace(/\/(\d+)px-/, '/330px-');
      try { await download(thumb, join(reviewDir, `${String(stop.number).padStart(2, '0')}-${stop.id}-${i}.${EXT}`), { width: 330, quality: 60 }); } catch (e) { console.warn(`  (voorbeeld ${i} mislukt: ${e.message})`); }
    }
    if (alternatives.length) report.push(`|  |  | alternatieven (${query}): ${alternatives.map((a, i) => `${i}: ${a.file.replace(/^File:/, '')}`).join(' · ')} | | |`);
    await sleep(300);
  }

  // Tourkaart (homepage) en afsluitfoto
  if (cfg.card && chosenById[cfg.card]) {
    tour.card.image = `/images/commons/${chosenById[cfg.card].name}`;
    tour.cardCredit = credit(chosenById[cfg.card].c);
  }
  if (cfg.end) {
    const { chosen } = await choose(cfg.end);
    if (chosen) {
      const name = `${slug}-end.${EXT}`;
      await download(chosen.url, join(imgDir, name));
      tour.endImage = `/images/commons/${name}`;
      tour.endCredit = credit(chosen);
      report.push(`| ♥ | Afsluiting | [${chosen.file.replace(/^File:/, '')}](${chosen.page}) | ${chosen.license} | ${chosen.artist} |`);
    }
  }

  writeFileSync(tourPath, JSON.stringify(tour, null, 2) + '\n');

  // Oude foto's van deze tour die niet meer gebruikt worden, opruimen
  const used = JSON.stringify(tour);
  for (const f of readdirSync(imgDir)) if (f.startsWith(`${slug}-`) && !used.includes(`/images/commons/${f}`)) rmSync(join(imgDir, f));
  writeFileSync(join(root, 'review/commons', `${slug}.md`), report.join('\n') + '\n');
}

const only = process.argv[2];
const slugs = only ? [only] : readdirSync(join(root, 'src/data/commons')).filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''));
for (const slug of slugs) {
  if (!existsSync(join(root, 'src/data/tours/en', `${slug}.json`))) { console.warn(`Tour '${slug}' bestaat niet, overgeslagen.`); continue; }
  console.log(`\n== ${slug} ==`);
  await runTour(slug);
}
