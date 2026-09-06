'use client';
import { useEffect, useMemo, useState } from "react";
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, shortDate } from "@/lib/core";

type KindFilter = "all" | "price" | "stock" | "listing";
type HistoryFilter = "all" | "applied" | "discarded";

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "price", label: "Fiyat" },
  { id: "stock", label: "Stok" },
  { id: "listing", label: "Liste" },
];

const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "applied", label: "Uygulandı" },
  { id: "discarded", label: "Reddedildi" },
];

export function StagedQueue({ initial }: { initial: StagedChange[] }) {
  const [items, setItems] = useState(initial);
  const [kind, setKind] = useState<KindFilter>("all");
  const [hist, setHist] = useState<HistoryFilter>("all");
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
  const filteredHistory = useMemo(
    () => (hist === "all" ? history : history.filter((c) => c.status === hist)),
    [history, hist],
  );
  const kindCounts = useMemo(() => {
    const c: Record<KindFilter, number> = { all: pending.length, price: 0, stock: 0, listing: 0 };
    for (const x of pending) {
      if (x.kind === "price" || x.kind === "stock" || x.kind === "listing") c[x.kind] += 1;
    }
    return c;
  }, [pending]);
  const histCounts = useMemo(() => {
    const c: Record<HistoryFilter, number> = { all: history.length, applied: 0, discarded: 0 };
    for (const x of history) {
      if (x.status === "applied" || x.status === "discarded") c[x.status] += 1;
    }
    return c;
  }, [history]);

  async function mutate(id: string, action: "approve" | "discard" | "restage", note?: string) {
    setBusy(id);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, reason: note }),
      });
      const data = await res.json() as { change?: StagedChange; error?: string };
      if (!res.ok || !data.change) {
        setFlash(data.error ?? "İşlem yazılamadı");
        return;
      }
      setItems((xs) => xs.map((x) => (x.id === id ? data.change! : x)));
      if (action === "restage") setFlash("Tekrar bekleyen kuyruğa alındı · yerel defter · ikas'a gitmedi");
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

  async function restageAll() {
    const ids = filteredHistory.map((c) => c.id);
    if (!ids.length) return;
    setBusy("bulk-hist");
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restage_all", ids }),
      });
      const data = await res.json() as { changes?: StagedChange[]; error?: string };
      if (!res.ok || !data.changes) {
        setFlash(data.error ?? "Toplu kuyruğa alma yazılamadı");
        return;
      }
      const byId = new Map(data.changes.map((c) => [c.id, c]));
      setItems((xs) => xs.map((x) => byId.get(x.id) ?? x));
      setFlash(`${ids.length} değişiklik tekrar bekleyene alındı · yerel defter · ikas'a gitmedi`);
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
      <p className="muted" style={{ marginBottom: 12 }}>
        <span className="banner-demo">DEMO kuyruk · Onayla / Toplu onayla / Toplu reddet / Tekrar kuyruğa al yerel deftere yazar, ikas’a gitmez</span>
      </p>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Bekleyen tür filtresi">
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
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          <button
            className="btn btn-primary"
            type="button"
            disabled={busy === "bulk" || busy === "bulk-hist"}
            onClick={() => void approveAll()}
          >
            {busy === "bulk" ? "…" : `Toplu onayla (${filteredPending.length})`}
          </button>
          <button
            className="btn btn-danger"
            type="button"
            disabled={busy === "bulk" || busy === "bulk-hist"}
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
        <article className="change ops-change" key={c.id}>
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
            <div className="actions approve-bar">
              <button className="btn btn-primary" type="button" disabled={busy === c.id || busy === "bulk" || busy === "bulk-hist"} onClick={() => approve(c.id)}>Onayla</button>
              <button className="btn btn-danger" type="button" disabled={busy === "bulk" || busy === "bulk-hist"} onClick={() => { setRejectId(c.id); setReason(""); }}>Reddet</button>
              <span className="faint">Onaylanmadan uygulanmaz</span>
            </div>
          ) : null}
        </article>
      ))}
      {history.length ? <h2 style={{ marginTop: 28 }}>Geçmiş</h2> : null}
      {history.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Geçmiş durum filtresi">
          {HISTORY_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`chip ${hist === f.id ? "on" : ""}`}
              type="button"
              aria-pressed={hist === f.id}
              onClick={() => setHist(f.id)}
            >
              {f.label} {histCounts[f.id]}
            </button>
          ))}
        </div>
      ) : null}
      {filteredHistory.length > 0 ? (
        <div className="bulk-bar approve-bar-sticky" role="toolbar">
          <button
            className="btn"
            type="button"
            disabled={busy === "bulk" || busy === "bulk-hist"}
            onClick={() => void restageAll()}
          >
            {busy === "bulk-hist" ? "…" : `Toplu kuyruğa al (${filteredHistory.length})`}
          </button>
          <span className="faint">görünen geçmiş · tekrar bekleyen</span>
        </div>
      ) : null}
      {history.length && filteredHistory.length === 0 ? (
        <div className="empty">
          <div className="mark" />
          <h3>Bu filtrede geçmiş yok</h3>
          <p>Uygulandı veya Reddedildi seç, ya da Tümü.</p>
        </div>
      ) : null}
      {filteredHistory.map((c) => (
        <article className="change ops-change" key={`h-${c.id}`}>
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
          <div className="actions">
            <button
              className="btn btn-primary"
              type="button"
              disabled={busy === c.id || busy === "bulk" || busy === "bulk-hist"}
              onClick={() => void mutate(c.id, "restage")}
            >
              {busy === c.id ? "…" : "Tekrar kuyruğa al"}
            </button>
          </div>
        </article>
      ))}
      {rejectId || rejectBulk ? (
        <div className="dialog">
          <div className="box">
            <h2>{rejectBulk ? `Toplu red · ${filteredPending.length} değişiklik` : "Red nedeni"}</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="neden reddedildi" aria-label="Red nedeni" />
            <div className="actions">
              <button className="btn btn-danger" type="button" disabled={!reason.trim() || busy === "bulk"} onClick={reject}>
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
