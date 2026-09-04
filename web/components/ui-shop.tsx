"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/core";
import { CATEGORIES, RETURN_DAYS, SHIP_FREE, money } from "@/lib/core";
import { CheckoutNote, LineList, PayButton, ShipBar, ShopFooter, useAsk, useCart } from "@/components/ui-shell";

export function AddButton({ productId, disabled }: { productId: string; disabled?: boolean }) {
  const { add } = useCart();
  return <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId)}>Sepete ekle</button>;
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

export function HomeView({ products, featured, query, category, greeting, dateLabel }: {
  products: Product[]; featured: Product[]; query?: string; category?: string; greeting: string; dateLabel: string;
}) {
  const { requestAsk } = useAsk();
  const router = useRouter();
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (next) params.set("cat", next);
    router.push(params.toString() ? `/?${params}` : "/");
  }
  const filtered = products;
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
      {!query && !category && featured.length ? (
        <>
          <div className="section-label">Öne çıkan</div>
          <div className="featured">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </>
      ) : null}
      <div className="section-label">{query ? `${filtered.length} sonuç · ${query}` : category ? category : "Katalog"}</div>
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
  const out = product.stock <= 0;
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
        <AddButton productId={product.id} disabled={out} />
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
          <PayButton />
          <CheckoutNote />
        </>
      )}
      <ShopFooter />
    </div>
  );
}


type DemoOrderView = { order_id: string; items: { product_id: string; name: string; qty: number; price: number; line_total: number }[]; subtotal: number; created_at: string; note?: string };
export function OrderConfirm() {
  const params = useSearchParams();
  const id = params.get("id") ?? "";
  const [order, setOrder] = useState<DemoOrderView | null>(null);
  const [missing, setMissing] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const q = id ? `/api/order?id=${encodeURIComponent(id)}` : "/api/order";
    void fetch(q, { cache: "no-store" }).then(async (r) => {
      if (!r.ok) { setMissing(true); return; }
      setOrder(await r.json() as DemoOrderView);
    });
  }, [id]);
  async function copyId() {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.order_id);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
  }
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <div className="hero-row">
        <h1>Sipariş alındı</h1>
        {order ? <span className="tag ok">ödeme alındı · demo</span> : null}
      </div>
      {missing ? (
        <div className="empty"><div className="mark" /><h3>Sipariş bulunamadı</h3><p>Bu oturumun son demo siparişi yok. <Link href="/">Mağazaya dön</Link></p></div>
      ) : !order ? (
        <p className="muted">yazılıyor…</p>
      ) : (
        <>
          <p className="muted">Sipariş no <strong>{order.order_id}</strong>
            <button className="chip" type="button" style={{ marginLeft: 10 }} onClick={() => void copyId()}>{copied ? "kopyalandı" : "Kopyala"}</button>
          </p>
          <p className="faint">{order.note ?? "ikas checkout simüle · yerel defter"} · kargo tahmini 1–3 iş günü</p>
          <div className="chips" style={{ margin: "14px 0 6px" }} aria-label="Sipariş adımları">
            <span className="chip on">Ödeme</span>
            <span className="chip">Hazırlık</span>
            <span className="chip">Kargo</span>
            <span className="chip">Teslim</span>
          </div>
          <div className="list" style={{ marginTop: 18 }}>
            {order.items.map((l) => (
              <div className="list-row" key={l.product_id}>
                <div>
                  <Link href={`/urun/${l.product_id}`}>{l.name}</Link>
                  <div className="faint">{l.qty} adet · {money(l.price)}</div>
                </div>
                <strong>{money(l.line_total)}</strong>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 16, alignItems: "center" }}>
            <span className="muted">Toplam</span>
            <strong>{money(order.subtotal)}</strong>
          </div>
          <ShipBar subtotal={order.subtotal} />
          <div className="actions" style={{ marginTop: 22, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-primary">Mağazaya dön</Link>
            <Link href="/merchant/siparisler" className="btn">Operatörde gör</Link>
          </div>
        </>
      )}
      <ShopFooter />
    </div>
  );
}
