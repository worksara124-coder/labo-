"use client";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { PHOTOS, SITE } from "@/lib/site";
import { ArrowRight, Pin } from "./Icons";

const TITLE = "Prothèses dentaires sur mesure, précises et à l'heure.";
const ease = [0.2, 0.8, 0.2, 1] as const;

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "-12%"]);
  const hexRotate = useTransform(scrollYProgress, [0, 1], [0, 25]);

  return (
    <div className="hero-grid" ref={ref}>
      <motion.div
        className="hero-photo photo"
        initial={{ opacity: 0, clipPath: "inset(12% 12% 12% 12% round 22px)" }}
        animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0% round 22px)" }}
        transition={{ duration: 1.2, ease, delay: 0.15 }}
      >
        <motion.div style={{ y: imgY, position: "absolute", inset: 0, height: "115%" }}>
          <Image src={PHOTOS.technician} alt="Prothésiste dentaire concentré sur son établi" fill priority sizes="(max-width: 960px) 100vw, 50vw" style={{ objectFit: "cover" }} />
        </motion.div>
        <a className="hero-tag" href="#contact"><span className="ic"><Pin size={16} /></span>{SITE.address.split(",")[0]}</a>
      </motion.div>

      <motion.div className="hero-blue" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease, delay: 0.25 }}>
        <motion.svg className="hex" viewBox="0 0 520 340" fill="none" aria-hidden="true" style={{ rotate: hexRotate }}>
          <g stroke="#fff" strokeWidth="1.2">
            {[[300, 20], [380, 20], [460, 20], [340, 89], [420, 89], [500, 89], [380, 158], [460, 158], [420, 227]].map(([x, y], i) => (
              <motion.path
                key={i}
                d={`M${x} ${y}l40 23v46l-40 23-40-23V${y + 23}z`}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.6 + i * 0.12, duration: 1.2 }}
              />
            ))}
          </g>
        </motion.svg>
        <motion.span className="pill dark" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          {SITE.tagline} · {SITE.city}
        </motion.span>
        <h1 aria-label={TITLE}>
          {TITLE.split(" ").map((w, i) => (
            <span className="word" key={i} aria-hidden="true">
              <motion.span initial={{ y: "110%" }} animate={{ y: 0 }} transition={{ delay: 0.55 + i * 0.06, duration: 0.8, ease }}>
                {w}&nbsp;
              </motion.span>
            </span>
          ))}
        </h1>
        <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }}>
          Couronnes zircone, céramique, prothèse sur implants et amovible : {SITE.fullName} accompagne les chirurgiens-dentistes, du modèle en plâtre au fichier numérique.
        </motion.p>
        <motion.div className="actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.25, duration: 0.8 }}>
          <Link className="btn btn-dark" href="/rendez-vous">Prendre rendez-vous <ArrowRight /></Link>
          <a className="btn btn-white" href="#protheses">Nos prothèses</a>
        </motion.div>
      </motion.div>
    </div>
  );
}
