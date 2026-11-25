import { NextResponse } from "next/server";
import { mutate, readBookings } from "@/lib/store";
import { nowInLab } from "@/lib/booking";

export const dynamic = "force-dynamic";

// GET /api/rdv/:id → détail d'un RDV (lien « Gérer mon rendez-vous »)
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const b = (await readBookings()).find((x) => x.id === id);
  if (!b) return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  return NextResponse.json({ booking: b });
}

// DELETE /api/rdv/:id → annulation (par le praticien, ou par l'admin avec l'en-tête x-admin-key)
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const isAdmin = !!process.env.ADMIN_KEY && req.headers.get("x-admin-key") === process.env.ADMIN_KEY;
  try {
    const booking = await mutate((all) => {
      const b = all.find((x) => x.id === id);
      if (!b) throw new Error("NOT_FOUND");
      const now = nowInLab();
      const started = b.date < now.date || (b.date === now.date && b.start <= now.minutes);
      if (started && !isAdmin) throw new Error("TOO_LATE");
      const updated = { ...b, status: "annule" as const };
      return { data: all.map((x) => (x.id === id ? updated : x)), result: updated };
    });
    return NextResponse.json({ booking });
  } catch (e) {
    const m = (e as Error).message;
    if (m === "NOT_FOUND") return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    if (m === "TOO_LATE") return NextResponse.json({ error: "Ce rendez-vous est passé, il ne peut plus être annulé en ligne." }, { status: 400 });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
