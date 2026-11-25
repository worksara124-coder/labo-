// ─────────────────────────────────────────────────────────────
//  Configuration centrale du site — changer le nom ici suffit.
// ─────────────────────────────────────────────────────────────
export const SITE = {
  name: "ALVEO",
  suffix: "Lab",
  fullName: "ALVEO Lab",
  tagline: "Laboratoire de prothèse dentaire",
  city: "Casablanca",
  address: "171 Bd Abdelmoumen, 20100 Casablanca",
  phone: "05 22 29 69 20",
  phoneHref: "tel:+212522296920",
  email: "[contact@alveo-lab.ma]",
  mapEmbed: "https://maps.google.com/maps?q=33.5747609,-7.6255808&z=17&output=embed",
  timezone: "Africa/Casablanca",
};

// Horaires d'ouverture en minutes depuis minuit (0 = dimanche).
export const OPENING: Record<number, [number, number] | null> = {
  0: null,
  1: [9 * 60, 19 * 60],
  2: [9 * 60, 19 * 60],
  3: [9 * 60, 19 * 60 + 30],
  4: [9 * 60, 19 * 60],
  5: [9 * 60, 19 * 60],
  6: [9 * 60, 12 * 60 + 30],
};

export const DAY_NAMES = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// Photos libres de droits (Unsplash / Pexels) — à remplacer par celles du laboratoire.
export const PHOTOS = {
  technician: "https://images.unsplash.com/photo-1760205622418-035b2f552845?auto=format&fit=crop&w=1400&q=80",
  dentures: "https://images.unsplash.com/photo-1562330743-fbc6ef07ca78?auto=format&fit=crop&w=1200&q=80",
  implant: "https://images.unsplash.com/photo-1694359599911-1d736610021e?auto=format&fit=crop&w=1200&q=80",
  cast: "https://images.pexels.com/photos/6627329/pexels-photo-6627329.jpeg?auto=compress&cs=tinysrgb&w=1200",
  castClinic: "https://images.pexels.com/photos/6627326/pexels-photo-6627326.jpeg?auto=compress&cs=tinysrgb&w=1200",
  boxed: "https://images.pexels.com/photos/11768114/pexels-photo-11768114.jpeg?auto=compress&cs=tinysrgb&w=1200",
};
