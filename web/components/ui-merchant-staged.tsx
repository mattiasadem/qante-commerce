use client";
import { useEffect, useMemo, useState } from "react";
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, shortDate } from "@/lib/core";

type KindFilter = "all" | "price" | "stock" | "listing";

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "price", label: "Fiyat" },
  { id: "stock", label: "Stok" },
  { id: "listing", label: "Liste" },
];

export function StagedQueue({ initial }: { initial: StagedChange[] }) {
  const [items, setItems] = useState(initial);
  const [kind, setKind] = useState<KindFilter>("all");
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectBulk, setRejectBulk] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/merchant/staged", { cache: "no-store" }).then((r) => r.json()).then((d: { changes?: StagedChange[] }) => {
      if (d.changes) setItems(d.changes);
    });
  }, []);

  const pending = useMemo(() => items.filter((c) => c.status === "staged"), [items]);
  const filteredPending = useMemo(
    () => (kind === "all" ? pending : pending.filter((c) => c.kind === kind)),
    [pending, kind],
  );
  const history = useMemo(() => items.filter((c) => c.status !== "staged"), [items]);
  const kindCounts = useMemo(() => {
    const c: Record<KindFilter, number> = { all: pending.length, price: 0, stock: 0, listing: 0 };
    for (const x of pending) {
      if (x.kind === "price" || x.kind === "stock" || x.kind === "listing") c[x.kind] += 1;
    }
    return c;
  }, [pending]);

  async function mutate(id: string, action: "approve" | "discard", note?: string) {
    setBusy(id);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason: note }),
      });
      const data = await res.json() as { change?: StagedChange };
      if (data.change) setItems((xs) => xs.map((x) => (x.id === id ? data.change! : x)));
    } finally {
      setBusy(null);
    }
  }

  async function approveAll() {
    const ids = filteredPending.map((c) => c.id);
    if (!ids.length) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all", ids }),
      });
      const data = await res.json() as { changes?: StagedChange[]; error?: string };
      if (!res.ok || !data.changes) {
        setFlash(data.error ?? "Toplu onay yazılamadı");
        return;
      }
      const byId = new Map(data.changes.map((c) => [c.id, c]));
      setItems((xs) => xs.map((x) => byId.get(x.id) ?? x));
      setFlash(`${ids.length} değişiklik yerel deftere yazıldı · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  async function discardAll(note: string) {
    const ids = filteredPending.map((c) => c.id);
    if (!ids.length || !note.trim()) return;
    setBusy("bulk");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "discard_all", ids, reason: note.trim() }),
      });
      const data = await res.json() as { changes?: StagedChange[]; error?: string };
      if (!res.ok || !data.changes) {
        setFlash(data.error ?? "Toplu red yazılamadı");
        return;
      }
      const byId = new Map(data.changes.map((c) => [c.id, c]));
      setItems((xs) => xs.map((x) => byId.get(x.id) ?? x));
      setFlash(`${ids.length} değişiklik reddedildi · yerel defter · ikas'a gitmedi`);
    } finally {
      setBusy(null);
    }
  }

  function approve(id: string) {
    void mutate(id, "approve");
  }
  function reject() {
    const note = reason.trim();
    if (!note) return;
    if (rejectBulk) {
      setRejectBulk(false);
      setRejectId(null);
      setReason("");
      void discardAll(note);
      return;
    }
    if (!rejectId) return;
    const id = rejectId;
    setRejectId(null);
    setReason("");
    void mutate(id, "discard", note);
  }

  return (
    <>
      <p className="muted" style={{ marginTop: -8, marginBottom: 12 }}>
        <span className="banner-demo">DEMO kuyruk · Onayla / Toplu onayla / Toplu reddet yerel deftere yazar, ikas’a gitmez</span>
      </p>
      <div className="chips scroll" role="tablist" aria-label="Bekleyen tür filtresi" style={{ marginBottom: 12 }}>
        {KIND_FILTERS.map((f) => (
          <button
            key={f.id}
            className={`chip ${kind === f.id ? "on" : ""}`}
            type="button"
            aria-pressed={kind === f.id}
            onClick={() => setKind(f.id)}
          >
            {f.label} {kindCounts[f.id]}
          </button>
        ))}
      </div>
      {flash ? (
        <p className="muted" style={{ marginBottom: 12 }}>
          <span className="banner-demo">{flash}</span>
        </p>
      ) : null}
      {filteredPending.length > 0 ? (
        <div className="actions" style={{ marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => void approveAll()}
          >
            {busy === "bulk" ? "…" : `Toplu onayla (${filteredPending.length})`}
          </button>
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk"}
            onClick={() => { setRejectBulk(true); setRejectId(null); setReason(""); }}
          >
            {busy === "bulk" ? "…" : `Toplu reddet (${filteredPending.length})`}
          </button>
          <span className="faint">görünen bekleyenler · tek cookie yazımı</span>
        </div>
      ) : null}
      {filteredPending.length === 0 ? (
        <div className="empty">
          <div className="mark" />
          <h3>{pending.length === 0 ? "Bekleyen yok" : "Bu filtrede bekleyen yok"}</h3>
          <p>{pending.length === 0 ? "Onay ve redler geçmişte. Canlı ikas yazılmadı." : "Başka bir tür seç veya katalogdan yeni öneri ekle."}</p>
        </div>
      ) : null}
      {filteredPending.map((c) => (
        <article className="change" key={c.id}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name} · {c.staged_by} · {shortDate(c.created_at)} · {c.variant_count} varyant</div>
            </div>
            <span className={`tag ${c.status === "staged" ? "accent" : c.status === "discarded" ? "danger" : "ok"}`}>
              {c.status === "staged" ? "bekliyor" : c.status === "discarded" ? "reddedildi" : "uygulandı"}
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
              <button className="btn btn-primary" type="button" disabled={busy === c.id || busy === "bulk"} onClick={() => approve(c.id)}>Onayla</button>
              <button className="btn" type="button" disabled={busy === "bulk"} onClick={() => { setRejectId(c.id); setReason(""); }}>Reddet</button>
            </div>
          ) : null}
        </article>
      ))}
      {history.length ? <h2 style={{ marginTop: 28 }}>Geçmiş</h2> : null}
      {history.map((c) => (
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
      {rejectId || rejectBulk ? (
        <div className="dialog">
          <div className="box">
            <h2>{rejectBulk ? `Toplu red · ${filteredPending.length} değişiklik` : "Red nedeni"}</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="neden reddedildi" aria-label="Red nedeni" />
            <div className="actions">
              <button className="btn btn-primary" type="button" disabled={!reason.trim() || busy === "bulk"} onClick={reject}>
                {rejectBulk ? `Toplu reddet (${filteredPending.length})` : "Reddet"}
              </button>
              <button className="btn" type="button" onClick={() => { setRejectId(null); setRejectBulk(false); }}>Vazgeç</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
