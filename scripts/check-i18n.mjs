// Controleert alle data voordat de site gebouwd wordt:
//  - Engelse tours: unieke stop-id's en stopnummers
//  - Vertalingen: ontbrekende of overbodige stops/tips (alleen een waarschuwing:
//    wat ontbreekt wordt in het Engels getoond)
//   npm run i18n:check

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../src/data/', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
let errors = 0, warnings = 0;
const err = (m) => { errors++; console.error(`✗ ${m}`); };
const warn = (m) => { warnings++; console.warn(`! ${m}`); };

const enDir = join(root, 'tours/en');
const tours = Object.fromEntries(
  readdirSync(enDir).filter((f) => f.endsWith('.json')).map((f) => [f.replace(/\.json$/, ''), read(join(enDir, f))])
);

for (const [slug, t] of Object.entries(tours)) {
  const ids = t.stops.map((s) => s.id);
  const nums = t.stops.map((s) => s.number);
  if (new Set(ids).size !== ids.length) err(`${slug}: dubbele stop-id's`);
  if (new Set(nums).size !== nums.length) err(`${slug}: dubbele stopnummers`);
  for (const s of t.stops) if (!s.id || typeof s.number !== 'number' || !s.title || !s.body) err(`${slug}: stop mist id/number/title/body (${s.id ?? '?'})`);
}

const tipsEn = read(join(root, 'tips/en.json'));
const tipIds = new Set(tipsEn.items.map((i) => i.id));
const catKeys = new Set(tipsEn.categories.map((c) => c.key));
for (const i of tipsEn.items) for (const c of [i.cat, ...(i.also ?? [])]) if (!catKeys.has(c)) err(`tips: '${i.id}' heeft onbekende categorie '${c}'`);

const langs = new Set([
  ...readdirSync(join(root, 'tours')).filter((d) => d !== 'en'),
  ...readdirSync(join(root, 'tips')).map((f) => f.replace(/\.json$/, '')).filter((l) => l !== 'en'),
]);

for (const lang of langs) {
  for (const [slug, t] of Object.entries(tours)) {
    const p = join(root, 'tours', lang, `${slug}.json`);
    if (!existsSync(p)) { warn(`${lang}: tour '${slug}' nog niet vertaald`); continue; }
    const tr = read(p);
    const ids = new Set(t.stops.map((s) => s.id));
    const missing = [...ids].filter((id) => !tr.stops?.[id]);
    const extra = Object.keys(tr.stops ?? {}).filter((id) => !ids.has(id));
    if (missing.length) warn(`${lang}/${slug}: ${missing.length} stop(s) niet vertaald: ${missing.join(', ')}`);
    if (extra.length) warn(`${lang}/${slug}: onbekende stop-id's (verwijderd of hernoemd in het Engels?): ${extra.join(', ')}`);
  }
  const tp = join(root, 'tips', `${lang}.json`);
  if (!existsSync(tp)) { warn(`${lang}: tips nog niet vertaald`); continue; }
  const tr = read(tp);
  const missing = [...tipIds].filter((id) => !tr.items?.[id]);
  const extra = Object.keys(tr.items ?? {}).filter((id) => !tipIds.has(id));
  if (missing.length) warn(`${lang}/tips: ${missing.length} tip(s) niet vertaald: ${missing.join(', ')}`);
  if (extra.length) warn(`${lang}/tips: onbekende tip-id's: ${extra.join(', ')}`);
}

console.log(`\nData gecontroleerd: ${Object.keys(tours).length} tours, ${tipIds.size} tips, vertalingen: ${[...langs].join(', ') || 'geen'}.`);
if (warnings) console.log(`${warnings} waarschuwing(en) — die teksten worden in het Engels getoond.`);
if (errors) { console.error(`${errors} fout(en). Los die eerst op.`); process.exit(1); }
