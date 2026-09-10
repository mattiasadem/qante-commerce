"use client";
import Link from "next/link";

export function StockAttentionEmpty({
  totalAlerts,
  filter,
  cat,
  q,
  onClearFilters,
}: {
  totalAlerts: number;
  filter: string;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  const filtered = Boolean(q.trim() || cat.trim() || filter !== "all");
  return (
    <div className="empty" data-cta="stock-attention-empty">
      <div className="mark" />
      <h3>
        {totalAlerts === 0
          ? "Stok uyarısı yok"
          : filtered
            ? "Bu filtrede uyarı yok"
            : "Uyarı yok"}
      </h3>
      <p>
        {totalAlerts === 0
          ? "Tükendi / düşük / yavaş listesi temiz. Canlı ikas yazılmadı."
          : filtered
            ? "Filtre + kategori + arama birleşiminde uyarı yok."
            : "Stok listesi boş."}
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {filtered ? (
          <button className="chip" type="button" data-cta="stock-empty-clear-filters" onClick={onClearFilters}>
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/merchant/katalog" data-cta="stock-empty-to-catalog">Katalog</Link>
        <Link className="btn" href="/merchant/bekleyen" data-cta="stock-empty-to-bekleyen">Bekleyen</Link>
        <Link className="btn" href="/merchant" data-cta="stock-empty-to-ozet">Özet</Link>
        <Link className="btn" href="/merchant/siparisler" data-cta="stock-empty-to-orders">Siparişler</Link>
      </div>
    </div>
  );
}
