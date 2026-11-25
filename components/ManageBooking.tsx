"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getService, googleCalendarUrl, nowInLab, toICS, toLabel, type Booking } from "@/lib/booking";
import { SITE } from "@/lib/site";
import { ArrowRight, Calendar } from "./Icons";

const fmtLong = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

export default function ManageBooking({ id }: { id: string }) {
  const [b, setB] = useState<Booking | null>(null);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/rdv/${id}`, { cache: "no-store" })
      .then(async (r) => (r.ok ? setB((await r.json()).booking) : setErr("Rendez-vous introuvable. Vérifiez le lien reçu.")))
      .catch(() => setErr("Connexion impossible."));
  }, [id]);

  async function cancel() {
    setBusy(true);
    const r = await fetch(`/api/rdv/${id}`, { method: "DELETE" });
    const data = await r.json();
    setBusy(false);
    setConfirm(false);
    if (r.ok) setB(data.booking);
    else setErr(data.error);
  }

  if (err && !b) return <div className="rdv-main"><h2>Oups</h2><p className="sub">{err}</p><Link className="btn btn-blue" href="/rendez-vous">Prendre un rendez-vous</Link></div>;
  if (!b) return <div className="rdv-main"><div className="skeleton" style={{ height: 32, width: "50%", marginBottom: 16 }} /><div className="skeleton" style={{ height: 180 }} /></div>;

  const s = getService(b.service)!;
  const now = nowInLab();
  const past = b.date < now.date || (b.date === now.date && b.start <= now.minutes);
  const ics = () => {
    const url = URL.createObjectURL(new Blob([toICS(b)], { type: "text/calendar" }));
    Object.assign(document.createElement("a"), { href: url, download: `rdv-${b.ref}.ics` }).click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rdv-main">
      <span className={`tag${b.status === "annule" ? " annule" : ""}`}>{b.status === "annule" ? "Annulé" : past ? "Passé" : "Confirmé"}</span>
      <h2 style={{ marginTop: 14 }}>{s.title}</h2>
      <p className="sub" style={{ textTransform: "capitalize" }}>{fmtLong(b.date)} · {toLabel(b.start)} – {toLabel(b.end)}</p>
      {err && <div className="alert">{err}</div>}
      <div className="recap">
        <div><small>Référence</small><b style={{ fontFamily: "var(--font-mono)" }}>{b.ref}</b></div>
        <div><small>Lieu</small><b>{s.where === "cabinet" ? b.adresse : s.where === "visio" ? "Visioconférence" : SITE.address}</b></div>
        <div><small>Praticien</small><b>{b.praticien}</b></div>
        <div><small>Cabinet</small><b>{b.cabinet}</b></div>
        <div><small>Travail</small><b>{b.travail} · {b.elements} élément{b.elements > 1 ? "s" : ""}</b></div>
        <div><small>Contact</small><b>{b.telephone}</b></div>
      </div>
      {b.status === "confirme" && !past && (
        <div className="wiz-actions" style={{ flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-line" type="button" onClick={ics}><Calendar /> .ics</button>
            <a className="btn btn-line" href={googleCalendarUrl(b)} target="_blank" rel="noreferrer">Google Agenda</a>
          </div>
          {!confirm ? (
            <button className="btn btn-dark" type="button" onClick={() => setConfirm(true)}>Annuler ce rendez-vous</button>
          ) : (
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 14 }}>Confirmer l&apos;annulation ?</span>
              <button className="btn btn-line" type="button" onClick={() => setConfirm(false)}>Non</button>
              <button className="btn btn-dark" type="button" disabled={busy} onClick={cancel} style={{ background: "var(--err)" }}>{busy ? "…" : "Oui, annuler"}</button>
            </div>
          )}
        </div>
      )}
      {b.status === "annule" && (
        <div className="wiz-actions"><span className="sub" style={{ margin: 0 }}>Ce créneau a été libéré.</span><Link className="btn btn-blue" href={`/rendez-vous?service=${b.service}`}>Reprendre un créneau <ArrowRight /></Link></div>
      )}
    </div>
  );
}
