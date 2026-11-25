import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageBooking from "@/components/ManageBooking";

export const metadata = { title: "Gérer mon rendez-vous", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Header spy={false} />
      <main className="rdv-page">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <ManageBooking id={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
