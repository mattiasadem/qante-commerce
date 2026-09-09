"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_LABEL } from "@/lib/core";
import { ShopFooter, useCart } from "@/components/ui-shell";
import { MY_ORDER_SORTS, compareMyOrdersBySort, type MyOrderSortId } from "@/components/ui-my-orders-sort";
import {
  ACTION_FLASH,
  FILTERS,
  myOrderCategories,
  myOrderHasCategory,
  type FilterId,
  type LedgerAction,
  type Row,
} from "@/components/ui-my-orders-model";
import { MyOrderRow } from "@/components/ui-my-orders-row";

function qstr(filter: FilterId, cat: string, q: string, sort: MyOrderSortId): string {
  const sp = new URLSearchParams();
  if (filter !== "all") sp.set("status", filter);
  const cc = cat.trim();
  if (cc) sp.set("cat", cc);
  const qq = q.trim().slice(0, 80);
  if (qq) sp.set("q", qq);
  if (sort !== "newest") sp.set("sort", sort);
  return sp.toString();
}

export function MyOrdersView() {
  const router = useRouter();
  const pathname = usePathname() || "/siparislerim";
  const params = useSearchParams();
  const statusParam = (params.get("status") ?? params.get("filter") ?? "").trim().toLowerCase();
  const catParam = (params.get("cat") ?? "").trim();
  const qParam = (params.get("q") ?? "").trim();
  const sortParam = (params.get("sort") ?? "").trim().toLowerCase();
  const initialFilter: FilterId = (FILTERS.some((f) => f.id === statusParam) ? statusParam : "all") as FilterId;
  const initialSort: MyOrderSortId = (MY_ORDER_SORTS.some((s) => s.id === sortParam) ? sortParam : "newest") as MyOrderSortId;

  const { add } = useCart();
  const [orders, setOrders] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState<FilterId>(initialFilter);
  const [q, setQ] = useState(qParam);
  const [cat, setCat] = useState(catParam);
  const [sort, setSort] = useState<MyOrderSortId>(initialSort);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (FILTERS.some((f) => f.id === statusParam)) setFilter(statusParam as FilterId);
    else if (!statusParam) setFilter("all");
  }, [statusParam]);
  useEffect(() => {
    setCat(catParam);
  }, [catParam]);
  useEffect(() => {
    setQ(qParam);
  }, [qParam]);
  useEffect(() => {
    if (MY_ORDER_SORTS.some((s) => s.id === sortParam)) setSort(sortParam as MyOrderSortId);
    else if (!sortParam) setSort("newest");
  }, [sortParam]);

  useEffect(() => {
    const next = qstr(filter, cat, q, sort);
    const cur = qstr(
      (FILTERS.some((f) => f.id === statusParam) ? statusParam : "all") as FilterId,
      catParam,
      qParam,
      (MY_ORDER_SORTS.some((s) => s.id === sortParam) ? sortParam : "newest") as MyOrderSortId,
    );
    if (next === cur) return;
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [filter, cat, q, sort, statusParam, catParam, qParam, sortParam, pathname, router]);

  async function copyLink() {
    const qs = qstr(filter, cat, q, sort);
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

  const load = useCallback(() => {
    void fetch("/api/orders/mine", { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) {
          setErr(true);
          setOrders([]);
          return;
        }
        setErr(false);
        const data = (await r.json()) as { orders?: Row[] };
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      })
      .catch(() => {
        setErr(true);
        setOrders([]);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const statusRows = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const o of statusRows) {
      for (const name of myOrderCategories(o)) map.set(name, (map.get(name) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0], "tr"));
  }, [statusRows]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr-TR");
    const list = statusRows.filter((o) => {
      if (!myOrderHasCategory(o, cat)) return false;
      if (!needle) return true;
      const cats = myOrderCategories(o).join(" ");
      const hay = [o.order_id, STATUS_LABEL[o.status] ?? o.status, cats, ...o.items.map((i) => i.name), ...o.items.map((i) => i.product_id)]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return hay.includes(needle);
    });
    return [...list].sort((a, b) => compareMyOrdersBySort(a, b, sort));
  }, [statusRows, cat, q, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders?.length ?? 0 };
    for (const f of FILTERS) {
      if (f.id === "all") continue;
      map[f.id] = orders?.filter((o) => o.status === f.id).length ?? 0;
    }
    return map;
  }, [orders]);

  const urlFiltersOn = Boolean(
    (statusParam && statusParam !== "all") || catParam || qParam || (sortParam && sortParam !== "newest"),
  );

  async function reorderRow(o: Row) {
    setBusyId(o.order_id);
    setFlash(null);
    try {
      for (const line of o.items) await add(line.product_id, line.qty);
      setFlash(`Sepete eklendi · ${o.order_id}`);
      router.push("/sepet");
    } finally {
      setBusyId(null);
    }
  }

  async function runLedger(o: Row, action: LedgerAction) {
    setBusyId(o.order_id);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: o.order_id, action }),
      });
      const data = (await res.json()) as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İşlem yazılamadı");
        return;
      }
      const next = data.order.status;
      setOrders((prev) => (prev ? prev.map((row) => (row.order_id === o.order_id ? { ...row, status: next } : row)) : prev));
      setFlash(`${ACTION_FLASH[action]} · ${o.order_id}`);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }} data-cta="my-orders-deeplink">
      <div className="hero-row">
        <h1>Siparişlerim</h1>
        {orders && orders.length ? <span className="tag ok">{orders.length} demo</span> : null}
      </div>
      <p className="faint">
        Bu tarayıcıdaki checkout demoları · yerel defter · ikas&apos;a gitmez
        {urlFiltersOn ? " · URL filtreleri açık" : ""}
        {" · "}
        <button className="chip" type="button" data-cta="my-orders-copy-link" onClick={() => void copyLink()}>
          {copied ? "Kopyalandı" : "Linki kopyala"}
        </button>
      </p>
      {flash ? (
        <p className="muted" style={{ marginTop: 8 }}>
          <span className="banner-demo">{flash}</span>
        </p>
      ) : null}
      {orders === null ? (
        <p className="muted" style={{ marginTop: 18 }}>yükleniyor…</p>
      ) : err ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <div className="mark" />
          <h3>Liste alınamadı</h3>
          <p>
            <button className="btn" type="button" onClick={load}>Yenile</button>
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty" style={{ marginTop: 18 }}>
          <div className="mark" />
          <h3>Henüz demo sipariş yok</h3>
          <p>
            Sepetten <strong>Ödemeye geç</strong> ile bir sipariş yaz; burada listelenir.
          </p>
          <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn" href="/" data-cta="my-orders-empty-to-shop">
              Mağazaya bak
            </Link>
            <Link className="btn" href="/?sale=1" data-cta="my-orders-empty-to-sale">
              İndirimlilere bak
            </Link>
            <Link className="btn" href="/?fav=1" data-cta="my-orders-empty-to-favorites">
              Favorilere bak
            </Link>
            <Link className="btn" href="/sepet" data-cta="my-orders-empty-to-cart">
              Sepete git
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="search-row" style={{ margin: "14px 0 8px", display: "flex", gap: 8, alignItems: "center" }} data-cta="my-orders-search">
            <input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Sipariş no veya ürün ara…" aria-label="Siparişlerde ara" style={{ flex: 1, minWidth: 0 }} />
            {q.trim() ? (
              <button className="chip" type="button" data-cta="clear-my-orders-search" onClick={() => setQ("")}>Temizle</button>
            ) : null}
          </div>
          <div className="chips" style={{ margin: "0 0 4px" }} aria-label="Durum süzgeci" data-cta="my-orders-filter">
            {FILTERS.map((f) => {
              const n = counts[f.id] ?? 0;
              if (f.id !== "all" && n === 0) return null;
              return (
                <button key={f.id} type="button" className={`chip ${filter === f.id ? "on" : ""}`} data-filter={f.id} onClick={() => setFilter(f.id)}>
                  {f.label}
                  {f.id !== "all" ? ` · ${n}` : n ? ` · ${n}` : ""}
                </button>
              );
            })}
          </div>
          {categories.length ? (
            <div className="filter-rail chips scroll" role="tablist" aria-label="Kategori" data-cta="my-orders-category-rail" style={{ marginTop: 8, marginBottom: 4 }}>
              <button
                className={`chip ${cat === "" ? "on" : ""}`}
                type="button"
                aria-pressed={cat === ""}
                data-cta="my-orders-category"
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
                  data-cta="my-orders-category"
                  data-cat={name}
                  onClick={() => setCat((cur) => (cur === name ? "" : name))}
                >
                  {name} · {n}
                </button>
              ))}
            </div>
          ) : null}
          <div className="filter-rail chips scroll" role="tablist" aria-label="Sıralama" data-cta="my-orders-sort-rail" style={{ marginTop: 8, marginBottom: 4 }}>
            {MY_ORDER_SORTS.map((s) => (
              <button key={s.id} type="button" className={`chip ${sort === s.id ? "on" : ""}`} aria-pressed={sort === s.id} data-cta="my-orders-sort" data-sort={s.id} onClick={() => setSort(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="empty" style={{ marginTop: 18 }}>
              <div className="mark" />
              <h3>{q.trim() || cat ? "Arama + kategori birleşiminde sipariş yok" : "Bu süzgeçte sipariş yok"}</h3>
              <p style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {q.trim() ? <button className="chip" type="button" onClick={() => setQ("")}>Aramayı temizle</button> : null}
                {cat ? <button className="chip" type="button" onClick={() => setCat("")}>Kategoriyi temizle</button> : null}
                {filter !== "all" ? <button className="chip" type="button" onClick={() => setFilter("all")}>Tümünü göster</button> : null}
              </p>
            </div>
          ) : (
            <div className="list" style={{ marginTop: 18 }} data-component="MyOrders">
              {filtered.map((o) => (
                <MyOrderRow key={o.order_id} o={o} busyId={busyId} onLedger={(row, action) => void runLedger(row, action)} onReorder={(row) => void reorderRow(row)} />
              ))}
            </div>
          )}
        </>
      )}
      <p style={{ marginTop: 22 }}>
        <Link href="/" className="muted">Mağazaya dön</Link>
      </p>
      <ShopFooter />
    </div>
  );
}
