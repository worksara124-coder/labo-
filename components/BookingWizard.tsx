"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SERVICES, getService, googleCalendarUrl, toICS, toLabel, type Booking, type ServiceId } from "@/lib/booking";
import { SITE } from "@/lib/site";
import { ArrowLeft, ArrowRight, Calendar, Check, Clock, Pin, SERVICE_ICONS, User } from "./Icons";

type MonthData = { month: string; today: string; maxDate: string; days: Record<string, { status: string; free: number }> };
type Form = {
  praticien: string; cabinet: string; telephone: string; email: string; adresse: string; patient: string;
  travail: string; elements: number; teinte: string; urgent: boolean; notes: string; website: string;
};

const STEPS = ["Prestation", "Date & heure", "Informations", "Confirmation"];
const TRAVAUX = ["Couronne / bridge zircone", "Céramique / facettes", "Prothèse sur implants", "Prothèse amovible", "Gouttière", "Réparation / rebasage", "Autre"];
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const EMPTY: Form = { praticien: "", cabinet: "", telephone: "", email: "", adresse: "", patient: "", travail: TRAVAUX[0], elements: 1, teinte: "", urgent: false, notes: "", website: "" };
const PROFILE_KEY = "alveoProfil";
const fmtLong = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const fmtMonth = (m: string) => new Date(`${m}-15T12:00:00`).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
const shiftMonth = (m: string, n: number) => {
  const [y, mo] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mo - 1 + n, 1));
  return d.toISOString().slice(0, 7);
};
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

