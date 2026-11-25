"use client";
import { useMemo, useState } from "react";
import { SERVICES, getService, nowInLab, toLabel, type Booking } from "@/lib/booking";

const fmt = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });

export default function AdminBoard({ bookings, adminKey }: { bookings: Booking[]; adminKey: string }) {
  const [list, setList] = useState(bookings);
  const [filter, setFilter] = useState<"avenir" | "aujourdhui" | "tous" | "annules">("avenir");
  const [service, setService] = useState<string>("tous");
  const [q, setQ] = useState("");
  const today = nowInLab().date;

  const view = useMemo(() => {
    return list
      .filter((b) =>
        filter === "annules" ? b.status === "annule" :
        filter === "aujourdhui" ? b.date === today && b.status === "confirme" :
        filter === "avenir" ? b.date >= today && b.status === "confirme" : true)
      .filter((b) => service === "tous" || b.service === service)
      .filter((b) => !q || `${b.ref} ${b.praticien} ${b.cabinet} ${b.telephone}`.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => (a.date + String(a.start).padStart(4, "0")).localeCompare(b.date + String(b.start).padStart(4, "0")));
  }, [list, filter, service, q, today]);

  const kpi = {
    today: list.filter((b) => b.date === today && b.status === "confirme").length,
    upcoming: list.filter((b) => b.date >= today && b.status === "confirme").length,
    urgent: list.filter((b) => b.date >= today && b.status === "confirme" && b.urgent).length,
    cancelled: list.filter((b) => b.status === "annule").length,
  };

  async function cancel(id: string) {
    if (!confirm("Annuler ce rendez-vous ?")) return;
    const r = await fetch(`/api/rdv/${id}`, { method: "DELETE", headers: { "x-admin-key": adminKey } });
    if (r.ok) {
      const { booking } = await r.json();
      setList((l) => l.map((b) => (b.id === id ? booking : b)));
    }
  }

  function exportCSV() {
    const head = ["Référence", "Date", "Début", "Fin", "Prestation", "Statut", "Praticien", "Cabinet", "Téléphone", "E-mail", "Adresse", "Patient", "Travail", "Éléments", "Teinte", "Urgent", "Notes"];
    const rows = view.map((b) => [b.ref, b.date, toLabel(b.start), toLabel(b.end), getService(b.service)?.title, b.status, b.praticien, b.cabinet, b.telephone, b.email, b.adresse ?? "", b.patient ?? "", b.travail, b.elements, b.teinte ?? "", b.urgent ? "oui" : "non", (b.notes ?? "").replace(/\n/g, " ")]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    Object.assign(document.createElement("a"), { href: url, download: `rendez-vous-${today}.csv` }).click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="admin-kpis">
        <div className="kpi"><small>Aujourd&apos;hui</small><b>{kpi.today}</b></div>
        <div className="kpi"><small>À venir</small><b>{kpi.upcoming}</b></div>
        <div className="kpi"><small>Urgents à venir</small><b style={{ color: "#9A5B00" }}>{kpi.urgent}</b></div>
        <div className="kpi"><small>Annulés</small><b style={{ color: "var(--err)" }}>{kpi.cancelled}</b></div>
      </div>
      <div className="filters">
        {(["avenir", "aujourdhui", "tous", "annules"] as const).map((f) => (
          <button key={f} type="button" className={filter === f ? "on" : ""} onClick={() => setFilter(f)}>
            {{ avenir: "À venir", aujourdhui: "Aujourd'hui", tous: "Tous", annules: "Annulés" }[f]}
          </button>
        ))}
        <select value={service} onChange={(e) => setService(e.target.value)} style={{ border: "1px solid var(--line)", borderRadius: 99, padding: "8px 14px", fontWeight: 600 }} aria-label="Filtrer par prestation">
          <option value="tous">Toutes prestations</option>
          {SERVICES.map((s) => <option key={s.id} value={s.id}>{s.short}</option>)}
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (réf., praticien, cabinet…)" aria-label="Rechercher" style={{ border: "1px solid var(--line)", borderRadius: 99, padding: "8px 16px", minWidth: 240, flex: 1 }} />
        <button type="button" onClick={exportCSV}>Exporter CSV</button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr><th>Date</th><th>Prestation</th><th>Praticien / cabinet</th><th>Contact</th><th>Travail</th><th>Statut</th><th /></tr>
          </thead>
          <tbody>
            {view.length === 0 && <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>Aucun rendez-vous.</td></tr>}
            {view.map((b) => (
              <tr key={b.id}>
                <td><b style={{ textTransform: "capitalize" }}>{fmt(b.date)}</b><br /><span style={{ fontFamily: "var(--font-mono)", fontSize: 13 }}>{toLabel(b.start)} – {toLabel(b.end)}</span></td>
                <td>{getService(b.service)?.short}<br /><span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)" }}>{b.ref}</span></td>
                <td><b>{b.praticien}</b><br />{b.cabinet}{b.adresse && <><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>{b.adresse}</span></>}{b.patient && <><br /><span style={{ fontSize: 13 }}>Patient : {b.patient}</span></>}</td>
                <td><a href={`tel:${b.telephone.replace(/\s/g, "")}`}>{b.telephone}</a><br /><a href={`mailto:${b.email}`} style={{ fontSize: 13 }}>{b.email}</a></td>
                <td>{b.travail} · {b.elements}{b.teinte && ` · ${b.teinte}`}{b.notes && <><br /><span style={{ fontSize: 13, color: "var(--muted)" }}>{b.notes}</span></>}</td>
                <td><span className={`tag${b.status === "annule" ? " annule" : ""}`}>{b.status === "annule" ? "Annulé" : "Confirmé"}</span>{b.urgent && <> <span className="tag urgent">Urgent</span></>}</td>
                <td>{b.status === "confirme" && <button type="button" className="link-btn" onClick={() => cancel(b.id)}>Annuler</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
