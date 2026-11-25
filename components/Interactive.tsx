"use client";
// Petits blocs interactifs de la page d'accueil.
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { DAY_NAMES, OPENING, PHOTOS } from "@/lib/site";
import { nowInLab, dayOfWeek, toLabel } from "@/lib/booking";
import { ArrowLeft, ArrowRight, Check } from "./Icons";

/* ---------- Bandeau de mots en contour ---------- */
export function OutlineMarquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <div className="outline-band" aria-hidden="true">
      <motion.div className="outline-track" animate={{ x: ["0%", "-50%"] }} transition={{ duration: 34, ease: "linear", repeat: Infinity }}>
        {row.map((w, i) => (
          <span key={i} style={{ display: "inline-flex", gap: 40, alignItems: "center" }}>
            <span className="p">+</span>
            <span className="w">{w}</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ---------- Carrousel des prothèses ---------- */
export function SliderControls({ targetId }: { targetId: string }) {
  const go = (dir: number) => {
    const track = document.getElementById(targetId);
    const card = track?.querySelector<HTMLElement>(".svc");
    if (track && card) track.scrollBy({ left: dir * (card.offsetWidth + 20), behavior: "smooth" });
  };
  return (
    <div className="slider-ctrl">
      <button type="button" aria-label="Précédent" onClick={() => go(-1)}><ArrowLeft size={18} /></button>
      <button type="button" aria-label="Suivant" onClick={() => go(1)}><ArrowRight size={18} /></button>
    </div>
  );
}

/* ---------- Onglets du process ---------- */
const STEPS = [
  { tab: "Empreinte", t: "Empreinte classique ou numérique", p: "Nous récupérons l'empreinte à votre cabinet sur rendez-vous, ou vous nous envoyez directement votre fichier STL depuis votre scanner intra-oral.", l: ["Collecte au cabinet sur RDV", "Fichiers STL acceptés", "Bon de commande clair"], img: PHOTOS.castClinic },
  { tab: "Conception", t: "Conception et choix du matériau", p: "Analyse du cas, choix du matériau adapté et, si besoin, validation du design en visio avec le praticien avant fabrication.", l: ["Analyse de chaque cas", "Design CFAO", "Validation en visio"], img: PHOTOS.implant },
  { tab: "Fabrication", t: "Fabrication et contrôle", p: "Usinage, stratification de la céramique et finitions à la main. Chaque pièce est contrôlée avant de quitter le laboratoire.", l: ["Usinage et stratification", "Finitions à la main", "Contrôle qualité systématique"], img: PHOTOS.technician },
  { tab: "Livraison", t: "Livraison au cabinet", p: "Retour au cabinet dans le délai annoncé, la prothèse prête pour l'essayage ou la pose.", l: ["Délai annoncé respecté", "Livraison au cabinet", "Suivi après pose"], img: PHOTOS.boxed },
];

export function ProcessTabs() {
  const [i, setI] = useState(0);
  const s = STEPS[i];
  return (
    <div className="why-grid">
      <div className="tabs" role="tablist" aria-label="Étapes du process">
        {STEPS.map((st, k) => (
          <button key={st.tab} className={`tab${k === i ? " on" : ""}`} role="tab" aria-selected={k === i} onClick={() => setI(k)}>
            {k === i && <motion.span layoutId="tabfill" className="bgfill" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
            <span><span className="n">0{k + 1}</span>&nbsp; {st.tab}</span>
            <span className="arrow-btn"><ArrowRight size={12} /></span>
          </button>
        ))}
      </div>
      <div className="panel" role="tabpanel">
        <AnimatePresence mode="wait">
          <motion.div key={i} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.35 }}>
            <h3>{s.t}</h3>
            <p>{s.p}</p>
            <ul className="ticks">
              {s.l.map((x) => (<li key={x}><i><Check color="#fff" /></i>{x}</li>))}
            </ul>
            <Link className="btn btn-blue" href="/rendez-vous">Prendre rendez-vous</Link>
          </motion.div>
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <motion.div key={s.img} className="photo" style={{ borderRadius: 18, aspectRatio: "4/3.4" }} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45 }}>
            <Image src={s.img} alt={s.t} fill sizes="(max-width: 960px) 100vw, 30vw" style={{ objectFit: "cover" }} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- Compteur animé (chiffres à renseigner) ---------- */
export function Counter({ value, suffix = "", label }: { value: number | null; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    if (inView && value !== null) animate(mv, value, { duration: 2, ease: [0.2, 0.8, 0.2, 1] });
  }, [inView, value, mv]);
  return (
    <div className="stat" ref={ref}>
      {value === null ? <b>[X]{suffix}</b> : <motion.b>{text}</motion.b>}
      <span>{label}</span>
    </div>
  );
}

/* ---------- Cadre « scan » ---------- */
export function ScanFrame() {
  const [v, setV] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setV((x) => (x + 1) % 101), 32);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="scan-frame">
      <div className="photo"><Image src={PHOTOS.castClinic} alt="Modèle dentaire avant numérisation" fill sizes="(max-width: 960px) 100vw, 45vw" style={{ objectFit: "cover" }} /></div>
      <div className="tint" />
      <motion.div className="beam" animate={{ top: ["8%", "92%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }} />
      <span className="corner c1" /><span className="corner c2" /><span className="corner c3" /><span className="corner c4" />
      <div className="readout">Scan en cours · {v}%</div>
    </div>
  );
}

/* ---------- Horaires avec jour courant et statut ouvert / fermé ---------- */
export function OpeningHours() {
  const [now, setNow] = useState<{ date: string; minutes: number } | null>(null);
  useEffect(() => setNow(nowInLab()), []);
  const today = now ? dayOfWeek(now.date) : -1;
  const slot = today >= 0 ? OPENING[today] : null;
  const open = !!(now && slot && now.minutes >= slot[0] && now.minutes < slot[1]);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <div>
      <small>Horaires{now && <> · <span style={{ color: open ? "var(--ok)" : "var(--err)" }}>{open ? "Ouvert maintenant" : "Fermé actuellement"}</span></>}</small>
      <div className="hours">
        {order.map((d) => {
          const h = OPENING[d];
          const cls = d === today ? "today" : "";
          return (
            <span key={d} style={{ display: "contents" }}>
              <span className={cls}>{DAY_NAMES[d]}</span>
              <span className={cls}>{h ? `${toLabel(h[0])} – ${toLabel(h[1])}` : "Fermé"}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