export default function BookingWizard({ initialService }: { initialService?: string }) {
  const [step, setStep] = useState(initialService && getService(initialService) ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [service, setService] = useState<ServiceId | null>(getService(initialService ?? "") ? (initialService as ServiceId) : null);
  const [month, setMonth] = useState<string | null>(null);
  const [monthData, setMonthData] = useState<MonthData | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<number[] | null>(null);
  const [start, setStart] = useState<number | null>(null);
  const [form, setForm] = useState<Form>(EMPTY);
  const [remember, setRemember] = useState(true);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Booking | null>(null);

  const svc = service ? getService(service)! : null;

  // Coordonnées du cabinet mémorisées sur cet appareil
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      if (saved) setForm((f) => ({ ...f, ...saved }));
    } catch {}
  }, []);

  // Disponibilités du mois
  const loadMonth = useCallback(async (s: ServiceId, m?: string) => {
    setMonthData(null);
    const target = m ?? new Date().toISOString().slice(0, 7);
    const r = await fetch(`/api/rdv?service=${s}&month=${target}`, { cache: "no-store" });
    const data: MonthData = await r.json();
    setMonth(data.month);
    setMonthData(data);
    return data;
  }, []);

  // Créneaux d'un jour
  const loadSlots = useCallback(async (s: ServiceId, d: string) => {
    setSlots(null);
    const r = await fetch(`/api/rdv?service=${s}&date=${d}`, { cache: "no-store" });
    const data = await r.json();
    setSlots(data.slots ?? []);
  }, []);

  // À l'arrivée sur l'étape 2 : charger le mois et présélectionner le premier jour disponible
  useEffect(() => {
    if (step !== 1 || !service) return;
    let cancel = false;
    (async () => {
      let data = await loadMonth(service, month ?? undefined);
      let first = Object.entries(data.days).find(([d, v]) => v.free > 0 && d >= data.today)?.[0];
      if (!first && !month) {
        data = await loadMonth(service, shiftMonth(data.month, 1));
        first = Object.entries(data.days).find(([, v]) => v.free > 0)?.[0];
      }
      if (cancel) return;
      if (date && data.days[date]?.free) loadSlots(service, date);
      else if (first) { setDate(first); setStart(null); loadSlots(service, first); }
      else { setDate(null); setSlots([]); }
    })();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, service]);

  const grid = useMemo(() => {
    if (!monthData) return [];
    const days = Object.keys(monthData.days);
    const firstDow = (new Date(`${days[0]}T12:00:00`).getDay() + 6) % 7; // lundi = 0
    return [...Array(firstDow).fill(null), ...days];
  }, [monthData]);

  const go = (n: number) => { setDir(n > step ? 1 : -1); setStep(n); setApiError(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const set = <K extends keyof Form>(k: K, v: Form[K]) => { setForm((f) => ({ ...f, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  function validate() {
    const e: Record<string, string> = {};
    if (form.praticien.trim().length < 2) e.praticien = "Indiquez le nom du praticien";
    if (form.cabinet.trim().length < 2) e.cabinet = "Indiquez le nom du cabinet";
    if (!/^(\+212|0)[5-7](\s?\d){8}$/.test(form.telephone.trim())) e.telephone = "Numéro marocain attendu, ex. 06 12 34 56 78";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) e.email = "Adresse e-mail invalide";
    if (service === "collecte" && form.adresse.trim().length < 5) e.adresse = "Adresse du cabinet requise pour la collecte";
    if (service === "teinte" && form.patient.trim().length < 2) e.patient = "Nom du patient requis pour la prise de teinte";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit() {
    if (!service || !date || start === null) return;
    setSending(true);
    setApiError("");
    try {
      const r = await fetch("/api/rdv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, service, date, start, adresse: form.adresse || undefined, patient: form.patient || undefined, teinte: form.teinte || undefined, notes: form.notes || undefined }),
      });
      const data = await r.json();
      if (r.status === 409) {
        setApiError(data.error);
        setStart(null);
        loadSlots(service, date);
        go(1);
        return;
      }
      if (!r.ok) {
        if (data.fields) { setErrors(data.fields); go(2); }
        setApiError(data.error || "Une erreur est survenue.");
        return;
      }
      try {
        if (remember) {
          const { praticien, cabinet, telephone, email, adresse } = form;
          localStorage.setItem(PROFILE_KEY, JSON.stringify({ praticien, cabinet, telephone, email, adresse }));
        } else localStorage.removeItem(PROFILE_KEY);
        const mine = JSON.parse(localStorage.getItem("alveoRdv") || "[]");
        localStorage.setItem("alveoRdv", JSON.stringify([data.booking.id, ...mine].slice(0, 20)));
      } catch {}
      setDone(data.booking);
      setDir(1);
      setStep(4);
    } catch {
      setApiError("Connexion impossible. Vérifiez votre réseau et réessayez.");
    } finally {
      setSending(false);
    }
  }

  function downloadICS() {
    if (!done) return;
    const url = URL.createObjectURL(new Blob([toICS(done)], { type: "text/calendar" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: `rdv-${done.ref}.ics` });
    a.click();
    URL.revokeObjectURL(url);
  }

  const morning = (slots ?? []).filter((s) => s < 13 * 60);
  const afternoon = (slots ?? []).filter((s) => s >= 13 * 60);
  const Icon = svc ? SERVICE_ICONS[svc.id] : Calendar;

  return (
    <div>
      <div className="rdv-head">
        <div>
          <span className="pill">Rendez-vous en ligne</span>
          <h1>Réservez votre créneau</h1>
          <p>Disponibilités en temps réel. Votre rendez-vous est confirmé immédiatement, avec une référence à conserver.</p>
        </div>
        <ol className="stepper" aria-label="Étapes">
          {STEPS.map((s, i) => (
            <li key={s} className={step === i ? "on" : step > i ? "done" : ""} aria-current={step === i ? "step" : undefined}>
              <b>{step > i ? <Check /> : i + 1}</b>{s}
            </li>
          ))}
        </ol>
      </div>

      <div className="rdv-layout">
        <div className="rdv-main">
          {apiError && step < 4 && <div className="alert" role="alert">{apiError}</div>}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={step} custom={dir} variants={slide} initial="enter" animate="center" exit="exit" transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}>
              {/* ÉTAPE 1 — PRESTATION */}
              {step === 0 && (
                <>
                  <h2>Quelle prestation ?</h2>
                  <p className="sub">Chaque prestation a sa durée et ses propres disponibilités.</p>
                  <div className="svc-pick">
                    {SERVICES.map((s) => {
                      const I = SERVICE_ICONS[s.id];
                      return (
                        <motion.button
                          key={s.id}
                          type="button"
                          className={`svc-opt${service === s.id ? " on" : ""}`}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => { if (service !== s.id) { setService(s.id); setDate(null); setStart(null); setMonth(null); } go(1); }}
                        >
                          <span className="top"><span className="ic"><I /></span><span className="dur">{s.duration} min</span></span>
                          <b>{s.title}</b>
                          <span className="d">{s.description}</span>
                          <span className="where">{s.where === "cabinet" ? "À votre cabinet" : s.where === "visio" ? "En visioconférence" : "Au laboratoire"}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* ÉTAPE 2 — DATE & HEURE */}
              {step === 1 && svc && (
                <>
                  <h2>Choisissez une date et une heure</h2>
                  <p className="sub">{svc.title} · {svc.duration} min</p>
                  <div className="cal-wrap">
                    <div>
                      <div className="cal-head">
                        <b>{month ? fmtMonth(month) : "…"}</b>
                        <div className="cal-nav">
                          <button type="button" aria-label="Mois précédent" disabled={!monthData || monthData.month <= monthData.today.slice(0, 7)} onClick={() => month && loadMonth(svc.id, shiftMonth(month, -1))}><ArrowLeft /></button>
                          <button type="button" aria-label="Mois suivant" disabled={!monthData || monthData.month >= monthData.maxDate.slice(0, 7)} onClick={() => month && loadMonth(svc.id, shiftMonth(month, 1))}><ArrowRight /></button>
                        </div>
                      </div>
                      <div className="cal-grid">
                        {DOW.map((d) => <span key={d} className="dow">{d}</span>)}
                        {!monthData
                          ? Array.from({ length: 35 }).map((_, i) => <span key={i} className="skeleton" style={{ height: "auto", aspectRatio: "1/1" }} />)
                          : grid.map((d, i) => {
                              if (!d) return <span key={`e${i}`} />;
                              const info = monthData.days[d];
                              const level = info.free >= 12 ? "hi" : info.free >= 5 ? "mid" : info.free > 0 ? "lo" : "";
                              const label = info.status === "ferie" ? "jour férié" : info.status === "ferme" ? "fermé" : info.free ? `${info.free} créneaux` : "complet";
                              return (
                                <button
                                  key={d}
                                  type="button"
                                  className={`day${d === date ? " on" : ""}${d === monthData.today ? " today" : ""}`}
                                  disabled={!info.free}
                                  aria-label={`${fmtLong(d)} — ${label}`}
                                  aria-pressed={d === date}
                                  onClick={() => { setDate(d); setStart(null); loadSlots(svc.id, d); }}
                                >
                                  {Number(d.slice(8))}
                                  {level && <i className={level} />}
                                </button>
                              );
                            })}
                      </div>
                      <div className="legend">
                        <span><i style={{ background: "var(--ok)" }} />Large choix</span>
                        <span><i style={{ background: "#E8A13A" }} />Quelques créneaux</span>
                        <span><i style={{ background: "var(--err)" }} />Presque complet</span>
                      </div>
                    </div>

                    <div className="slots">
                      {!date ? (
                        <div className="empty">Aucune disponibilité sur cette période. Essayez le mois suivant ou appelez-nous au {SITE.phone}.</div>
                      ) : (
                        <>
                          <h3>{fmtLong(date)}</h3>
                          <p className="sub">{slots ? `${slots.length} créneau${slots.length > 1 ? "x" : ""} disponible${slots.length > 1 ? "s" : ""}` : "Chargement…"}</p>
                          {!slots ? (
                            <div className="slot-grid">{Array.from({ length: 8 }).map((_, i) => <span key={i} className="skeleton" />)}</div>
                          ) : slots.length === 0 ? (
                            <div className="empty">Plus de créneau ce jour-là. Choisissez une autre date.</div>
                          ) : (
                            [["Matin", morning], ["Après-midi", afternoon]].map(([label, list]) =>
                              (list as number[]).length ? (
                                <div className="slot-group" key={label as string}>
                                  <small>{label as string}</small>
                                  <div className="slot-grid">
                                    {(list as number[]).map((t, i) => (
                                      <motion.button
                                        key={t}
                                        type="button"
                                        className={`slot${start === t ? " on" : ""}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        aria-pressed={start === t}
                                        onClick={() => setStart(t)}
                                      >
                                        {toLabel(t)}
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                            )
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="wiz-actions">
                    <button type="button" className="btn btn-line" onClick={() => go(0)}><ArrowLeft /> Prestation</button>
                    <button type="button" className="btn btn-blue" disabled={start === null} onClick={() => go(2)}>Continuer <ArrowRight /></button>
                  </div>
                </>
              )}

              {/* ÉTAPE 3 — INFORMATIONS */}
              {step === 2 && svc && (
                <form onSubmit={(e) => { e.preventDefault(); if (validate()) go(3); }} noValidate>
                  <h2>Vos informations</h2>
                  <p className="sub">Elles servent à confirmer le rendez-vous et préparer votre cas.</p>
                  <div className="form-grid">
                    <Field label="Praticien" error={errors.praticien}><input autoComplete="name" value={form.praticien} onChange={(e) => set("praticien", e.target.value)} placeholder="Dr Nom Prénom" /></Field>
                    <Field label="Cabinet" error={errors.cabinet}><input autoComplete="organization" value={form.cabinet} onChange={(e) => set("cabinet", e.target.value)} placeholder="Cabinet dentaire ..." /></Field>
                    <Field label="Téléphone" error={errors.telephone}><input type="tel" autoComplete="tel" value={form.telephone} onChange={(e) => set("telephone", e.target.value)} placeholder="06 12 34 56 78" /></Field>
                    <Field label="E-mail" error={errors.email}><input type="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="cabinet@exemple.ma" /></Field>
                    {svc.id === "collecte" && (
                      <Field label="Adresse du cabinet (collecte)" error={errors.adresse} full><input autoComplete="street-address" value={form.adresse} onChange={(e) => set("adresse", e.target.value)} placeholder="Rue, quartier, étage…" /></Field>
                    )}
                    {svc.id === "teinte" && (
                      <Field label="Nom du patient" error={errors.patient} full hint="Le patient se présentera au laboratoire."><input value={form.patient} onChange={(e) => set("patient", e.target.value)} placeholder="Nom du patient" /></Field>
                    )}
                    <Field label="Type de travail">
                      <select value={form.travail} onChange={(e) => set("travail", e.target.value)}>{TRAVAUX.map((t) => <option key={t}>{t}</option>)}</select>
                    </Field>
                    <Field label="Nombre d'éléments" group>
                      <div className="counter">
                        <button type="button" aria-label="Moins" onClick={() => set("elements", Math.max(1, form.elements - 1))}>−</button>
                        <span aria-live="polite">{form.elements}</span>
                        <button type="button" aria-label="Plus" onClick={() => set("elements", Math.min(32, form.elements + 1))}>+</button>
                      </div>
                    </Field>
                    <Field label="Teinte (VITA)" hint="Facultatif"><input value={form.teinte} onChange={(e) => set("teinte", e.target.value)} placeholder="A2, B1…" /></Field>
                    <Field label="Urgence" group>
                      <label className="toggle">
                        <span><b>Cas urgent</b><small>Traitement prioritaire</small></span>
                        <input type="checkbox" checked={form.urgent} onChange={(e) => set("urgent", e.target.checked)} />
                        <span className="switch" aria-hidden="true" />
                      </label>
                    </Field>
                    <Field label="Précisions" full hint="Dents concernées, matériau souhaité, remarques…"><textarea rows={3} value={form.notes} onChange={(e) => set("notes", e.target.value)} /></Field>
                    <input type="text" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} style={{ position: "absolute", left: -9999, opacity: 0 }} aria-hidden="true" />
                  </div>
                  <label className="consent"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />Mémoriser les coordonnées de mon cabinet sur cet appareil.</label>
                  <div className="wiz-actions">
                    <button type="button" className="btn btn-line" onClick={() => go(1)}><ArrowLeft /> Créneau</button>
                    <button type="submit" className="btn btn-blue">Vérifier <ArrowRight /></button>
                  </div>
                </form>
              )}

              {/* ÉTAPE 4 — RÉCAPITULATIF */}
              {step === 3 && svc && date && start !== null && (
                <>
                  <h2>Vérifiez et confirmez</h2>
                  <p className="sub">Un dernier coup d&apos;œil avant de réserver.</p>
                  <div className="recap">
                    <div><small>Prestation</small><b>{svc.title}</b></div>
                    <div><small>Date et heure</small><b style={{ textTransform: "capitalize" }}>{fmtLong(date)} · {toLabel(start)} – {toLabel(start + svc.duration)}</b></div>
                    <div><small>Praticien</small><b>{form.praticien}</b></div>
                    <div><small>Cabinet</small><b>{form.cabinet}</b></div>
                    <div><small>Contact</small><b>{form.telephone} · {form.email}</b></div>
                    <div><small>Travail</small><b>{form.travail} · {form.elements} élément{form.elements > 1 ? "s" : ""}{form.teinte && ` · ${form.teinte}`}</b></div>
                    {form.adresse && svc.id === "collecte" && <div className="full"><small>Adresse de collecte</small><b>{form.adresse}</b></div>}
                    {form.patient && svc.id === "teinte" && <div><small>Patient</small><b>{form.patient}</b></div>}
                    {form.urgent && <div><small>Priorité</small><b style={{ color: "#9A5B00" }}>Cas urgent</b></div>}
                    {form.notes && <div className="full"><small>Précisions</small><b style={{ fontWeight: 400 }}>{form.notes}</b></div>}
                  </div>
                  <label className="consent"><input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />J&apos;accepte que {SITE.fullName} utilise ces informations pour gérer ce rendez-vous et me contacter à son sujet.</label>
                  <div className="wiz-actions">
                    <button type="button" className="btn btn-line" onClick={() => go(2)}><ArrowLeft /> Modifier</button>
                    <button type="button" className="btn btn-blue" disabled={!consent || sending} onClick={submit}>{sending ? "Réservation…" : "Confirmer le rendez-vous"} {!sending && <Check size={16} />}</button>
                  </div>
                </>
              )}

              {/* SUCCÈS */}
              {step === 4 && done && (
                <div className="success">
                  <motion.div className="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 16 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.25, duration: 0.5 }} />
                    </svg>
                  </motion.div>
                  <h2>Rendez-vous confirmé</h2>
                  <p className="sub" style={{ marginTop: 8, textTransform: "capitalize" }}>{getService(done.service)!.title} · {fmtLong(done.date)} à {toLabel(done.start)}</p>
                  <div className="ref" aria-label="Référence">{done.ref}</div>
                  <p className="sub">Conservez cette référence. Vous pouvez annuler en ligne jusqu&apos;à l&apos;heure du rendez-vous.</p>
                  <div className="acts">
                    <button type="button" className="btn btn-blue" onClick={downloadICS}><Calendar /> Ajouter à mon agenda (.ics)</button>
                    <a className="btn btn-line" href={googleCalendarUrl(done)} target="_blank" rel="noreferrer">Google Agenda</a>
                    <Link className="btn btn-line" href={`/rendez-vous/${done.id}`}>Gérer mon rendez-vous</Link>
                  </div>
                  <div className="acts">
                    <button type="button" className="btn btn-dark" onClick={() => { setDone(null); setStart(null); setConsent(false); setDate(null); setMonth(null); setStep(0); }}>Réserver un autre créneau</button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RÉSUMÉ */}
        <aside className="summary" aria-label="Récapitulatif">
          <h3>Votre rendez-vous</h3>
          <div className="row"><span className="ic"><Icon size={18} /></span><div><small>Prestation</small><b>{svc ? svc.title : "À choisir"}</b></div></div>
          <div className="row"><span className="ic"><Calendar /></span><div><small>Date</small><b style={{ textTransform: "capitalize" }}>{date ? fmtLong(date) : "—"}</b></div></div>
          <div className="row"><span className="ic"><Clock /></span><div><small>Heure</small><b>{start !== null && svc ? `${toLabel(start)} – ${toLabel(start + svc.duration)}` : "—"}</b></div></div>
          <div className="row"><span className="ic"><Pin /></span><div><small>Lieu</small><b>{!svc ? "—" : svc.where === "cabinet" ? form.adresse || "Votre cabinet" : svc.where === "visio" ? "Visioconférence (lien envoyé)" : SITE.address}</b></div></div>
          <div className="row" style={{ borderBottom: 0 }}><span className="ic"><User /></span><div><small>Praticien</small><b>{form.praticien || "—"}</b></div></div>
          <p className="help">Besoin d&apos;aide ? Appelez le <a href={SITE.phoneHref}>{SITE.phone}</a>.<br />Créneaux calculés selon nos horaires et la disponibilité de l&apos;équipe.</p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, error, hint, full, group, children }: { label: string; error?: string; hint?: string; full?: boolean; group?: boolean; children: React.ReactNode }) {
  const Tag = group ? "div" : "label"; // « group » : le contenu a ses propres contrôles/libellés
  return (
    <Tag className={`field${error ? " err" : ""}${full ? " full" : ""}`}>
      {group ? <span>{label}</span> : label}
      {children}
      {error ? <span className="msg" role="alert">{error}</span> : hint ? <span className="hint">{hint}</span> : null}
    </Tag>
  );
}
