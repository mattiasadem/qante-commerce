"use client";
import Link from "next/link";
import type { KindFilter, HistoryFilter } from "@/components/ui-merchant-staged-helpers";

export function StagedPendingEmpty({
  pendingCount,
  kind,
  cat,
  q,
  onClearFilters,
}: {
  pendingCount: number;
  kind: KindFilter;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  return (
    <div className="empty" data-cta="staged-pending-empty">
      <div className="mark" />
      <h3>{pendingCount === 0 ? "Bekleyen yok" : (q.trim() || cat) ? "Aramada bekleyen yok" : "Bu filtrede bekleyen yok"}</h3>
      <p>{pendingCount === 0 ? "Onay ve redler geçmişte. Canlı ikas yazılmadı." : (q.trim() || cat) ? "Arama + tür + kategori birleşiminde kayıt yok." : "Başka bir tür seç veya katalogdan yeni öneri ekle."}</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {pendingCount === 0 ? (
          <>
            <Link className="btn" href="/merchant/katalog" data-cta="staged-empty-to-catalog">Kataloğa git</Link>
            <Link className="btn" href="/merchant/stok" data-cta="staged-empty-to-stock">Stoka git</Link>
            <Link className="btn" href="/merchant" data-cta="staged-empty-to-ozet">Özete dön</Link>
          </>
        ) : (
          <>
            {(q.trim() || cat || kind !== "all") ? (
              <button className="chip" type="button" data-cta="staged-empty-clear-filters" onClick={onClearFilters}>
                Filtreyi temizle
              </button>
            ) : null}
            <Link className="btn" href="/merchant/katalog" data-cta="staged-empty-to-catalog">Kataloğa git</Link>
            <Link className="btn" href="/merchant/stok" data-cta="staged-empty-to-stock">Stoka git</Link>
          </>
        )}
      </div>
    </div>
  );
}

export function StagedHistoryEmpty({
  hist,
  cat,
  q,
  onClearFilters,
}: {
  hist: HistoryFilter;
  cat: string;
  q: string;
  onClearFilters: () => void;
}) {
  return (
    <div className="empty" data-cta="staged-history-empty">
      <div className="mark" />
      <h3>{(q.trim() || cat) ? "Aramada geçmiş yok" : "Bu filtrede geçmiş yok"}</h3>
      <p>{(q.trim() || cat) ? "Arama + durum + kategori birleşiminde kayıt yok." : "Uygulandı veya Reddedildi seç, ya da Tümü."}</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {(q.trim() || cat || hist !== "all") ? (
          <button className="chip" type="button" data-cta="staged-hist-clear-filters" onClick={onClearFilters}>
            Filtreyi temizle
          </button>
        ) : null}
        <Link className="btn" href="/merchant/katalog" data-cta="staged-hist-empty-to-catalog">Kataloğa git</Link>
        <Link className="btn" href="/merchant/stok" data-cta="staged-hist-empty-to-stock">Stoka git</Link>
      </div>
    </div>
  );
}
