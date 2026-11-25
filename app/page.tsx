import Image from "next/image";
import Link from "next/link";
import Intro from "@/components/Intro";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { Reveal, RevealItem, Stagger } from "@/components/Reveal";
import { Counter, OpeningHours, OutlineMarquee, ProcessTabs, ScanFrame, SliderControls } from "@/components/Interactive";
import { ArrowRight, ArrowUpRight, Check, Clock, Denture, Guard, Implant, Phone, Pin, Screen, Shield, SERVICE_ICONS, Tooth, Truck } from "@/components/Icons";
import { PHOTOS, SITE } from "@/lib/site";
import { SERVICES } from "@/lib/booking";

const FEATURES = [
  { icon: Tooth, title: "Zircone & céramique", text: "Couronnes, bridges et facettes, teinte travaillée au plus près de la dent naturelle.", href: "#protheses" },
  { icon: Implant, title: "Implantologie", text: "Couronnes transvissées ou scellées, piliers personnalisés, tous systèmes courants.", href: "#protheses" },
  { icon: Denture, title: "Prothèse amovible", text: "Complète, partielle résine ou stellite, réparations et rebasages rapides.", href: "#protheses" },
  { icon: Screen, title: "Flux numérique", text: "Vos empreintes optiques en STL, conception CFAO et usinage au laboratoire.", href: "#numerique" },
];

const PROSTHESES = [
  { title: "Couronnes & bridges zircone", text: "Zircone monolithique ou stratifiée, résistante et esthétique, antérieur et postérieur.", img: PHOTOS.cast },
  { title: "Prothèse sur implants", text: "Couronnes et bridges transvissés ou scellés, piliers personnalisés.", img: PHOTOS.implant },
  { title: "Prothèse amovible", text: "Complète, partielle résine ou stellite, réparations et rebasages rapides.", img: PHOTOS.dentures },
  { title: "Céramique & facettes", text: "Céramo-métallique, disilicate de lithium, facettes à la teinte naturelle.", img: PHOTOS.boxed },
  { title: "Gouttières", text: "Bruxisme, contention et blanchiment, fabriquées sur mesure à partir de votre empreinte.", icon: Guard },
  { title: "Conception CFAO", text: "Réception de vos fichiers STL, design numérique validé avec vous, puis usinage.", icon: Screen },
];

