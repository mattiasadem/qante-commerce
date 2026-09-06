"use client";

import { useState } from "react";
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, shortDate } from "@/lib/core";
import type { GenChangePreviewPayload } from "@/lib/stream-protocol";

/** Local ApproveBar-feel change preview (Turkish). Does not edit vendor. */
export function ChangePreviewCard({
  payload,
  onResolved,
}: {
  payload: GenChangePreviewPayload;
  onResolved?: (change: StagedChange) => void;
}) {
  const [change, setChange] = useState(payload.change);
  const [busy, setBusy] = useState<"approve" | "discard" | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  async function act(action: "approve" | "discard", note?: string) {
    if (busy) return;
    setBusy(action);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: change.id, action, reason: note }),
      });
      const data = (await res.json()) as { change?: StagedChange };
      if (data.change) {
        setChange(data.change);
        onResolved?.(data.change);
      }
    } finally {
      setBusy(null);
      setRejectOpen(false);
      setReason("");
    }
  }

  return (
    <section className="gen-card gen-change-card change ac-reveal" data-component="change_preview">
      <div className="change-head">
        <div>
          <strong>{payload.headline ?? KIND_LABEL[change.kind]}</strong>
          <div className="faint">
            {change.product_name} · {change.staged_by} · {shortDate(change.created_at)}
          </div>
        </div>
        <span className={`tag ${change.status === "staged" ? "accent" : change.status === "discarded" ? "danger" : "ok"}`}>
          {change.status === "staged" ? "Onay bekliyor" : change.status === "discarded" ? "reddedildi" : "uygulandı"}
        </span>
      </div>
      {payload.note || change.reason ? <p className="reason">{payload.note ?? change.reason}</p> : null}
      <div className="diff">
        <div className="col">
          <div className="k">Önce</div>
          {Object.entries(change.before).map(([k, v]) => (
            <div key={k}>{k}: {v}</div>
          ))}
        </div>
        <div className="col">
          <div className="k">Sonra</div>
          {Object.entries(change.after).map(([k, v]) => (
            <div key={k}>{k}: {v}</div>
          ))}
        </div>
      </div>
      <div className="chips" style={{ marginTop: 10 }}>
        {change.guardrails.map((g) => (
          <span key={g.id} className={`tag ${g.ok ? "ok" : "danger"}`}>
            {g.label} {g.ok ? "uygun" : "cap dışı"}
          </span>
        ))}
      </div>
      {change.status === "staged" ? (
        <div className="actions approve-bar">
          <button className="btn btn-primary" type="button" disabled={busy !== null} onClick={() => void act("approve")}>
            {busy === "approve" ? "yazılıyor…" : "Onayla"}
          </button>
          <button className="btn btn-danger" type="button" disabled={busy !== null} onClick={() => setRejectOpen(true)}>
            Reddet
          </button>
          <span className="faint">Onaylanmadan hiçbir şey uygulanmaz.</span>
        </div>
      ) : (
        <p className="faint" style={{ marginTop: 12 }}>
          {change.status === "applied" ? "Yerel deftere yazıldı · ikas simüle." : `Reddedildi${change.decision_note ? ` · ${change.decision_note}` : ""}.`}
        </p>
      )}
      {rejectOpen ? (
        <div className="dialog">
          <div className="box">
            <h2>Red nedeni</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="neden reddedildi" aria-label="Red nedeni" />
            <div className="actions">
              <button className="btn btn-danger" type="button" disabled={!reason.trim() || busy !== null} onClick={() => void act("discard", reason.trim())}>
                Reddet
              </button>
              <button className="btn" type="button" onClick={() => setRejectOpen(false)}>Vazgeç</button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
