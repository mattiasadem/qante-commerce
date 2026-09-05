"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { STATUS_LABEL, money } from "@/lib/core";
import { ShopFooter } from "@/components/ui-shell";

type Row = {
  order_id: string;
  created_at: string;
  status: string;
  total: number;
  item_count: number;
  items: { product_id: string; name: string; qty: number }[];
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

export function MyOrdersView() {
  const [orders, setOrders] = useState<Row[] | null>(null);
  const [err, setErr] = useState(false);

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

  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <div className="hero-row">
        <h1>Siparişlerim</h1>
        {orders && orders.length ? <span className="tag ok">{orders.length} demo</span> : null}
      </div>
      <p className="faint">Bu tarayıcıdaki checkout demoları · yerel defter · ikas&apos;a gitmez</p>
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
        <div className="list" style={{ marginTop: 18 }} data-component="MyOrders">
          {orders.map((o) => {
            const label = STATUS_LABEL[o.status] ?? o.status;
            const names = o.items.map((i) => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ""}`).join(" · ");
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
                    <span className={`tag ${o.status === "cancelled" || o.status === "return_requested" ? "danger" : o.status === "fulfilled" ? "ok" : o.status === "shipped" ? "warn" : "ok"}`}>
                      {label}
                    </span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <strong>{money(o.total)}</strong>
                  <div style={{ marginTop: 8 }}>
                    <Link className="chip" href={`/siparis?id=${encodeURIComponent(o.order_id)}`}>
                      Aç
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
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
