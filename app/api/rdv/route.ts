import { NextResponse } from "next/server";
import { z } from "zod";
import { availableSlots, dateStatus, addDays, getService, makeRef, nowInLab, RULES, type Booking, type ServiceId } from "@/lib/booking";
import { mutate, readBookings } from "@/lib/store";

export const dynamic = "force-dynamic";

const serviceIds = ["collecte", "teinte", "depot", "visio"] as const;

// GET /api/rdv?service=collecte&date=2026-12-02   → créneaux d'un jour
// GET /api/rdv?service=collecte&month=2026-12     → disponibilité de chaque jour du mois (calendrier)
export async function GET(req: Request) {
  const url = new URL(req.url);
  const service = url.searchParams.get("service") as ServiceId | null;
  if (!service || !getService(service)) return NextResponse.json({ error: "Service inconnu" }, { status: 400 });
  const bookings = await readBookings();

  const date = url.searchParams.get("date");
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ date, status: dateStatus(date), slots: availableSlots(service, date, bookings) });
  }

  const month = url.searchParams.get("month");
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const days: Record<string, { status: string; free: number }> = {};
    let d = `${month}-01`;
    while (d.startsWith(month)) {
      const status = dateStatus(d);
      days[d] = { status, free: status === "ok" ? availableSlots(service, d, bookings).length : 0 };
      d = addDays(d, 1);
    }
    return NextResponse.json({ month, today: nowInLab().date, maxDate: addDays(nowInLab().date, RULES.maxDaysAhead), days });
  }
  return NextResponse.json({ error: "Paramètre date ou month requis" }, { status: 400 });
}

const schema = z
  .object({
    service: z.enum(serviceIds),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start: z.number().int().min(0).max(24 * 60),
    praticien: z.string().trim().min(2, "Nom du praticien requis").max(80),
    cabinet: z.string().trim().min(2, "Nom du cabinet requis").max(120),
    telephone: z.string().trim().regex(/^(\+212|0)[5-7](\s?\d){8}$/, "Numéro marocain invalide"),
    email: z.string().trim().email("E-mail invalide"),
    adresse: z.string().trim().max(200).optional(),
    patient: z.string().trim().max(80).optional(),
    travail: z.string().trim().min(2).max(80),
    elements: z.number().int().min(1).max(32),
    teinte: z.string().trim().max(20).optional(),
    urgent: z.boolean(),
    notes: z.string().trim().max(1000).optional(),
    website: z.string().max(0).optional(), // champ piège anti-spam
  })
  .refine((v) => v.service !== "collecte" || (v.adresse && v.adresse.length >= 5), {
    message: "Adresse du cabinet requise pour une collecte",
    path: ["adresse"],
  })
  .refine((v) => v.service !== "teinte" || (v.patient && v.patient.length >= 2), {
    message: "Nom du patient requis pour une prise de teinte",
    path: ["patient"],
  });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const i of parsed.error.issues) fields[String(i.path[0])] = i.message;
    return NextResponse.json({ error: "Certains champs sont à corriger", fields }, { status: 422 });
  }
  const v = parsed.data;
  const service = getService(v.service)!;

  try {
    const booking = await mutate((all) => {
      // Vérification au moment de l'écriture : le créneau est-il toujours libre ?
      if (!availableSlots(v.service, v.date, all).includes(v.start)) throw new Error("SLOT_TAKEN");
      const b: Booking = {
        id: crypto.randomUUID(),
        ref: makeRef(),
        service: v.service,
        date: v.date,
        start: v.start,
        end: v.start + service.duration,
        status: "confirme",
        praticien: v.praticien,
        cabinet: v.cabinet,
        telephone: v.telephone,
        email: v.email,
        adresse: v.adresse,
        patient: v.patient,
        travail: v.travail,
        elements: v.elements,
        teinte: v.teinte,
        urgent: v.urgent,
        notes: v.notes,
        createdAt: new Date().toISOString(),
      };
      return { data: [...all, b], result: b };
    });
    // Ici : envoyer un e-mail / SMS de confirmation (Resend, Brevo, Twilio…).
    return NextResponse.json({ booking }, { status: 201 });
  } catch (e) {
    if ((e as Error).message === "SLOT_TAKEN")
      return NextResponse.json({ error: "Ce créneau vient d'être réservé. Merci d'en choisir un autre." }, { status: 409 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
