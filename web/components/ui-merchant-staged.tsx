'use client';
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { StagedChange } from "@/lib/core";
import { KIND_LABEL, shortDate } from "@/lib/core";
import {
  KIND_FILTERS,
  HISTORY_FILTERS,
  STAGED_SORTS,
  type KindFilter,
  type HistoryFilter,
  type StagedSortId,
  changeCategory,
  compareChangesBySort,
  changeMatchesQuery,
} from "@/components/ui-merchant-staged-helpers";
import { StagedPendingEmpty, StagedHistoryEmpty } from "@/components/ui-merchant-staged-empty";

function stagedQstr(kind: KindFilter, hist: HistoryFilter, cat: string, q: string, sort: StagedSortId) {
  const sp = new URLSearchParams();
  if (kind !== "all") sp.set("kind", kind);
  if (hist !== "all") sp.set("hist", hist);
  if (cat.trim()) sp.set("cat", cat.trim());
  const qq = q.trim().slice(0, 80);
  if (qq) sp.set("q", qq);
  if (sort !== "newest") sp.set("sort", sort);
  return sp.toString();
}

export function StagedQueue({ initial }: { initial: StagedChange[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname() || "/merchant/bekleyen";
  const kindParam = (params.get("kind") ?? params.get("filter") ?? "").trim().toLowerCase();
  const histParam = (params.get("hist") ?? params.get("history") ?? "").trim().toLowerCase();
  const catParam = (params.get("cat") ?? "").trim();
  const qParam = (params.get("q") ?? "").trim();
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const initialKind: KindFilter = (KIND_FILTERS.some((f) => f.id === kindParam) ? kindParam : "all") as KindFilter;
  const initialHist: HistoryFilter = (HISTORY_FILTERS.some((f) => f.id === histParam) ? histParam : "all") as HistoryFilter;
  const initialSort: StagedSortId = (STAGED_SORTS.some((s) => s.id === sortParam) ? sortParam : "newest") as StagedSortId;

  const [items, setItems] = useState(initial);
  const [kind, setKind] = useState<KindFilter>(initialKind);
  const [hist, setHist] = useState<HistoryFilter>(initialHist);
  const [cat, setCat] = useState(catParam);
  const [q, setQ] = useState(qParam);
  const [sort, setSort] = useState<StagedSortId>(initialSort);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectBulk, setRejectBulk] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (KIND_FILTERS.some((f) => f.id === kindParam)) setKind(kindParam as KindFilter);
  }, [kindParam]);
  useEffect(() => {
    if (HISTORY_FILTERS.some((f) => f.id === histParam)) setHist(histParam as HistoryFilter);
  }, [histParam]);
  useEffect(() => {
    if (catParam) setCat(catParam);
  }, [catParam]);
  useEffect(() => {
    if (qParam) setQ(qParam);
  }, [qParam]);
  useEffect(() => {
    if (STAGED_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as StagedSortId);
  }, [sortParam]);

  useEffect(() => {
    const next = stagedQstr(kind, hist, cat, q, sort);
    const cur = stagedQstr(
      (KIND_FILTERS.some((f) => f.id === kindParam) ? kindParam : "all") as KindFilter,
      (HISTORY_FILTERS.some((f) => f.id === histParam) ? histParam : "all") as HistoryFilter,
      catParam,
      qParam,
      (STAGED_SORTS.some((s) => s.id === sortParam) ? sortParam : "newest") as StagedSortId,
    );
    if (next === cur) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [kind, hist, cat, q, sort, kindParam, histParam, catParam, qParam, sortParam, pathname, router]);

  async function copyLink() {
    const qs = stagedQstr(kind, hist, cat, q, sort);
    const path = qs ? `${pathname}?${qs}` : pathname;
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  useEffect(() => {
    void fetch("/api/merchant/staged", { cache: "no-store" }).then((r) => r.json()).then((d: { changes?: StagedChange[] }) => {
      if (d.changes) setItems(d.changes);
    });
  }, []);

  const pending = useMemo(() => items.filter((c) => c.status === "staged"), [items]);
  const kindRows = useMemo(
    () => pending.filter((c) => kind === "all" || c.kind === kind),
    [pending, kind],
  );
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of kindRows) {
      const name = changeCategory(c);
      if (!name) continue;
      map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [kindRows]);
  const filteredPending = useMemo(() => {
    const rows = kindRows.filter((c) => {
      if (cat && changeCategory(c) !== cat) return false;
      return changeMatchesQuery(c, q);
    });
    return [...rows].sort((a, b) => compareChangesBySort(a, b, sort));
  }, [kindRows, cat, q, sort]);
  const history = useMemo(() => items.filter((c) => c.status !== "staged"), [items]);
  const filteredHistory = useMemo(() => {
    const rows = history.filter((c) => {
      if (hist !== "all" && c.status !== hist) return false;
      if (cat && changeCategory(c) !== cat) return false;
      return changeMatchesQuery(c, q);
    });
    return [...rows].sort((a, b) => compareChangesBySort(a, b, sort));
  }, [history, hist, cat, q, sort]);
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

  const urlFiltersOn = Boolean(
    (kindParam && kindParam !== "all") ||
      (histParam && histParam !== "all") ||
      catParam ||
      qParam ||
      (sortParam && sortParam !== "newest"),
  );

  return (
    <div data-cta="staged-url-write">
      <p className="muted" style={{ marginBottom: 12 }}>
        <span className="banner-demo">DEMO kuyruk · Onayla / Toplu onayla / Toplu reddet / Tekrar kuyruğa al yerel deftere yazar, ikas’a gitmez{urlFiltersOn ? " · URL filtreleri açık" : ""}</span>
        {" · "}
        <button className="chip" type="button" data-cta="staged-copy-link" onClick={() => void copyLink()}>
          {copied ? "Kopyalandı" : "Linki kopyala"}
        </button>
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
      {categories.length ? (
        <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="staged-category-rail" style={{ marginTop: 8 }}>
          <button
            className={`chip ${cat === "" ? "on" : ""}`}
            type="button"
            aria-pressed={cat === ""}
            data-cta="staged-category"
            data-cat=""
            onClick={() => setCat("")}
          >
            Tüm kategoriler
          </button>
          {categories.map(([name, n]) => (
            <button
              key={name}
              className={`chip ${cat === name ? "on" : ""}`}
              type="button"
              aria-pressed={cat === name}
              data-cta="staged-category"
              data-cat={name}
              onClick={() => setCat(cat === name ? "" : name)}
            >
              {name} · {n}
            </button>
          ))}
        </div>
      ) : null}
      <div className="ops-search" data-cta="staged-search" style={{ marginTop: 10, marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="input"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value.slice(0, 80))}
          placeholder="Ara · ürün, neden, kim, fiyat/stok…"
          aria-label="Bekleyen ara"
          data-cta="staged-search-input"
          style={{ flex: "1 1 220px", maxWidth: 420 }}
        />
        {q.trim() ? (
          <button className="btn btn-sm" type="button" data-cta="staged-search-clear" onClick={() => setQ("")}>
            Temizle
          </button>
        ) : null}
        <span className="faint">{q.trim() || cat ? `${filteredPending.length} bekleyen · ${filteredHistory.length} geçmiş` : "tür + kategori + geçmiş üstünde arar"}</span>
      </div>
      <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="staged-sort-rail" style={{ marginTop: 8, marginBottom: 12 }}>
        {STAGED_SORTS.map((s) => (
          <button
            key={s.id}
            className={`chip ${sort === s.id ? "on" : ""}`}
            type="button"
            aria-pressed={sort === s.id}
            data-cta="staged-sort"
            data-sort={s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
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
        <StagedPendingEmpty
          pendingCount={pending.length}
          kind={kind}
          cat={cat}
          q={q}
          onClearFilters={() => { setQ(""); setCat(""); setKind("all"); }}
        />
      ) : null}
      {filteredPending.map((c) => (
        <article className="change ops-change" key={c.id}>
          <div className="change-head">
            <div>
              <strong>{KIND_LABEL[c.kind]}</strong>
              <div className="faint">{c.product_name}{changeCategory(c) ? ` · ${changeCategory(c)}` : ""} · {c.staged_by} · {shortDate(c.created_at)} · {c.variant_count} varyant</div>
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
        <StagedHistoryEmpty
          hist={hist}
          cat={cat}
          q={q}
          onClearFilters={() => { setQ(""); setCat(""); setHist("all"); }}
        />
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
    </div>
  );
}
