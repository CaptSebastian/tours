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
  for (const [code, target] of Object.entries(shortlinks)) r[`/${code}`] = `/go/${target}/`;
  for (const slug of legacy) r[`/${slug}`] = `/go/${slug}/`;
  return r;
}
