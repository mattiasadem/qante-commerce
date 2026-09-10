"use client";
import Link from "next/link";

export function ProductGridEmpty({
  emptyTitle,
  emptyHint,
}: {
  emptyTitle?: string;
  emptyHint?: string;
}) {
  return (
    <div className="empty" data-cta="grid-empty">
      <div className="mark" />
      <h3>{emptyTitle ?? "Bu süzgeçte parça yok"}</h3>
      <p>{emptyHint ?? "Başka bir kategori veya arama dene."}</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn" href="/" data-cta="grid-empty-to-shop">Mağazaya bak</Link>
        <Link className="btn" href="/?feat=1" data-cta="grid-empty-to-feat">Öne çıkana bak</Link>
        <Link className="btn" href="/?stock=1" data-cta="grid-empty-to-stock">Stoktakilere bak</Link>
        <Link className="btn" href="/?sale=1" data-cta="grid-empty-to-sale">İndirimlilere bak</Link>
        <Link className="btn" href="/?low=1" data-cta="grid-empty-to-low">Az stoka bak</Link>
        <Link className="btn" href="/?oos=1" data-cta="grid-empty-to-oos">Tükenene bak</Link>
        <Link className="btn" href="/?fav=1" data-cta="grid-empty-to-favorites">Favorilere bak</Link>
        <Link className="btn" href="/?recent=1" data-cta="grid-empty-to-recent">Son bakılanlara bak</Link>
        <Link className="btn" href="/?watch=1" data-cta="grid-empty-to-watch">Beklediklerime bak</Link>
        <Link className="btn" href="/?cmp=1" data-cta="grid-empty-to-compare">Karşılaştırılanlara bak</Link>
        <Link className="btn" href="/sepet" data-cta="grid-empty-to-cart">Sepete git</Link>
      </div>
    </div>
  );
}
