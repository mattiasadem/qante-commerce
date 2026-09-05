"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { CATEGORIES, RETURN_DAYS, SHIP_FREE, money } from "@/lib/core";
import { CheckoutNote, LineList, PayButton, ShipBar, ShopFooter, useAsk, useCart, ClearCartButton } from "@/components/ui-shell";

export function AddButton({ productId, disabled, qty = 1 }: { productId: string; disabled?: boolean; qty?: number }) {
  const { add } = useCart();
  const n = Math.max(1, qty);
  return (
    <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId, n)}>
      {n > 1 ? `Sepete ekle · ${n}` : "Sepete ekle"}
    </button>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock <= 0;
  return (
    <article className="card">
      <Link href={`/urun/${product.id}`} className="thumb-wrap">
        <img className="thumb" src={product.image} alt={product.name} />
        {out ? <div className="sold-overlay">tükendi</div> : null}
      </Link>
      <div className="card-body">
        <p className="faint" style={{ margin: "0 0 4px" }}>{product.category}</p>
        <h3><Link href={`/urun/${product.id}`}>{product.name}</Link></h3>
        <div><span className="price">{money(product.price)}</span>{product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}</div>
        <button className="btn btn-primary quick" type="button" disabled={out} onClick={() => void add(product.id)}>Ekle</button>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return <div className="empty"><div className="mark" /><h3>Bu süzgeçte parça yok</h3><p>Başka bir kategori veya arama dene.</p></div>;
  }
  return <div className="grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>;
}

export { AssistantPane, AssistantRail, AssistantSheet } from "@/components/GenAssistant";

type SortId = "default" | "price_asc" | "price_desc" | "stock";

const SORTS: { id: SortId; label: string }[] = [
  { id: "default", label: "Önerilen" },
  { id: "price_asc", label: "Fiyat ↑" },
  { id: "price_desc", label: "Fiyat ↓" },
  { id: "stock", label: "Stokta önce" },
];

export function HomeView({ products, featured, query, category, greeting, dateLabel }: {
  products: Product[]; featured: Product[]; query?: string; category?: string; greeting: string; dateLabel: string;
}) {
  const { requestAsk } = useAsk();
  const router = useRouter();
  const [sort, setSort] = useState<SortId>("default");
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (next) params.set("cat", next);
    router.push(params.toString() ? `/?${params}` : "/");
  }
  const filtered = useMemo(() => {
    const list = [...products];
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "stock") list.sort((a, b) => {
      const ao = a.stock > 0 ? 0 : 1;
      const bo = b.stock > 0 ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return b.stock - a.stock;
    });
    return list;
  }, [products, sort]);
  return (
    <div className="grid-wrap">
      <div className="hero-row">
        <h1>{greeting}</h1>
        <span className="date-line">{dateLabel}</span>
      </div>
      <p className="lede">Bugün raflarda keten, yün ve ev. Asistan sağda; arama hem grid hem rayı doldurur.</p>
      <div className="chips scroll" data-chips="category">
        {CATEGORIES.map((c) => (
          <button key={c} className={`chip ${category === c ? "on" : ""}`} type="button" aria-pressed={category === c} onClick={() => pick(c)}>{c}</button>
        ))}
      </div>
      <div className="chips scroll" data-chips="sort" role="tablist" aria-label="Sırala" style={{ marginTop: 8 }}>
        {SORTS.map((s) => (
          <button key={s.id} className={`chip ${sort === s.id ? "on" : ""}`} type="button" aria-pressed={sort === s.id} onClick={() => setSort(s.id)}>{s.label}</button>
        ))}
      </div>
      {!query && !category && featured.length && sort === "default" ? (
        <>
          <div className="section-label">Öne çıkan</div>
          <div className="featured">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </>
      ) : null}
      <div className="section-label">{query ? `${filtered.length} sonuç · ${query}` : category ? category : "Katalog"}{sort !== "default" ? ` · ${SORTS.find((s) => s.id === sort)?.label}` : ""}</div>
      <ProductGrid products={filtered} />
      <ShopFooter />
    </div>
  );
}

export function AskAboutProduct({ product }: { product: Product }) {
  const { requestAsk } = useAsk();
  const chips = [
    { label: "Bu ürünü sor", msg: `${product.name}` },
    { label: "Bedeni var mı", msg: `${product.name} bedeni var mı` },
    { label: "İade nasıl", msg: "iade nasıl" },
    { label: "Benzeri", msg: `${product.name} benzeri` },
  ];
  return (
    <div className="chips" style={{ marginTop: 18 }}>
      {chips.map((c) => <button key={c.label} className="chip" type="button" onClick={() => requestAsk(c.msg, product.id)}>{c.label}</button>)}
    </div>
  );
}

export function PdpView({ product, related }: { product: Product; related: Product[] }) {
  const [shot, setShot] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]?.id);
  const [size, setSize] = useState(product.sizes?.[1] ?? product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const out = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);
  return (
    <div className="product-page">
      <div className="gallery">
        <div className="hero"><img src={product.gallery[shot] ?? product.image} alt={product.name} /></div>
        <div className="thumbs">
          {product.gallery.map((src, i) => (
            <button key={i} type="button" className={shot === i ? "on" : ""} onClick={() => setShot(i)} aria-label={`Görsel ${i + 1}`}>
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      </div>
      <div className="pdp-head">
        <p className="faint">{product.category} · {product.sku}</p>
        <h1>{product.name}</h1>
        <p><span className="price">{money(product.price)}</span>{product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}</p>
        <p className="muted">{product.description}</p>
        {product.colors?.length ? (
          <div className="swatches" role="list">
            {product.colors.map((c) => (
              <button key={c.id} type="button" className={`swatch ${color === c.id ? "on" : ""}`} style={{ background: c.hex }} aria-label={c.name} onClick={() => setColor(c.id)} />
            ))}
          </div>
        ) : null}
        {product.sizes?.length ? (
          <div className="sizes">
            {product.sizes.map((s) => <button key={s} type="button" className={`chip ${size === s ? "on" : ""}`} onClick={() => setSize(s)}>{s}</button>)}
          </div>
        ) : null}
        <p className="faint">{out ? "tükendi" : `stok ${product.stock} adet`}</p>
        <p className="policy-line">İade {RETURN_DAYS} gün · {money(SHIP_FREE)} üzeri kargo yok</p>
        {!out ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "12px 0 4px" }}>
            <div className="stepper" role="group" aria-label="Adet">
              <button type="button" aria-label="Azalt" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Artır" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
            </div>
            <AddButton productId={product.id} qty={qty} />
          </div>
        ) : (
          <AddButton productId={product.id} disabled />
        )}
        <AskAboutProduct product={product} />
        {related.length ? (
          <>
            <div className="section-label">Yakın üç</div>
            <div className="featured" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : null}
        <p style={{ marginTop: 24 }}><Link href="/" className="muted">Mağazaya dön</Link></p>
      </div>
    </div>
  );
}

export function CartPageView() {
  const { cart } = useCart();
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sepet</h1>
      {cart.items.length === 0 ? (
        <div className="empty"><div className="mark" /><h3>Sepet henüz boş</h3><p><Link href="/">Mağazaya bak</Link></p></div>
      ) : (
        <>
          <LineList extra />
          <ShipBar subtotal={cart.subtotal} />
          <p>Ara toplam <strong>{money(cart.subtotal)}</strong></p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <ClearCartButton />
          </div>
          <PayButton />
          <CheckoutNote />
        </>
      )}
      <ShopFooter />
    </div>
  );
}

export { OrderConfirm } from "@/components/ui-order-confirm";
