"use client";
import { useEffect, useState } from "react";
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, shortDate } from "@/lib/core";

export function StagedQueue({ initial }: { initial: StagedChange[] }) {
  const [items, setItems] = useState(initial);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  useEffect(() => {
    void fetch("/api/merchant/staged", { cache: "no-store" }).then((r) => r.json()).then((d: { changes?: StagedChange[] }) => {
      if (d.changes) setItems(d.changes);
    });
  }, []);
  async function mutate(id: string, action: "approve" | "discard", note?: string) {
    setBusy(id);
    try {
      const res = await fetch("/api/merchant/changes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action, reason: note }) });
      const data = await res.json() as { change?: StagedChange };
      if (data.change) setItems((xs) => xs.map((x) => x.id === id ? data.change! : x));
    } finally { setBusy(null); }
  }
  function approve(id: string) { void mutate(id, "approve"); }
  function reject() {
    if (!rejectId || !reason.trim()) return;
    const id = rejectId;
    const note = reason.trim();
    setRejectId(null);
    setReason("");
    void mutate(id, "discard", note);
  }
  return (
    <>
      <p className="muted" style={{ marginTop: -8, marginBottom: 16 }}>
        <span className="banner-demo">DEMO kuyruk · Onayla yerel deftere yazar, ikas’a gitmez</span>
      </p>
      {items.filter((c) => c.status === "staged").length === 0 ? (
        <div className="empty"><div className="mark" /><h3>Bekleyen yok</h3><p>Onay ve redler geçmişte. Canlı ikas yazılmadı.</p></div>
      ) : null}
      {items.filter((c) => c.status === "staged").map((c) => (
        <article className="change" key={c.id}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name} · {c.staged_by} · {shortDate(c.created_at)} · {c.variant_count} varyant</div>
            </div>
            <span className={`tag ${c.status === "staged" ? "accent" : c.status === "discarded" ? "danger" : "ok"}`}>
              {c.status === "staged" ? "Onay bekliyor" : c.status === "discarded" ? "reddedildi" : "uygulandı"}
            </span>
          </div>
          <div className="diff">
            <div className="col"><div className="k">Önce</div>{Object.entries(c.before).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
            <div className="col"><div className="k">Sonra</div>{Object.entries(c.after).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
          </div>
          <p className="reason">{c.reason}</p>
          <div className="chips">
            {c.guardrails.map((g) => <span key={g.id} className={`tag ${g.ok ? "ok" : "danger"}`}>{g.label} {g.ok ? "uygun" : "cap dışı"}</span>)}
          </div>
          {c.status === "staged" ? (
            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={busy === c.id} onClick={() => approve(c.id)}>Onayla</button>
              <button className="btn" type="button" onClick={() => { setRejectId(c.id); setReason(""); }}>Reddet</button>
            </div>
          ) : null}
        </article>
      ))}
      {items.some((c) => c.status !== "staged") ? <h2 style={{ marginTop: 28 }}>Geçmiş</h2> : null}
      {items.filter((c) => c.status !== "staged").map((c) => (
        <article className="change" key={`h-${c.id}`}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name} · {c.status === "applied" ? "yerel deftere yazıldı · ikas simüle" : "reddedildi"}{c.decision_note ? ` · ${c.decision_note}` : ""}</div>
            </div>
            <span className={`tag ${c.status === "discarded" ? "danger" : "ok"}`}>{c.status === "discarded" ? "reddedildi" : "uygulandı"}</span>
          </div>
          <div className="diff">
            <div className="col"><div className="k">Önce</div>{Object.entries(c.before).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
            <div className="col"><div className="k">Sonra</div>{Object.entries(c.after).map(([k, v]) => <div key={k}>{k}: {v}</div>)}</div>
          </div>
        </article>
      ))}
      {rejectId ? (
        <div className="dialog">
          <div className="box">
            <h2>Red nedeni</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="neden reddedildi" aria-label="Red nedeni" />
            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={!reason.trim()} onClick={reject}>Reddet</button>
              <button className="btn" type="button" onClick={() => setRejectId(null)}>Vazgeç</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
