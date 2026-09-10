"use client";
import Link from "next/link";

export function MyOrdersEmpty() {
  return (
    <div className="empty" style={{ marginTop: 18 }} data-cta="my-orders-empty">
      <div className="mark" />
      <h3>Henüz demo sipariş yok</h3>
      <p>
        Sepetten <strong>Ödemeye geç</strong> ile bir sipariş yaz; burada listelenir.
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn" href="/" data-cta="my-orders-empty-to-shop">
          Mağazaya bak
        </Link>
        <Link className="btn" href="/?feat=1" data-cta="my-orders-empty-to-feat">
          Öne çıkana bak
        </Link>
        <Link className="btn" href="/?stock=1" data-cta="my-orders-empty-to-stock">
          Stoktakilere bak
        </Link>
        <Link className="btn" href="/?fav=1" data-cta="my-orders-empty-to-favorites">
          Favorilere bak
        </Link>
        <Link className="btn" href="/?recent=1" data-cta="my-orders-empty-to-recent">
          Son bakılanlara bak
        </Link>
        <Link className="btn" href="/?watch=1" data-cta="my-orders-empty-to-watch">
          Beklediklerime bak
        </Link>
        <Link className="btn" href="/?cmp=1" data-cta="my-orders-empty-to-compare">
          Karşılaştırılanlara bak
        </Link>
        <Link className="btn" href="/?sale=1" data-cta="my-orders-empty-to-sale">
          İndirimlilere bak
        </Link>
        <Link className="btn" href="/?low=1" data-cta="my-orders-empty-to-low">
          Az stoka bak
        </Link>
        <Link className="btn" href="/?oos=1" data-cta="my-orders-empty-to-oos">
          Tükenene bak
        </Link>
        <Link className="btn" href="/sepet" data-cta="my-orders-empty-to-cart">
          Sepete git
        </Link>
      </div>
    </div>
  );
}

export function MyOrdersFilterEmpty({
  q,
  cat,
  filter,
  onClearQ,
  onClearCat,
  onClearFilter,
}: {
  q: string;
  cat: string;
  filter: string;
  onClearQ: () => void;
  onClearCat: () => void;
  onClearFilter: () => void;
}) {
  return (
    <div className="empty" style={{ marginTop: 18 }} data-cta="my-orders-filter-empty">
      <div className="mark" />
      <h3>{q.trim() || cat ? "Arama + kategori birleşiminde sipariş yok" : "Bu süzgeçte sipariş yok"}</h3>
      <p style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {q.trim() ? (
          <button className="chip" type="button" data-cta="my-orders-filter-clear-q" onClick={onClearQ}>
            Aramayı temizle
          </button>
        ) : null}
        {cat ? (
          <button className="chip" type="button" data-cta="my-orders-filter-clear-cat" onClick={onClearCat}>
            Kategoriyi temizle
          </button>
        ) : null}
        {filter !== "all" ? (
          <button className="chip" type="button" data-cta="my-orders-filter-clear-status" onClick={onClearFilter}>
            Tümünü göster
          </button>
        ) : null}
      </p>
      <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link className="btn" href="/" data-cta="my-orders-filter-empty-to-shop">
          Mağazaya bak
        </Link>
        <Link className="btn" href="/?sale=1" data-cta="my-orders-filter-empty-to-sale">
          İndirimlilere bak
        </Link>
        <Link className="btn" href="/sepet" data-cta="my-orders-filter-empty-to-cart">
          Sepete git
        </Link>
      </div>
    </div>
  );
}
