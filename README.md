# Captain Sebastian – meeleessite voor rondvaarten

Gasten scannen een QR-code (of krijgen een korte link), kiezen hun taal en lezen tijdens de tour mee.
Aan het eind: fooi geven en de Amsterdam-tips van de kapitein.

Engels is de basis. Andere talen worden er later van afgeleid (zie "Een taal toevoegen").

## Hoe gasten door de site gaan

```
QR-code / korte link          taalkeuze                 tour in gekozen taal
captainsebastian.nl/cs   →    /go/central-station-tour-1/  →  /ru/central-station-tour-1/
                                                                 ↓ (einde tour)
                                                              Fooi (SumUp) + review
                                                                 ↓
                                                              /ru/tips/
```

- **Taalkeuze**: grote knoppen, de taal van de telefoon staat bovenaan. De keuze wordt onthouden.
  Staat er maar één taal aan (nu: Engels), dan gaat de link direct door.
- **Tijdens de tour**: elke stop heeft een nummer. De knop **Go to stop** rechtsonder toont een
  cijferraster — roep "nummer 12" en gasten tikken 12 aan.
- **Scherm blijft aan** terwijl de tour open staat (waar de telefoon dat toestaat).
- **Werkt zonder internet**: zodra de tour geopend is, worden pagina, foto's én de tipspagina
  op de telefoon bewaard. Handig onder bruggen of voor gasten zonder databundel.
  Tip: laat gasten de link openen terwijl je nog aan de kade ligt (of op de wifi van de boot).

## Korte links en QR-codes

| Korte link | Gaat naar |
|---|---|
| `/alf` | Amsterdam Light Festival |
| `/cs` | KINBoat Central Station |
| `/cs2` | Eco Boats Central Station |
| `/af` | Anne Frank Amstel |
| `/rm` | Anne Frank Rijksmuseum |
| `/tips` | Tips van de kapitein |

De oude WordPress-adressen (`/central-station-tour-1/` enz.) blijven werken, zodat bestaande
QR-codes niet weggegooid hoeven te worden.

**Printbare QR-codes** staan op `/qr/` (niet in het menu). Open die pagina en print hem of
bewaar als PDF. Korte links wijzigen of toevoegen: `src/shortlinks.mjs`.

## Starten op je computer

1. Installeer **Node.js** (LTS) via https://nodejs.org – eenmalig.
2. In de projectmap:

```bash
npm install        # eenmalig
npm run images     # eenmalig: foto's van de oude site binnenhalen en verkleinen
npm run dev        # site op http://localhost:4321
```

`npm run build` maakt de definitieve site in `dist/` (en controleert eerst alle data).

## Waar staat wat?

```
src/
├── data/
│   ├── tours/en/<tour>.json   ← Engelse tours (master: tekst, foto's, nummers, kaart)
│   ├── tours/<taal>/…         ← vertalingen (alleen tekst)
│   ├── tips/en.json           ← Engelse tips (master)
│   └── tips/<taal>.json       ← vertaalde tips (nl staat al klaar)
├── i18n/
│   ├── locales.ts             ← lijst met talen + welke aan staan
│   └── ui.ts                  ← knoppen en vaste teksten per taal
├── site.ts                    ← logo, e-mail, fooilink, bookings
├── shortlinks.mjs             ← korte links (/cs, /tips…)
├── pages/
│   ├── index.astro            ← taalkeuze op de homepage
│   ├── go/[target].astro      ← taalkeuze voor een tour of tips
│   ├── [lang]/index.astro     ← home per taal
│   ├── [lang]/[slug].astro    ← tourpagina per taal
│   ├── [lang]/tips.astro      ← tipspagina per taal
│   └── qr.astro               ← printbare QR-codes
└── styles/global.css          ← kleuren en fonts bovenaan als variabelen
public/sw.js                   ← offline lezen
scripts/                       ← hulpscripts (foto's, vertalingen, controle)
```

## Een stop aanpassen

Open `src/data/tours/en/<tour>.json`:

```json
{
  "id": "het-scheepvaarthuis",
  "number": 3,
  "title": "Het Scheepvaarthuis",
  "images": ["/images/scheepvaarthuis.webp"],
  "body": "<p>Built in 1913 as…</p>"
}
```

- `number` = wat jij hardop zegt. Moet uniek zijn binnen de tour, mag gaten hebben.
- `id` = de koppeling met vertalingen. **Niet wijzigen** als er al vertalingen zijn; een nieuwe stop krijgt een nieuw id.
- Optioneel: `caption` (fotobijschrift), `video` (YouTube-embedlink).
- Een review-knop aan het eind komt uit `reviewUrl`; de fooiknop staat altijd onderaan.

## Een taal toevoegen

1. Maak de vertaalbestanden aan (met de Engelse tekst als startpunt):
   ```bash
   npm run i18n:template -- ru
   ```
2. Vertaal de teksten in `src/data/tours/ru/*.json` en `src/data/tips/ru.json`
   (Claude kan dit in één keer voor je doen; laat het daarna zo mogelijk nakijken door een moedertaalspreker).
3. Voeg de knopteksten toe in `src/i18n/ui.ts` (een blok `ru: { … }`).
4. Zet in `src/i18n/locales.ts` de taal op `enabled: true`.
5. `npm run i18n:check` laat zien wat er nog ontbreekt. Ontbrekende teksten worden in het Engels getoond,
   met een korte melding — je kunt dus ook een half vertaalde taal al aanzetten.

Arabisch en Hebreeuws worden automatisch van rechts naar links weergegeven.
Talen met een eigen schrift (Russisch, Chinees, Japans, Grieks…) gebruiken de systeemletters van de telefoon.

## Nog te doen voordat je live gaat

- **`npm run images`** draaien zolang de oude WordPress-site nog online is.
- **Bookings-links** invullen in `src/site.ts`.
- **Zoekmachines**: `noindex` staat aan in `src/layouts/Base.astro`. Haal weg als de site gevonden mag worden.
- **Light Festival**: de tekst is van editie #14 (2025-2026). Bij een nieuwe editie de stops vervangen.

## Online zetten

1. Zet het project op GitHub.
2. Koppel de repo aan **Netlify** (of Vercel): framework Astro, build `npm run build`, map `dist`.
3. Koppel `captainsebastian.nl` als eigen domein.
Daarna staat elke wijziging die op GitHub komt binnen een minuut live.
