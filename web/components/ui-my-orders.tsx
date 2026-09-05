"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  STATUS_LABEL,
  canCancelOrder,
  canConfirmPayment,
  canConfirmReceived,
  canReorder,
  canRequestReturn,
  canWithdrawReturn,
  money,
} from "@/lib/core";
import { ShopFooter, useCart } from "@/components/ui-shell";

type Row = {
  order_id: string;
  created_at: string;
  status: string;
  total: number;
  item_count: number;
  items: { product_id: string; name: string; qty: number }[];
};

type FilterId = "all" | "pending_payment" | "paid" | "shipped" | "fulfilled" | "cancelled" | "return_requested";

type LedgerAction = "mark_paid" | "fulfill" | "cancel" | "request_return" | "withdraw_return";

const FILTERS: { id: FilterId; label: string }[] = [
  { id: "all", label: "Tümü" },
  { id: "pending_payment", label: "Ödeme bekliyor" },
  { id: "paid", label: "Ödeme alındı" },
  { id: "shipped", label: "Kargoda" },
  { id: "fulfilled", label: "Teslim" },
  { id: "cancelled", label: "İptal" },
  { id: "return_requested", label: "İade açık" },
];

const ACTION_FLASH: Record<LedgerAction, string> = {
  mark_paid: "Ödeme alındı · yerel defter · ikas'a gitmedi",
  fulfill: "Teslim alındı · yerel defter · ikas'a gitmedi",
  cancel: "Sipariş iptal · yerel defter · ikas'a gitmedi",
  request_return: "İade talebi yerel deftere yazıldı · ikas'a gitmedi",
  withdraw_return: "İade talebi geri alındı · yerel defter · ikas'a gitmedi",
};

function fmtWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusTagClass(status: string) {
  if (status === "cancelled" || status === "return_requested") return "danger";
  if (status === "fulfilled") return "ok";
  if (status === "shipped") return "warn";
  return "ok";
}

export function MyOrdersView() {
  const router = useRouter();
  const { add } = useCart();
  const [orders, setOrders] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState<FilterId>("all");
  const [q, setQ] = useState("");
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
    return orders.filter((o) => {
      if (filter !== "all" && o.status !== filter) return false;
      if (!needle) return true;
      const hay = [
        o.order_id,
        STATUS_LABEL[o.status] ?? o.status,
        ...o.items.map((i) => i.name),
        ...o.items.map((i) => i.product_id),
      ]
        .join(" ")
        .toLocaleLowerCase("tr-TR");
      return hay.includes(needle);
    });
  }, [orders, filter, q]);

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
      for (const line of o.items) {
        await add(line.product_id, line.qty);
      }
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
      setOrders((prev) =>
        prev
          ? prev.map((row) => (row.order_id === o.order_id ? { ...row, status: next } : row))
          : prev,
      );
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
            <button className="btn" type="button" onClick={load}>
              Yenile
            </button>
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
            <input
              className="input"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Sipariş no veya ürün ara…"
              aria-label="Siparişlerde ara"
              style={{ flex: 1, minWidth: 0 }}
            />
            {q.trim() ? (
              <button className="chip" type="button" data-cta="clear-my-orders-search" onClick={() => setQ("")}>
                Temizle
              </button>
            ) : null}
          </div>
          <div className="chips" style={{ margin: "0 0 4px" }} aria-label="Durum süzgeci" data-cta="my-orders-filter">
            {FILTERS.map((f) => {
              const n = counts[f.id] ?? 0;
              if (f.id !== "all" && n === 0) return null;
              return (
                <button
                  key={f.id}
                  type="button"
                  className={`chip ${filter === f.id ? "on" : ""}`}
                  data-filter={f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                  {f.id !== "all" ? ` · ${n}` : n ? ` · ${n}` : ""}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 ? (
            <div className="empty" style={{ marginTop: 18 }}>
              <div className="mark" />
              <h3>{q.trim() ? "Aramayla eşleşen sipariş yok" : "Bu süzgeçte sipariş yok"}</h3>
              <p style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                {q.trim() ? (
                  <button className="chip" type="button" onClick={() => setQ("")}>
                    Aramayı temizle
                  </button>
                ) : null}
                {filter !== "all" ? (
                  <button className="chip" type="button" onClick={() => setFilter("all")}>
                    Tümünü göster
                  </button>
                ) : null}
              </p>
            </div>
          ) : (
            <div className="list" style={{ marginTop: 18 }} data-component="MyOrders">
              {filtered.map((o) => {
                const label = STATUS_LABEL[o.status] ?? o.status;
                const names = o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(" · ");
                const busy = busyId === o.order_id;
                const locked = busyId !== null;
                const showPay = canConfirmPayment(o.status);
                const showRecv = canConfirmReceived(o.status);
                const showCancel = canCancelOrder(o.status);
                const showReturn = canRequestReturn(o.status);
                const showWithdraw = canWithdrawReturn(o.status);
                const showReorder = canReorder(o.status);
                return (
                  <div className="list-row" key={o.order_id} style={{ alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Link href={`/siparis?id=${encodeURIComponent(o.order_id)}`} data-cta="open-my-order">
                        {o.order_id}
                      </Link>
                      <div className="faint" style={{ marginTop: 4 }}>
                        {fmtWhen(o.created_at)} · {o.item_count} adet
                        {names ? ` · ${names}` : ""}
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <span className={`tag ${statusTagClass(o.status)}`}>{label}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <strong>{money(o.total)}</strong>
                      <div
                        style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}
                        data-cta="my-orders-row-actions"
                      >
                        <Link className="chip" href={`/siparis?id=${encodeURIComponent(o.order_id)}`}>
                          Aç
                        </Link>
                        {showPay ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="pay-from-list"
                            disabled={locked}
                            onClick={() => void runLedger(o, "mark_paid")}
                          >
                            {busy ? "…" : "Ödeme yaptım"}
                          </button>
                        ) : null}
                        {showRecv ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="receive-from-list"
                            disabled={locked}
                            onClick={() => void runLedger(o, "fulfill")}
                          >
                            {busy ? "…" : "Teslim aldım"}
                          </button>
                        ) : null}
                        {showCancel ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="cancel-from-list"
                            disabled={locked}
                            onClick={() => void runLedger(o, "cancel")}
                          >
                            {busy ? "…" : "İptal"}
                          </button>
                        ) : null}
                        {showReturn ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="return-from-list"
                            disabled={locked}
                            onClick={() => void runLedger(o, "request_return")}
                          >
                            {busy ? "…" : "İade talep"}
                          </button>
                        ) : null}
                        {showWithdraw ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="withdraw-return-from-list"
                            disabled={locked}
                            onClick={() => void runLedger(o, "withdraw_return")}
                          >
                            {busy ? "…" : "İade geri al"}
                          </button>
                        ) : null}
                        {showReorder ? (
                          <button
                            className="chip"
                            type="button"
                            data-cta="reorder-from-list"
                            disabled={locked}
                            onClick={() => void reorderRow(o)}
                          >
                            {busy ? "…" : "Tekrar satın al"}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
      <p style={{ marginTop: 22 }}>
        <Link href="/" className="muted">
          Mağazaya dön
        </Link>
      </p>
      <ShopFooter />
    </div>
  );
}
