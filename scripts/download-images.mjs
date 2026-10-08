// Haalt alle foto's van de oude WordPress-site binnen, verkleint ze en zet de links om.
//   npm run images
//
// - Downloadt elke externe foto uit src/data/**/*.json en src/site.ts naar public/images/
// - Als 'sharp' beschikbaar is (wordt meestal met Astro meegeïnstalleerd):
//   max. 1400 px breed, omgezet naar WebP → veel sneller laden op 4G aan boord.
// - Vervangt de links in de bestanden door /images/<naam>
// Draai dit één keer, terwijl de oude site nog online is. Je kunt het veilig opnieuw draaien.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, extname } from 'node:path';

const projectRoot = new URL('..', import.meta.url).pathname;
const outDir = join(projectRoot, 'public/images');
mkdirSync(outDir, { recursive: true });

let sharp = null;
try { sharp = (await import('sharp')).default; } catch {}
console.log(sharp ? 'sharp gevonden: foto’s worden verkleind naar WebP.' : 'sharp niet gevonden: foto’s worden ongewijzigd opgeslagen.');

function files(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : [p];
  });
}
const targets = [...files(join(projectRoot, 'src/data')).filter((f) => f.endsWith('.json')), join(projectRoot, 'src/site.ts')];

const IMG = /https?:\/\/[^"'\s)]+?\.(?:png|jpe?g|webp|avif|gif)(?=["'\s)])/gi;
const urls = new Set();
for (const f of targets) for (const m of readFileSync(f, 'utf8').matchAll(IMG)) urls.add(m[0]);
console.log(`${urls.size} externe foto's gevonden.\n`);

const map = new Map();
let ok = 0, failed = 0;
for (const url of urls) {
  const original = decodeURIComponent(basename(new URL(url).pathname));
  const stem = original.slice(0, -extname(original).length).replace(/[^\w.-]+/g, '-');
  // Favicon/logo houden hun formaat; tourfoto's worden WebP als sharp er is.
  const keepFormat = !sharp || /\.gif$/i.test(original);
  const name = keepFormat ? original.replace(/[^\w.-]+/g, '-') : `${stem}.webp`;
  const dest = join(outDir, name);
  map.set(url, `/images/${name}`);
  if (existsSync(dest)) { ok++; continue; }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (keepFormat) writeFileSync(dest, buf);
    else await sharp(buf).rotate().resize({ width: 1400, withoutEnlargement: true }).webp({ quality: 72 }).toFile(dest);
    ok++;
    console.log(`✓ ${name}`);
  } catch (e) {
    failed++;
    map.delete(url);
    console.warn(`✗ ${url} (${e.message}) — link blijft ongewijzigd`);
  }
}

for (const f of targets) {
  const before = readFileSync(f, 'utf8');
  let after = before;
  for (const [from, to] of map) after = after.split(from).join(to);
  if (after !== before) writeFileSync(f, after);
}

console.log(`\nKlaar: ${ok} foto's lokaal, ${failed} mislukt.`);
if (failed) process.exitCode = 1;
