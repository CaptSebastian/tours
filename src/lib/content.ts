// Laadt tours en tips en voegt een vertaling samen met de Engelse basis.
//
// Engels (src/data/tours/en/<slug>.json) is de master: daar staan foto's, nummers, kaart en tekst.
// Een vertaling (src/data/tours/<taal>/<slug>.json) bevat alleen teksten, gekoppeld via het stop-id.
// Ontbreekt iets in de vertaling, dan wordt de Engelse tekst getoond.

import { defaultLocale } from '../i18n/locales';

export interface Stop {
  id: string;
  number: number;
  title: string;
  images?: string[];
  caption?: string;
  video?: string;
  body: string;
}

export interface Tour {
  slug: string;
  title: string;
  menuTitle: string;
  order: number;
  intro?: string;
  credit?: string;
  map?: string;
  card: { title: string; text: string; image: string };
  stops: Stop[];
  endImage?: string;
  reviewUrl?: string;
  /** true als (een deel van) de tekst nog Engels is */
  fallback: boolean;
}

type TourText = Partial<{
  title: string;
  menuTitle: string;
  intro: string;
  credit: string;
  card: Partial<{ title: string; text: string }>;
  stops: Record<string, Partial<{ title: string; body: string; caption: string }>>;
}>;

const tourFiles = import.meta.glob<Record<string, unknown>>('../data/tours/*/*.json', { eager: true, import: 'default' });

function file(path: string) {
  return tourFiles[`../data/tours/${path}.json`];
}

const tourSlugs = Object.keys(tourFiles)
  .map((p) => p.match(/\/tours\/en\/(.+)\.json$/)?.[1])
  .filter((s): s is string => Boolean(s));

export function getTour(slug: string, lang: string): Tour {
  const base = file(`${defaultLocale}/${slug}`) as unknown as Omit<Tour, 'slug' | 'fallback'>;
  const tr = (lang === defaultLocale ? undefined : file(`${lang}/${slug}`)) as TourText | undefined;
  const missing = lang !== defaultLocale && (!tr || base.stops.some((s) => !tr.stops?.[s.id]));

  return {
    ...base,
    slug,
    title: tr?.title ?? base.title,
    menuTitle: tr?.menuTitle ?? base.menuTitle,
    intro: tr?.intro ?? base.intro,
    credit: tr?.credit ?? base.credit,
    card: { ...base.card, ...tr?.card },
    stops: base.stops.map((s) => ({ ...s, ...tr?.stops?.[s.id] })),
    fallback: missing,
  };
}

export function getTours(lang: string): Tour[] {
  return tourSlugs.map((slug) => getTour(slug, lang)).sort((a, b) => a.order - b.order);
}

export { tourSlugs };

// ---------- Tips ----------

export interface TipCategory { key: string; name: string; note?: string }
export interface Tip { id: string; cat: string; name: string; address: string; text: string }

type TipsBase = { categories: TipCategory[]; items: Tip[] };
type TipsText = {
  categories?: Record<string, Partial<{ name: string; note: string }>>;
  items?: Record<string, Partial<{ name: string; text: string }>>;
};

const tipFiles = import.meta.glob<Record<string, unknown>>('../data/tips/*.json', { eager: true, import: 'default' });

export function getTips(lang: string) {
  const base = tipFiles[`../data/tips/${defaultLocale}.json`] as unknown as TipsBase;
  const tr = (lang === defaultLocale ? undefined : tipFiles[`../data/tips/${lang}.json`]) as TipsText | undefined;
  return {
    categories: base.categories.map((c) => ({ ...c, ...tr?.categories?.[c.key] })),
    // `place` = oorspronkelijke naam, voor de kaartlink
    items: base.items.map((i) => ({ ...i, place: i.name, ...tr?.items?.[i.id] })),
    fallback: lang !== defaultLocale && !tr,
  };
}
