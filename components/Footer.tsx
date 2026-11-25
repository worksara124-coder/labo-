import Link from "next/link";
import { SITE } from "@/lib/site";
import { ArrowRight } from "./Icons";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="foot">
          <div className="foot-top">
            <h3>Un cas à confier ? Réservez votre créneau en ligne.</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              <Link className="btn btn-blue" href="/rendez-vous">Prendre rendez-vous <ArrowRight /></Link>
              <a className="btn btn-ghost-dark" href={SITE.phoneHref}>{SITE.phone}</a>
            </div>
          </div>
          <div className="foot-cols">
            <div>
              <Link href="/" className="brand" style={{ color: "#fff" }}><b>{SITE.name}<span> {SITE.suffix}</span></b></Link>
              <p>{SITE.tagline} au service des chirurgiens-dentistes de {SITE.city}.</p>
            </div>
            <div><h4>Prothèses</h4><a href="/#protheses">Zircone & céramique</a><a href="/#protheses">Sur implants</a><a href="/#protheses">Amovible</a><a href="/#protheses">Gouttières</a></div>
            <div><h4>Laboratoire</h4><a href="/#laboratoire">Qui sommes-nous</a><a href="/#process">Notre process</a><a href="/#numerique">Flux numérique</a><Link href="/rendez-vous">Rendez-vous</Link></div>
            <div><h4>Contact</h4><a href="/#contact">{SITE.address}</a><a href={SITE.phoneHref}>{SITE.phone}</a><a href="/#contact">Lun – Ven 9h – 19h · Sam 9h – 12h30</a></div>
          </div>
          <div className="foot-bottom">
            <span>© {new Date().getFullYear()} {SITE.fullName} · Site réalisé par <a href="https://syo-web.com">SYO WEB</a></span>
            <span>Photos : ONUR KURT, Quang Tri NGUYEN, Ozkan Guner (Unsplash) · Pexels</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
