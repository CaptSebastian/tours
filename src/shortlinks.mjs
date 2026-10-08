// Korte links voor QR-codes en om hardop te zeggen: captainsebastian.nl/cs
// Elke korte link opent eerst de taalkeuze en gaat dan naar de tour in die taal.
// Links: korte code → bestemming (tour-slug, 'tips' of '' voor de homepage).

export const shortlinks = {
  alf: 'amsterdam-light-festival-14',
  cs: 'central-station-tour-1',
  cs2: 'cs-tour-2',
  af: 'annefrank1',
  rm: 'kinboat-anne-frank-rijksmuseum-tour',
  tips: 'tips',
};

// Tours die tijdelijk niet getoond worden (niet in menu, homepage of QR-pagina).
// Hun korte link en oude adres gaan zolang naar de homepage. Haal de tour hier weg om hem terug te zetten.
export const paused = [
  'amsterdam-light-festival-14', // wacht op de nieuwe editie (#15, vanaf eind november 2026)
];

// Oude WordPress-adressen (bestaande QR-codes en links blijven zo werken).
export const legacy = [
  'amsterdam-light-festival-14',
  'central-station-tour-1',
  'cs-tour-2',
  'annefrank1',
  'kinboat-anne-frank-rijksmuseum-tour',
];

/** Redirects voor astro.config.mjs */
export function buildRedirects() {
  const r = {};
  const dest = (target) => (paused.includes(target) ? '/' : `/go/${target}/`);
  for (const [code, target] of Object.entries(shortlinks)) r[`/${code}`] = dest(target);
  for (const slug of legacy) r[`/${slug}`] = dest(slug);
  return r;
}
