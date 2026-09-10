"use client";
import Link from "next/link";
import type { OzetFilterId } from "@/components/ui-merchant-metrics-filters";

export function OzetAttentionEmpty({
  totalAlive,
  filter,
  cat,
  q,
  onClearFilters,
}: {
  totalAlive: number;
  filter: OzetFilterId;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  const filtered = Boolean(q.trim() || cat || filter !== "all");
  return (
    <div className="empty" data-cta="ozet-attention-empty">
      <div className="mark" />
      <h3>
        {totalAlive === 0
          ? "Dikkat kaydı yok"
          : filtered
            ? "Bu filtrede dikkat kaydı yok"
            : "Dikkat kaydı yok"}
      </h3>
      <p>
        {totalAlive === 0
          ? "Stok, sipariş ve bekleyen kuyruğu temiz. Canlı ikas yazılmadı."
          : filtered
            ? "Filtre + kategori + arama birleşiminde kayıt yok."
            : "Özet listesi boş."}
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {filtered ? (
          <button className="chip" type="button" data-cta="ozet-empty-clear-filters" onClick={onClearFilters}>
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/merchant/stok" data-cta="ozet-empty-to-stock">Stoka git</Link>
        <Link className="btn" href="/merchant/siparisler" data-cta="ozet-empty-to-orders">Siparişler</Link>
        <Link className="btn" href="/merchant/bekleyen" data-cta="ozet-empty-to-bekleyen">Bekleyen</Link>
        <Link className="btn" href="/merchant/katalog" data-cta="ozet-empty-to-catalog">Katalog</Link>
      </div>
    </div>
  );
}
