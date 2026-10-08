// Maakt lege vertaalbestanden voor een taal, met de Engelse tekst als startpunt.
//   npm run i18n:template -- ru
// Schrijft src/data/tours/ru/<tour>.json en src/data/tips/ru.json (bestaande bestanden blijven staan).
// Daarna vertaal je de teksten (of laat je ze vertalen) en zet je de taal aan in src/i18n/locales.ts.

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const lang = process.argv[2];
if (!lang || lang === 'en' || !/^[a-z]{2}(-[a-z]+)?$/i.test(lang)) {
  console.error('Gebruik: npm run i18n:template -- <taalcode>   (bijv. ru, zh, pt)');
  process.exit(1);
}

const root = new URL('../src/data/', import.meta.url).pathname;
const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const write = (p, data) => {
  if (existsSync(p)) return console.log(`  overgeslagen (bestaat al): ${p}`);
  writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
  console.log(`  aangemaakt: ${p}`);
};

// Tours
const enTours = join(root, 'tours/en');
mkdirSync(join(root, 'tours', lang), { recursive: true });
for (const f of readdirSync(enTours).filter((f) => f.endsWith('.json'))) {
  const t = read(join(enTours, f));
  const out = {
    title: t.title,
    menuTitle: t.menuTitle,
    ...(t.intro && { intro: t.intro }),
    ...(t.credit && { credit: t.credit }),
    card: { title: t.card.title, text: t.card.text },
    stops: Object.fromEntries(
      t.stops.map((s) => [s.id, { title: s.title, body: s.body, ...(s.caption && { caption: s.caption }) }])
    ),
  };
  write(join(root, 'tours', lang, f), out);
}

// Tips
const tips = read(join(root, 'tips/en.json'));
write(join(root, 'tips', `${lang}.json`), {
  categories: Object.fromEntries(tips.categories.map((c) => [c.key, { name: c.name, ...(c.note && { note: c.note }) }])),
  items: Object.fromEntries(tips.items.map((i) => [i.id, { name: i.name, text: i.text }])),
});

console.log(`\nKlaar. Vertaal de teksten in deze bestanden, voeg de knopteksten toe in src/i18n/ui.ts`);
console.log(`en zet '${lang}' op enabled: true in src/i18n/locales.ts.`);
