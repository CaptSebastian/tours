// Algemene site-instellingen op één plek.

export const site = {
  name: 'Captain Sebastian',
  email: 'hello@captainsebastian.nl',
  // Fooi via SumUp — staat onderaan elke tour.
  tipUrl: 'https://pay.sumup.com/b2c/QPJ3X2ZI',
  // Boekknoppen onderaan elke pagina: de rederijen waarvoor Captain Sebastian vaart.
  // Links gaan direct naar hun boekingssysteem (FareHarbor).
  // Tip: vraag de rederij om een eigen affiliate-/ref-link, dan zien ze welke boekingen via jou komen.
  bookings: [
    { label: 'KINboat', url: 'https://fareharbor.com/embeds/book/kinboat/?full-items=yes' },
    { label: 'Eco Boats', url: 'https://fareharbor.com/embeds/book/ecoboatsamsterdam/?full-items=yes&flow=1143196&language=en' },
  ],
};
