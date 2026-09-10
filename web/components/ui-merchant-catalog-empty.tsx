"use client";
import Link from "next/link";
import type { CatalogFilterId } from "@/components/ui-merchant-catalog-table";

export function CatalogTableEmpty({
  totalProducts,
  filter,
  cat,
  q,
  onClearFilters,
}: {
  totalProducts: number;
  filter: CatalogFilterId;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  const filtered = Boolean(q.trim() || cat.trim() || filter !== "all");
  return (
    <div className="empty" data-cta="catalog-table-empty">
      <div className="mark" />
      <h3>
        {totalProducts === 0
          ? "Katalog boş"
          : filtered
            ? "Bu filtrede ürün yok"
            : "Ürün yok"}
      </h3>
      <p>
        {totalProducts === 0
          ? "Seed katalog yüklenmedi. Canlı ikas yazılmadı."
          : filtered
            ? "Filtre + kategori + arama birleşiminde ürün yok."
            : "Katalog listesi boş."}
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {filtered ? (
          <button className="chip" type="button" data-cta="catalog-empty-clear-filters" onClick={onClearFilters}>
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/merchant/stok" data-cta="catalog-empty-to-stock">Stoka git</Link>
        <Link className="btn" href="/merchant/bekleyen" data-cta="catalog-empty-to-bekleyen">Bekleyen</Link>
        <Link className="btn" href="/merchant" data-cta="catalog-empty-to-ozet">Özet</Link>
        <Link className="btn" href="/merchant/siparisler" data-cta="catalog-empty-to-orders">Siparişler</Link>
      </div>
    </div>
  );
}
