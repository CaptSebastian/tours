// @ts-check
import { defineConfig } from 'astro/config';
import { buildRedirects } from './src/shortlinks.mjs';

export default defineConfig({
  // Het echte domein. Wordt gebruikt voor de QR-codes.
  site: 'https://captainsebastian.nl',
  trailingSlash: 'ignore',
  // Korte links (/cs, /tips…) en oude WordPress-adressen → taalkeuze → juiste pagina.
  redirects: buildRedirects(),
});
