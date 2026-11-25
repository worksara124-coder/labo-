// Logique de rendez-vous partagée entre le serveur (API) et le client (assistant de réservation).
import { OPENING, SITE } from "./site";

export type ServiceId = "collecte" | "teinte" | "depot" | "visio";
export type Resource = "coursier" | "technicien" | "accueil";

export interface Service {
  id: ServiceId;
  title: string;
  short: string;
  description: string;
  duration: number; // minutes
  resource: Resource;
  where: "cabinet" | "labo" | "visio";
}

export const SERVICES: Service[] = [
  {
    id: "collecte",
    title: "Collecte d'empreinte au cabinet",
    short: "Collecte",
    description: "Un coursier passe récupérer l'empreinte ou le modèle à votre cabinet.",
    duration: 30,
    resource: "coursier",
    where: "cabinet",
  },
  {
    id: "teinte",
    title: "Prise de teinte patient",
    short: "Prise de teinte",
    description: "Votre patient vient au laboratoire pour une prise de teinte avec le céramiste.",
    duration: 45,
    resource: "technicien",
    where: "labo",
  },
  {
    id: "visio",
    title: "Validation design CFAO en visio",
    short: "Visio CFAO",
    description: "Revue du design numérique de la prothèse avec le technicien, avant usinage.",
    duration: 30,
    resource: "technicien",
    where: "visio",
  },
  {
    id: "depot",
    title: "Dépôt ou retrait au laboratoire",
    short: "Dépôt / retrait",
    description: "Créneau réservé à l'accueil pour déposer un cas ou récupérer une prothèse.",
    duration: 15,
    resource: "accueil",
    where: "labo",
  },
];

// Nombre de rendez-vous simultanés possibles par ressource.
export const CAPACITY: Record<Resource, number> = { coursier: 1, technicien: 1, accueil: 2 };

export const RULES = {
  stepMinutes: 15, // grille des créneaux
  minLeadMinutes: 120, // délai minimum avant un RDV
  maxDaysAhead: 30, // réservation possible jusqu'à J+30
  lunch: [13 * 60, 14 * 60] as [number, number], // pause : pas de RDV technicien/coursier
};

// Jours fériés fixes au Maroc (MM-DD). Les fêtes religieuses (dates lunaires) sont à ajouter chaque année.
export const HOLIDAYS_FIXED = ["01-01", "01-11", "01-14", "05-01", "07-30", "08-14", "08-20", "08-21", "11-06", "11-18"];
export const HOLIDAYS_EXTRA: string[] = []; // ex. "2027-03-10" (Aïd al-Fitr)

export interface Booking {
  id: string;
  ref: string;
  service: ServiceId;
  date: string; // YYYY-MM-DD (heure du Maroc)
  start: number; // minutes depuis minuit
  end: number;
  status: "confirme" | "annule";
  praticien: string;
  cabinet: string;
  telephone: string;
  email: string;
  adresse?: string;
  patient?: string;
  travail: string;
  elements: number;
  teinte?: string;
  urgent: boolean;
  notes?: string;
  createdAt: string;
}

export function getService(id: string) {
  return SERVICES.find((s) => s.id === id);
}

export const toHHMM = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
export const toLabel = (m: number) => `${Math.floor(m / 60)}h${String(m % 60).padStart(2, "0")}`;

/** Date et minutes actuelles à Casablanca, quel que soit le fuseau du serveur ou du navigateur. */
export function nowInLab(): { date: string; minutes: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, minutes: +get("hour") * 60 + +get("minute") };
}

export function dayOfWeek(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function addDays(date: string, n: number) {
  const [y, m, d] = date.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

export function isHoliday(date: string) {
  return HOLIDAYS_FIXED.includes(date.slice(5)) || HOLIDAYS_EXTRA.includes(date);
}

export function dateStatus(date: string): "ok" | "passe" | "ferme" | "ferie" | "tropLoin" {
  const today = nowInLab().date;
  if (date < today) return "passe";
  if (date > addDays(today, RULES.maxDaysAhead)) return "tropLoin";
  if (isHoliday(date)) return "ferie";
  if (!OPENING[dayOfWeek(date)]) return "ferme";
  return "ok";
}

/** Créneaux libres pour un service à une date, en tenant compte des RDV existants et de la capacité. */
export function availableSlots(serviceId: ServiceId, date: string, bookings: Booking[]): number[] {
  const service = getService(serviceId);
  if (!service || dateStatus(date) !== "ok") return [];
  const [open, close] = OPENING[dayOfWeek(date)]!;
  const now = nowInLab();
  const sameRes = bookings.filter(
    (b) => b.date === date && b.status === "confirme" && getService(b.service)?.resource === service.resource
  );
  const slots: number[] = [];
  for (let t = open; t + service.duration <= close; t += RULES.stepMinutes) {
    const end = t + service.duration;
    if (date === now.date && t < now.minutes + RULES.minLeadMinutes) continue;
    if (service.resource !== "accueil" && t < RULES.lunch[1] && end > RULES.lunch[0]) continue;
    const overlapping = sameRes.filter((b) => t < b.end && end > b.start).length;
    if (overlapping >= CAPACITY[service.resource]) continue;
    slots.push(t);
  }
  return slots;
}

export function makeRef() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
  return `ALV-${s}`;
}

/** Fichier .ics pour ajouter le RDV à un agenda (heure du Maroc, UTC+1 toute l'année). */
export function toICS(b: Pick<Booking, "ref" | "service" | "date" | "start" | "end">) {
  const s = getService(b.service)!;
  const stamp = (m: number) => `${b.date.replace(/-/g, "")}T${toHHMM(m).replace(":", "")}00`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ALVEO Lab//RDV//FR",
    "BEGIN:VEVENT",
    `UID:${b.ref}@alveo-lab`,
    `DTSTART;TZID=${SITE.timezone}:${stamp(b.start)}`,
    `DTEND;TZID=${SITE.timezone}:${stamp(b.end)}`,
    `SUMMARY:${s.title} — ${SITE.fullName}`,
    `LOCATION:${s.where === "visio" ? "Visioconférence" : SITE.address}`,
    `DESCRIPTION:Référence ${b.ref}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

export function googleCalendarUrl(b: Pick<Booking, "ref" | "service" | "date" | "start" | "end">) {
  const s = getService(b.service)!;
  const stamp = (m: number) => `${b.date.replace(/-/g, "")}T${toHHMM(m).replace(":", "")}00`;
  const p = new URLSearchParams({
    action: "TEMPLATE",
    text: `${s.title} — ${SITE.fullName}`,
    dates: `${stamp(b.start)}/${stamp(b.end)}`,
    ctz: SITE.timezone,
    details: `Référence ${b.ref}`,
    location: s.where === "visio" ? "Visioconférence" : SITE.address,
  });
  return `https://calendar.google.com/calendar/render?${p.toString()}`;
}
