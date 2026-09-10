"use client";
import Link from "next/link";

export function OrdersEmpty({
  totalOrders,
  filter,
  pref,
  cat,
  q,
  onClearFilters,
}: {
  totalOrders: number;
  filter: string;
  pref: string | null;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  const filtered = Boolean(q.trim() || cat.trim() || pref || (filter && filter !== "open"));
  return (
    <div className="empty" data-cta="orders-empty">
      <div className="mark" />
      <h3>
        {totalOrders === 0
          ? "Sipariş yok"
          : filtered
            ? "Bu filtrede kayıt yok"
            : "Kayıt yok"}
      </h3>
      <p>
        {totalOrders === 0
          ? "Seed sipariş yüklenmedi. Canlı ikas yazılmadı."
          : filtered
            ? "Durum + tercih + kategori + arama birleşiminde kayıt yok."
            : "Bu durumda seed sipariş yok."}
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {filtered ? (
          <button className="chip" type="button" data-cta="orders-empty-clear-filters" onClick={onClearFilters}>
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/merchant/katalog" data-cta="orders-empty-to-catalog">Katalog</Link>
        <Link className="btn" href="/merchant/stok" data-cta="orders-empty-to-stock">Stok</Link>
        <Link className="btn" href="/merchant/bekleyen" data-cta="orders-empty-to-bekleyen">Bekleyen</Link>
        <Link className="btn" href="/merchant" data-cta="orders-empty-to-ozet">Özet</Link>
      </div>
    </div>
  );
}
