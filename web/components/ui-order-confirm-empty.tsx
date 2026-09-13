"use client";
import Link from "next/link";

export function OrderConfirmEmpty() {
  return (
    <div className="empty" data-cta="order-confirm-empty">
      <div className="mark" />
      <h3>Sipariş bulunamadı</h3>
      <p>Bu oturumun son demo siparişi yok. Canlı ikas yazılmadı.</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn btn-primary" href="/" data-cta="order-empty-to-store">
          Mağazaya dön
        </Link>
        <Link className="btn" href="/sepet" data-cta="order-empty-to-cart">
          Sepete bak
        </Link>
        <Link className="btn" href="/siparislerim" data-cta="order-empty-to-my-orders">
          Siparişlerim
        </Link>
        <Link className="btn" href="/?feat=1" data-cta="order-empty-to-feat">
          Öne çıkana bak
        </Link>
        <Link className="btn" href="/merchant/siparisler" data-cta="order-empty-to-merchant-orders">
          Operatör Siparişler
        </Link>
        <Link className="btn" href="/siparis?id=ord_0830" data-cta="order-empty-to-seed-paid">
          Demo · ödeme alındı
        </Link>
        <Link className="btn" href="/siparis?id=ord_0901" data-cta="order-empty-to-seed-pending">
          Demo · ödeme bekliyor
        </Link>
        <Link className="btn" href="/siparis?id=ord_0906" data-cta="order-empty-to-seed-shipped">
          Demo · kargoda
        </Link>
        <Link className="btn" href="/siparis?id=ord_0902" data-cta="order-empty-to-seed-return">
          Demo · iade
        </Link>
      </div>
    </div>
  );
}
