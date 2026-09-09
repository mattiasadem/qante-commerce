"use client";
import Link from "next/link";

export function EmptyBag({ onClose }: { onClose?: () => void }) {
  return (
    <div className="empty">
      <div className="mark" aria-hidden="true" />
      <h3>Sepet henüz boş</h3>
      <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn" href="/?feat=1" data-cta="empty-to-feat" onClick={() => onClose?.()}>
          Öne çıkana bak
        </Link>
        <Link className="btn" href="/?stock=1" data-cta="empty-to-stock" onClick={() => onClose?.()}>
          Stoktakilere bak
        </Link>
        <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites" onClick={() => onClose?.()}>
          Favorilere bak
        </Link>
        <Link className="btn" href="/?recent=1" data-cta="empty-to-recent" onClick={() => onClose?.()}>
          Son bakılanlara bak
        </Link>
        <Link className="btn" href="/?watch=1" data-cta="empty-to-watch" onClick={() => onClose?.()}>
          Beklediklerime bak
        </Link>
        <Link className="btn" href="/?cmp=1" data-cta="empty-to-compare" onClick={() => onClose?.()}>
          Karşılaştırılanlara bak
        </Link>
        <Link className="btn" href="/?sale=1" data-cta="empty-to-sale" onClick={() => onClose?.()}>
          İndirimlilere bak
        </Link>
        <Link className="btn" href="/?low=1" data-cta="empty-to-low" onClick={() => onClose?.()}>
          Az stoka bak
        </Link>
        <Link className="btn" href="/?oos=1" data-cta="empty-to-oos" onClick={() => onClose?.()}>
          Tükenene bak
        </Link>
      </div>
    </div>
  );
}
