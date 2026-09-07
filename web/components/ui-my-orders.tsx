"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { STATUS_LABEL } from "@/lib/core";
import { ShopFooter, useCart } from "@/components/ui-shell";
import { MY_ORDER_SORTS, compareMyOrdersBySort, type MyOrderSortId } from "@/components/ui-my-orders-sort";
import { ACTION_FLASH, FILTERS, type FilterId, type LedgerAction, type Row } from "@/components/ui-my-orders-model";
import { MyOrderRow } from "@/components/ui-my-orders-row";

export function MyOrdersView() {
  const router = useRouter();
  const { add } = useCart();
  const [orders, setOrders] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<MyOrderSortId>("newest");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

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

  const filtered = useMemo(() => {
    if (!orders) return [];
    const needle = q.trim().toLocaleLowerCase("tr-TR");
    const list = orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!needle) return true;
      const hay = [o.order_id, STATUS_LABEL[o.status] ?? o.status, ...o.items.map((i) => i.name), ...o.items.map((i) => i.product_id)]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return hay.includes(needle);
    });
    return [...list].sort((a, b) => compareMyOrdersBySort(a, b, sort));
  }, [orders, filter, q, sort]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: orders?.length ?? 0 };
    for (const f of FILTERS) {
      if (f.id === "all") continue;
      map[f.id] = orders?.filter((o) => o.status === f.id).length ?? 0;
    }
    return map;
  }, [orders]);

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
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <div className="hero-row">
        <h1>Siparişlerim</h1>
        {orders && orders.length ? <span className="tag ok">{orders.length} demo</span> : null}
      </div>
      <p className="faint">Bu tarayıcıdaki checkout demoları · yerel defter · ikas&apos;a gitmez</p>
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
            Sepetten <strong>Ödemeye geç</strong> ile bir sipariş yaz; burada listelenir.{" "}
            <Link href="/">Mağazaya bak</Link>
          </p>
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
              <h3>{q.trim() ? "Aramayla eşleşen sipariş yok" : "Bu süzgeçte sipariş yok"}</h3>
              <p style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {q.trim() ? <button className="chip" type="button" onClick={() => setQ("")}>Aramayı temizle</button> : null}
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