export default function Home() {
  return (
    <>
      <Intro />
      <Header />
      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <Hero />
            <Stagger className="features" gap={0.1}>
              {FEATURES.map((f) => (
                <RevealItem key={f.title} whileHover={{ y: -6 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
                  <a className="feat" href={f.href}>
                    <div className="feat-top"><span className="feat-ic"><f.icon /></span><h3>{f.title}</h3></div>
                    <p>{f.text}</p>
                    <span className="arrow-btn"><ArrowUpRight /></span>
                  </a>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* LE LABORATOIRE */}
        <section id="laboratoire">
          <div className="wrap about-grid">
            <Reveal className="about-visual">
              <div className="dots" />
              <div className="main photo"><Image src={PHOTOS.cast} alt="Modèle dentaire en plâtre tenu par une main gantée" fill sizes="(max-width: 960px) 100vw, 45vw" style={{ objectFit: "cover" }} /></div>
              <Reveal className="small photo" delay={0.3} y={60}><Image src={PHOTOS.implant} alt="Implant dentaire sur modèle" fill sizes="25vw" style={{ objectFit: "cover" }} /></Reveal>
            </Reveal>
            <Reveal delay={0.1}>
              <span className="pill">Le laboratoire</span>
              <h2 className="sec-title">Des prothèses précises, livrées dans les délais promis.</h2>
              <p className="lead">Installé au {SITE.address.replace(", 20100", "")}, {SITE.fullName} fabrique les prothèses dentaires des cabinets de la ville. Chaque cas est suivi de l&apos;empreinte à la livraison, avec un interlocuteur joignable pour le praticien.</p>
              <div className="mini-feats">
                <div className="mini"><span className="ic"><Shield /></span><div><b>Contrôle qualité</b><span>Chaque pièce vérifiée avant son départ du laboratoire.</span></div></div>
                <div className="mini"><span className="ic"><Truck /></span><div><b>Collecte sur RDV</b><span>Réservez en ligne le passage du coursier à votre cabinet.</span></div></div>
              </div>
              <a className="btn btn-line" href="#process">Notre process <ArrowRight /></a>
            </Reveal>
          </div>
        </section>

        <OutlineMarquee words={["Précision", "Zircone", "Céramique", "Implants", "CFAO"]} />

        {/* PROTHÈSES */}
        <section id="protheses" className="dark">
          <div className="wrap">
            <Reveal className="dark-head">
              <div><span className="pill dark">Nos prothèses</span><h2 className="sec-title">Un savoir-faire fiable pour tous vos cas.</h2></div>
              <SliderControls targetId="track" />
            </Reveal>
            <Stagger className="svc-track" id="track" gap={0.08}>
              {PROSTHESES.map((p) => (
                <RevealItem key={p.title} className="svc">
                  {p.img && <div className="photo"><Image src={p.img} alt={p.title} fill sizes="(max-width: 600px) 86vw, (max-width: 1100px) 50vw, 25vw" style={{ objectFit: "cover" }} /></div>}
                  <div className="svc-body">
                    {p.icon && <span className="ic"><p.icon /></span>}
                    <h3>{p.title}</h3>
                    <p>{p.text}</p>
                    <Link className="arrow-btn blue" href="/rendez-vous" aria-label={`Prendre rendez-vous : ${p.title}`}><ArrowRight size={14} /></Link>
                  </div>
                </RevealItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* PROCESS */}
        <section id="process" className="why">
          <div className="wrap">
            <Reveal><span className="pill">Notre process</span><h2 className="sec-title">De l&apos;empreinte à la pose, quatre étapes claires.</h2></Reveal>
            <Reveal delay={0.1}><ProcessTabs /></Reveal>
            <Reveal className="stats">
              {/* Remplacer null par les vrais chiffres du laboratoire */}
              <Counter value={null} suffix="+" label="Années d'expérience" />
              <Counter value={null} suffix="+" label="Cabinets partenaires" />
              <Counter value={null} suffix="k" label="Prothèses livrées" />
              <Counter value={null} suffix=" j" label="Délai moyen couronne" />
            </Reveal>
          </div>
        </section>

        {/* RENDEZ-VOUS */}
        <section id="rendez-vous" style={{ paddingTop: 0 }}>
          <div className="wrap rdv-teaser">
            <Reveal className="rdv-photo photo">
              <Image src={PHOTOS.boxed} alt="Prothèse dentaire présentée dans un boîtier" fill sizes="(max-width: 960px) 100vw, 45vw" style={{ objectFit: "cover" }} />
              <div className="badge"><span className="ic"><Phone size={20} /></span><div><b>Cas urgent ?</b><small>Appelez le <a href={SITE.phoneHref} style={{ fontWeight: 600 }}>{SITE.phone}</a></small></div></div>
            </Reveal>
            <Reveal className="rdv-card" delay={0.1}>
              <span className="pill dark">Rendez-vous en ligne</span>
              <h2>Réservez un créneau en moins d&apos;une minute.</h2>
              <p>Disponibilités en temps réel, confirmation immédiate avec référence, ajout à votre agenda et annulation en ligne.</p>
              <div className="rdv-types">
                {SERVICES.map((s) => {
                  const I = SERVICE_ICONS[s.id];
                  return (
                    <Link key={s.id} className="rdv-type" href={`/rendez-vous?service=${s.id}`}>
                      <span className="ic"><I size={20} /></span>
                      <span><b>{s.short}</b><small>{s.duration} min · {s.where === "cabinet" ? "à votre cabinet" : s.where === "visio" ? "en visio" : "au laboratoire"}</small></span>
                    </Link>
                  );
                })}
              </div>
              <Link className="btn btn-blue" href="/rendez-vous" style={{ alignSelf: "flex-start" }}>Voir les disponibilités <ArrowRight /></Link>
            </Reveal>
          </div>
        </section>

        {/* NUMÉRIQUE */}
        <section id="numerique" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <Reveal className="digital">
              <div>
                <span className="pill">Flux numérique</span>
                <h2 className="sec-title">Vous scannez, nous concevons.</h2>
                <p>Envoyez vos empreintes intra-orales en STL : conception CFAO et usinage au laboratoire, sans modèle physique ni déplacement. Un doute sur le design ? Réservez une validation en visio.</p>
                <ul className="ticks">
                  <li><i><Check color="#fff" /></i>Fichiers acceptés : [STL, PLY — scanners compatibles]</li>
                  <li><i><Check color="#fff" /></i>Validation du design avant fabrication</li>
                  <li><i><Check color="#fff" /></i>Empreintes classiques toujours acceptées</li>
                </ul>
              </div>
              <ScanFrame />
            </Reveal>
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" style={{ paddingTop: 0 }}>
          <div className="wrap contact-grid">
            <Reveal className="contact-card">
              <span className="pill">Contact</span>
              <h2 className="sec-title" style={{ marginBottom: 12 }}>Nous trouver</h2>
              <div className="info"><span className="ic"><Pin size={20} /></span><div><small>Adresse</small><span className="v">{SITE.address}</span></div></div>
              <div className="info"><span className="ic"><Phone size={20} /></span><div><small>Téléphone</small><a className="v" href={SITE.phoneHref}>{SITE.phone}</a></div></div>
              <div className="info" style={{ borderBottom: 0 }}><span className="ic"><Clock size={20} /></span><OpeningHours /></div>
            </Reveal>
            <Reveal className="map" delay={0.1}>
              <iframe title={`Carte : ${SITE.fullName}, ${SITE.address}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={SITE.mapEmbed} />
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
