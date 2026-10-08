// Vaste teksten van de site (knoppen, koppen, meldingen).
// Engels is compleet. Voor een nieuwe taal voeg je een blok toe met dezelfde sleutels;
// wat ontbreekt, valt automatisch terug op Engels.
// {x} is een plekje dat automatisch wordt ingevuld.

const en = {
  'site.tagline': 'Amsterdam open boat tours',
  'nav.tours': 'Tours',
  'nav.tips': 'Tips',
  'nav.language': 'Language',

  'picker.title': 'Choose your language',
  'picker.lead': 'Read along with the captain during the cruise.',

  'home.title': 'Read along with your captain',
  'home.lead': 'Pick your tour and follow every bridge, church and canal house as we cruise.',
  'home.start': 'Start tour',

  'tour.stops': '{n} stops',
  'tour.listen': 'When the captain calls out a number, tap it below to jump there.',
  'tour.map': 'Route map',
  'tour.jump': 'Go to stop',
  'tour.jumpTitle': 'Which stop?',
  'tour.offline': 'Saved — this tour also works without internet',
  'tour.fallback': 'This tour is not yet available in your language, so it is shown in English.',

  'end.title': 'Thanks for cruising with us',
  'end.tipText': 'Enjoyed the tour? A tip really helps out Captain Sebastian and the crew. Thanks a million! 🙏',
  'end.tipButton': 'Leave a tip',
  'end.reviewText': 'A ★★★★★ review on Google or Tripadvisor helps a lot too.',
  'end.reviewButton': 'Write a review',

  'promo.title': "Captain's Amsterdam tips",
  'promo.text': 'Where I like to eat, drink, shop and wander myself — with a map link for every place.',
  'promo.button': 'See my tips',

  'tips.title': 'Amsterdam tips from your captain',
  'tips.lead': 'Where I like to eat, shop and wander myself. Please check opening hours before you go, they can change.',
  'tips.search': 'Search by name, street or tip',
  'tips.all': 'All',
  'tips.map': 'Map',
  'tips.none': 'Nothing found.',
  'tips.fallback': 'These tips are not yet available in your language, so they are shown in English.',

  'footer.bookings': 'Book a cruise',
  'footer.bookText': 'Sail with Captain Sebastian again, or tell your friends.',
  'footer.bookWith': 'Book with {name}',
  'footer.contact': 'Contact',

  '404.title': 'Lost at sea',
  '404.text': "This page doesn't exist. Head back to the harbour and pick your tour.",
  '404.button': 'All tours',
};

export type UiKey = keyof typeof en;

const ui: Record<string, Partial<Record<UiKey, string>>> = {
  en,
  // Voorbeeld voor later — vul aan en zet de taal aan in locales.ts:
  // ru: { 'home.start': 'Начать экскурсию', … },
};

export function t(lang: string, key: UiKey, vars: Record<string, string | number> = {}) {
  let s = ui[lang]?.[key] ?? en[key];
  for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
  return s;
}
