"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { SITE } from "@/lib/site";

const TOOTH =
  "M60 20C40 20 22 34 22 62c0 30 12 48 18 78 6 32 10 65 26 65 18 0 16-45 34-45s16 45 34 45c16 0 20-33 26-65 6-30 18-48 18-78 0-28-18-42-38-42-18 0-26 10-40 10S78 20 60 20z";
const STAGES = ["01 — Empreinte", "02 — Conception", "03 — Fabrication", "04 — Livraison"];
const DURATION = 5600;
const ease = [0.6, 0, 0.2, 1] as const;

/** Intro « scan dentaire » jouée une fois par session, puis elle remonte pour révéler le site. */
export default function Intro() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState<boolean | null>(null);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("alveoIntro") === "1";
    } catch {}
    setShow(!seen && !reduce);
  }, [reduce]);

  useEffect(() => {
    if (!show) {
      document.body.classList.remove("locked");
      return;
    }
    document.body.classList.add("locked");
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(100, Math.round((now - start) / 32));
      setPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const t = setTimeout(close, DURATION);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, [show]);

  function close() {
    try {
      sessionStorage.setItem("alveoIntro", "1");
    } catch {}
    setShow(false);
  }

  const stage = STAGES[pct < 25 ? 0 : pct < 55 ? 1 : pct < 85 ? 2 : 3];
  const letters = SITE.name.split("");

  return (
    <AnimatePresence>
      {show === null && (
        // Couverture affichée le temps de savoir si l'intro doit être jouée (évite un flash du site).
        <motion.div key="cover" className="intro" exit={{ opacity: 0, transition: { duration: 0.35 } }} />
      )}
      {show && (
        <motion.div
          key="intro"
          className="intro"
          aria-label="Introduction animée"
          initial={{ y: 0 }}
          exit={{ y: "-100%", transition: { duration: 0.9, ease: [0.7, 0, 0.2, 1] } }}
        >
          <div className="intro-hud top">
            <span>{SITE.fullName} · {SITE.city}</span>
            <button className="skip" type="button" onClick={close}>Passer l&apos;intro</button>
          </div>

          <div className="intro-center">
            <motion.div
              className="tooth"
              initial={{ y: 0, scale: 1 }}
              animate={{ y: -36, scale: 0.6 }}
              transition={{ delay: 3.3, duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
            >
              <svg width="220" height="240" viewBox="0 0 200 220" fill="none" aria-hidden="true">
                <defs>
                  <clipPath id="toothClip"><path d={TOOTH} /></clipPath>
                </defs>
                <motion.path d={TOOTH} fill="#2E6BF6" initial={{ fillOpacity: 0 }} animate={{ fillOpacity: 0.28 }} transition={{ delay: 2.7, duration: 0.8 }} />
                <g clipPath="url(#toothClip)" stroke="#5B8CFF" strokeWidth={0.8} strokeOpacity={0.7}>
                  {[45, 65, 85, 105, 125, 145, 165, 185].map((y, i) => (
                    <motion.path key={y} d={`M0 ${y}H200`} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.8 + i * 0.08, duration: 0.9 }} />
                  ))}
                  {[70, 100, 130].map((x, i) => (
                    <motion.path key={x} d={`M${x} 0V220`} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2 + i * 0.1, duration: 1 }} />
                  ))}
                </g>
                <motion.path d={TOOTH} stroke="#fff" strokeWidth={2} strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.1, duration: 1.6, ease }} />
              </svg>
              <motion.div
                className="scanline"
                initial={{ top: "0%", opacity: 0 }}
                animate={{ top: ["0%", "10%", "90%", "100%"], opacity: [0, 1, 1, 0] }}
                transition={{ delay: 1.6, duration: 1.3, ease: "easeInOut" }}
              />
            </motion.div>

            <div className="logo-letters" aria-label={SITE.fullName}>
              {letters.map((c, i) => (
                <span key={i}>
                  <motion.i initial={{ y: "115%" }} animate={{ y: 0 }} transition={{ delay: 3.5 + i * 0.08, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>{c}</motion.i>
                </span>
              ))}
              <span>
                <motion.i className="lab" initial={{ y: "115%" }} animate={{ y: 0 }} transition={{ delay: 3.5 + letters.length * 0.08, duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}>{SITE.suffix}</motion.i>
              </span>
            </div>
            <motion.p className="intro-tag" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 4.3, duration: 0.8 }}>
              {SITE.tagline}
            </motion.p>
          </div>

          <div className="intro-hud bottom">
            <div className="row"><span>{stage}</span><span>{pct}%</span></div>
            <div className="intro-bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
