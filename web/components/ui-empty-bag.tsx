"use client";
import Link from "next/link";

export function EmptyBag({ onClose }: { onClose?: () => void }) {
  return (
    <div className="empty">
      <div className="mark" aria-hidden="true" />
      <h3>Sepet henüz boş</h3>
      <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites" onClick={() => onClose?.()}>
          Favorilere bak
        </Link>
        <Link className="btn" href="/?recent=1" data-cta="empty-to-recent" onClick={() => onClose?.()}>
          Son bakılanlara bak
        </Link>
        <Link className="btn" href="/?watch=1" data-cta="empty-to-watch" onClick={() => onClose?.()}>
          Beklediklerime bak
        </Link>
      </div>
    </div>
  );
}
