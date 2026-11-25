import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BookingWizard from "@/components/BookingWizard";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: `Prendre rendez-vous — ${SITE.fullName}`,
  description: `Réservez en ligne une collecte d'empreinte, une prise de teinte, une validation CFAO ou un dépôt au laboratoire ${SITE.fullName}.`,
};

export default async function RendezVousPage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const { service } = await searchParams;
  return (
    <>
      <Header spy={false} />
      <main className="rdv-page">
        <div className="wrap">
          <BookingWizard initialService={service} />
        </div>
      </main>
      <Footer />
    </>
  );
}
