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
  { code: 'nl', name: 'Nederlands', english: 'Dutch', enabled: false },
  { code: 'de', name: 'Deutsch', english: 'German', enabled: false },
  { code: 'fr', name: 'Français', english: 'French', enabled: false },
  { code: 'es', name: 'Español', english: 'Spanish', enabled: false },
  { code: 'it', name: 'Italiano', english: 'Italian', enabled: false },
  { code: 'pt', name: 'Português', english: 'Portuguese', enabled: false },
  { code: 'ru', name: 'Русский', english: 'Russian', enabled: false },
  { code: 'uk', name: 'Українська', english: 'Ukrainian', enabled: false },
  { code: 'zh', name: '中文', english: 'Chinese (simplified)', enabled: false },
  { code: 'ja', name: '日本語', english: 'Japanese', enabled: false },
  { code: 'el', name: 'Ελληνικά', english: 'Greek', enabled: false },
  { code: 'tr', name: 'Türkçe', english: 'Turkish', enabled: false },
  { code: 'ar', name: 'العربية', english: 'Arabic', dir: 'rtl', enabled: false },
  { code: 'he', name: 'עברית', english: 'Hebrew', dir: 'rtl', enabled: false },
];

export const enabledLocales = locales.filter((l) => l.enabled || l.code === defaultLocale);

export function getLocale(code: string): Locale {
  return locales.find((l) => l.code === code) ?? locales[0];
}

/** Voor getStaticPaths: één pagina per actieve taal. */
export function localeParams() {
  return enabledLocales.map((l) => ({ params: { lang: l.code } }));
}
