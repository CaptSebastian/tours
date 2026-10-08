// Alle talen van de site. Zet `enabled: true` zodra een taal klaar is
// (zie README → "Een taal toevoegen"). Engels is de basis en staat altijd aan.

export interface Locale {
  code: string;      // wordt de URL: /ru/…
  name: string;      // naam in de eigen taal, zo staat hij op de taalkeuzeknop
  english: string;   // Engelse naam, voor jezelf
  dir?: 'rtl';       // rechts-naar-links schrift (Arabisch, Hebreeuws)
  enabled: boolean;
}

export const defaultLocale = 'en';

export const locales: Locale[] = [
  { code: 'en', name: 'English', english: 'English', enabled: true },
  // Gewenste talen, in volgorde van prioriteit (zet enabled: true zodra de vertaling klaar is):
  { code: 'ru', name: 'Русский', english: 'Russian', enabled: true },
  { code: 'zh', name: '中文', english: 'Chinese (simplified)', enabled: true },
  { code: 'pt', name: 'Português', english: 'Portuguese', enabled: true },
  { code: 'de', name: 'Deutsch', english: 'German', enabled: true },
  { code: 'es', name: 'Español', english: 'Spanish', enabled: true },
  { code: 'fr', name: 'Français', english: 'French', enabled: true },
  { code: 'it', name: 'Italiano', english: 'Italian', enabled: true },
  { code: 'ar', name: 'العربية', english: 'Arabic', dir: 'rtl', enabled: true },
  { code: 'tr', name: 'Türkçe', english: 'Turkish', enabled: true },
  { code: 'he', name: 'עברית', english: 'Hebrew', dir: 'rtl', enabled: true },
  { code: 'ko', name: '한국어', english: 'Korean', enabled: true },
  { code: 'uk', name: 'Українська', english: 'Ukrainian', enabled: true },
  { code: 'el', name: 'Ελληνικά', english: 'Greek', enabled: true },
  { code: 'ja', name: '日本語', english: 'Japanese', enabled: true },
  { code: 'pl', name: 'Polski', english: 'Polish', enabled: true },
  { code: 'hi', name: 'हिन्दी', english: 'Hindi', enabled: true },
  { code: 'sv', name: 'Svenska', english: 'Swedish', enabled: true },
  // Nederlands: de tips zijn al vertaald, de tours nog niet.
  { code: 'nl', name: 'Nederlands', english: 'Dutch', enabled: true },
];

export const enabledLocales = locales.filter((l) => l.enabled || l.code === defaultLocale);

export function getLocale(code: string): Locale {
  return locales.find((l) => l.code === code) ?? locales[0];
}

/** Voor getStaticPaths: één pagina per actieve taal. */
export function localeParams() {
  return enabledLocales.map((l) => ({ params: { lang: l.code } }));
}
