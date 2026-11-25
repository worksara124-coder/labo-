"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";
import { ArrowRight, Close, Logo, Menu, Phone } from "./Icons";

const LINKS = [
  { href: "/#top", id: "top", label: "Accueil" },
  { href: "/#laboratoire", id: "laboratoire", label: "Le laboratoire" },
  { href: "/#protheses", id: "protheses", label: "Prothèses" },
  { href: "/#process", id: "process", label: "Process" },
  { href: "/#numerique", id: "numerique", label: "Numérique" },
  { href: "/#contact", id: "contact", label: "Contact" },
];

export default function Header({ spy = true }: { spy?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("top");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (!spy) return () => window.removeEventListener("scroll", onScroll);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, [spy]);

  return (
    <header className="header">
      <div className="wrap">
        <div className={`nav${scrolled ? " scrolled" : ""}`}>
          <Link href="/" className="brand" aria-label={`${SITE.fullName}, accueil`}>
            <Logo />
            <b>{SITE.name}<span> {SITE.suffix}</span></b>
          </Link>
          <nav className={`menu${open ? " open" : ""}`} aria-label="Navigation principale">
            {LINKS.map((l) => (
              <a key={l.id} href={l.href} className={spy && active === l.id ? "active" : ""} onClick={() => setOpen(false)}>
                {l.label}
              </a>
            ))}
          </nav>
          <div className="nav-cta">
            <a className="tel-chip" href={SITE.phoneHref}>
              <span className="ic"><Phone /></span>
              <span>{SITE.phone}</span>
            </a>
            <Link className="btn btn-dark" href="/rendez-vous">Prendre RDV <ArrowRight /></Link>
            <button className="burger" type="button" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
              {open ? <Close /> : <Menu />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
