import Link from "next/link";
import AdminBoard from "@/components/AdminBoard";
import { readBookings } from "@/lib/store";
import { SITE } from "@/lib/site";
import { Logo } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = { title: `Admin rendez-vous — ${SITE.fullName}`, robots: { index: false } };

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ key?: string }> }) {
  const { key } = await searchParams;
  const ok = !!process.env.ADMIN_KEY && key === process.env.ADMIN_KEY;

  return (
    <main className="admin">
      <div className="wrap">
        <div className="admin-top">
          <Link href="/" className="brand"><Logo /><b>{SITE.name}<span> {SITE.suffix}</span></b></Link>
          <span className="pill">Espace laboratoire</span>
        </div>
        {ok ? (
          <AdminBoard bookings={await readBookings()} adminKey={key!} />
        ) : (
          <form className="rdv-main" style={{ maxWidth: 440, minHeight: 0 }} method="get">
            <h2>Accès réservé</h2>
            <p className="sub">{process.env.ADMIN_KEY ? "Saisissez la clé d'accès du laboratoire." : "Définissez ADMIN_KEY dans le fichier .env pour activer cet espace."}</p>
            <label className="field">Clé d&apos;accès<input name="key" type="password" autoComplete="current-password" /></label>
            <button className="btn btn-blue" type="submit" style={{ marginTop: 16 }}>Entrer</button>
          </form>
        )}
      </div>
    </main>
  );
}
