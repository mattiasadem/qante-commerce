"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { money } from "@/lib/core";
import { ShipBar, ShopFooter } from "@/components/ui-shell";

type DemoOrderView = { order_id: string; items: { product_id: string; name: string; qty: number; price: number; line_total: number }[]; subtotal: number; created_at: string; note?: string };
export function OrderConfirm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [order, setOrder] = useState<DemoOrderView | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) { setMissing(true); return; }
      setOrder(await r.json() as DemoOrderView);
    });
  }, [id]);
  async function copyId() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <div className="hero-row">
        <h1>Sipariş alındı</h1>
        {order ? <span className="tag ok">ödeme alındı · demo</span> : null}
      </div>
      {missing ? (
        <div className="empty"><div className="mark" /><h3>Sipariş bulunamadı</h3><p>Bu oturumun son demo siparişi yok. <Link href="/">Mağazaya dön</Link></p></div>
      ) : !order ? (
        <p className="muted">yazılıyor…</p>
      ) : (
        <>
          <p className="muted">Sipariş no <strong>{order.order_id}</strong>
            <button className="chip" type="button" style={{ marginLeft: 10 }} onClick={() => void copyId()}>{copied ? "kopyalandı" : "Kopyala"}</button>
          </p>
          <p className="faint">{order.note ?? "ikas checkout simüle · yerel defter · Siparişler'e düşer"} · kargo tahmini 1–3 iş günü</p>
          <div className="chips" style={{ margin: "14px 0 6px" }} aria-label="Sipariş adımları">
            <span className="chip on">Ödeme</span>
            <span className="chip">Hazırlık</span>
            <span className="chip">Kargo</span>
            <span className="chip">Teslim</span>
          </div>
          <div className="list" style={{ marginTop: 18 }}>
            {order.items.map((l) => (
              <div className="list-row" key={l.product_id}>
                <div>
                  <Link href={`/urun/${l.product_id}`}>{l.name}</Link>
                  <div className="faint">{l.qty} adet · {money(l.price)}</div>
                </div>
                <strong>{money(l.line_total)}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
            <span className="muted">Toplam</span>
            <strong>{money(order.subtotal)}</strong>
          </div>
          <ShipBar subtotal={order.subtotal} />
          <div className="actions" style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary">Mağazaya dön</Link>
            <Link href={order ? `/merchant/siparisler?focus=${encodeURIComponent(order.order_id)}` : "/merchant/siparisler"} className="btn">Operatörde gör</Link>
          </div>
        </>
      )}
      <ShopFooter />
    </div>
  );
}
