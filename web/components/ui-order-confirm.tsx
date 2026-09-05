"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { STATUS_LABEL, canCancelOrder, canConfirmReceived, canRequestReturn, canWithdrawReturn, money, orderProgress } from "@/lib/core";
import { ShipBar, ShopFooter } from "@/components/ui-shell";

type DemoOrderView = {
  order_id: string;
  items: { product_id: string; name: string; qty: number; price: number; line_total: number }[];
  subtotal: number;
  created_at: string;
  note?: string;
  status?: string;
};

export function OrderConfirm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [order, setOrder] = useState<DemoOrderView | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) { setMissing(true); return; }
      setMissing(false);
      setOrder(await r.json() as DemoOrderView);
    });
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!order?.order_id) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [order?.order_id, load]);

  async function copyId() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }

  async function requestReturn() {
    if (!order) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.order_id, action: "request_return" }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İade yazılamadı");
        return;
      }
      setOrder((o) => (o ? { ...o, status: data.order!.status } : o));
      setFlash("İade talebi yerel deftere yazıldı · ikas'a gitmedi");
    } finally {
      setBusy(false);
    }
  }


  async function confirmReceived() {
    if (!order) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.order_id, action: "fulfill" }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "Teslim yazılamadı");
        return;
      }
      setOrder((o) => (o ? { ...o, status: data.order!.status } : o));
      setFlash("Teslim alındı · yerel defter · ikas'a gitmedi");
    } finally {
      setBusy(false);
    }
  }

  async function cancelOrder() {
    if (!order) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.order_id, action: "cancel" }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İptal yazılamadı");
        return;
      }
      setOrder((o) => (o ? { ...o, status: data.order!.status } : o));
      setFlash("Sipariş iptal · yerel defter · ikas'a gitmedi");
    } finally {
      setBusy(false);
    }
  }

  async function withdrawReturn() {
    if (!order) return;
    setBusy(true);
    setFlash(null);
    try {
      const res = await fetch("/api/merchant/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: order.order_id, action: "withdraw_return" }),
      });
      const data = await res.json() as { order?: { id: string; status: string }; error?: string };
      if (!res.ok || !data.order) {
        setFlash(data.error ?? "İade geri alınamadı");
        return;
      }
      setOrder((o) => (o ? { ...o, status: data.order!.status } : o));
      setFlash("İade talebi geri alındı · yerel defter · ikas'a gitmedi");
    } finally {
      setBusy(false);
    }
  }

  const status = order?.status ?? "paid";
  const progress = orderProgress(status);
  const statusLabel = STATUS_LABEL[status] ?? status;
  const returning = status === "return_requested";

  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <div className="hero-row">
        <h1>{progress.cancelled ? "Sipariş iptal" : returning ? "İade talebi" : "Sipariş alındı"}</h1>
        {order ? (
          <span className={`tag ${progress.cancelled || returning ? "danger" : status === "fulfilled" ? "ok" : status === "shipped" ? "warn" : "ok"}`}>
            {statusLabel} · demo
          </span>
        ) : null}
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
          {flash ? <p className="muted" style={{ marginTop: 8 }}><span className="banner-demo">{flash}</span></p> : null}
          <div className="chips" style={{ margin: "14px 0 6px" }} aria-label="Sipariş adımları">
            {progress.steps.map((label, i) => (
              <span key={label} className={`chip ${i <= progress.active ? "on" : ""}`}>{label}</span>
            ))}
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
          {progress.cancelled ? (
            <p className="muted" style={{ marginTop: 14 }}>Sipariş iptal · yerel defter · ikas&apos;a gitmedi</p>
          ) : returning ? (
            <p className="muted" style={{ marginTop: 14 }}>İade açık · geri al veya operatör İade kapat · ikas&apos;a gitmez</p>
          ) : (
            <ShipBar subtotal={order.subtotal} />
          )}
          <div className="actions" style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" className={canConfirmReceived(status) ? "btn" : "btn btn-primary"}>Mağazaya dön</Link>
            <Link href={`/merchant/siparisler?focus=${encodeURIComponent(order.order_id)}`} className="btn">Operatörde gör</Link>
            {canConfirmReceived(status) ? (
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void confirmReceived()}>
                {busy ? "…" : "Teslim aldım"}
              </button>
            ) : null}
            {canCancelOrder(status) ? (
              <button className="btn" type="button" disabled={busy} onClick={() => void cancelOrder()}>
                {busy ? "…" : "Siparişi iptal et"}
              </button>
            ) : null}
            {canRequestReturn(status) ? (
              <button className="btn" type="button" disabled={busy} onClick={() => void requestReturn()}>
                {busy ? "…" : "İade talep et"}
              </button>
            ) : null}
            {canWithdrawReturn(status) ? (
              <button className="btn btn-primary" type="button" disabled={busy} onClick={() => void withdrawReturn()}>
                {busy ? "…" : "İade talebini geri al"}
              </button>
            ) : null}
          </div>
        </>
      )}
      <ShopFooter />
    </div>
  );
}
