"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/core";
import { RETURN_DAYS, SHIP_FREE, money } from "@/lib/core";
import { CheckoutNote, LineList, OrderNoteField, PayButton, ShipBar, ShopFooter, useAsk, useCart, ClearCartButton, SaveAllForLaterButton } from "@/components/ui-shell";
import { CouponField, CouponTotals, isFreeShip, useCoupon } from "@/components/ui-coupon";
import { DeliveryField } from "@/components/ui-delivery";
import { AddButton, BuyNowButton, FavoriteButton, NotifyRestockButton, ProductCard, ShareButton, isLowStock, pushRecent } from "@/components/ui-shop-core";
import { CompareButton } from "@/components/ui-compare";

export function AskAboutProduct({ product }: { product: Product }) {
  const { requestAsk } = useAsk();
  const chips = [
    { label: "Bu ürünü sor", msg: `${product.name}` },
    { label: "Bedeni var mı", msg: `${product.name} bedeni var mı` },
    { label: "İade nasıl", msg: "iade nasıl" },
    { label: "Benzerlerini getir", msg: `${product.name} benzerlerini getir` },
  ];
  return (
    <div className="chips" style={{ marginTop: 18 }}>
      {chips.map((c) => <button key={c.label} className="chip" type="button" onClick={() => requestAsk(c.msg, product.id)} data-cta={c.label === "Benzerlerini getir" ? "pdp-benzer-chip" : undefined}>{c.label}</button>)}
    </div>
  );
}

export function BenzerDripButton({ product }: { product: Product }) {
  const { requestAsk } = useAsk();
  return (
    <button
      className="chip"
      type="button"
      data-cta="pdp-benzer-drip"
      onClick={() => requestAsk(`${product.name} benzerlerini getir`, product.id)}
    >
      Benzerlerini getir
    </button>
  );
}

/** Mobile sticky CTA — shows when main PDP actions scroll off-screen (above dock). */
function PdpStickyBar({
  product,
  qty,
  setQty,
  maxQty,
  out,
  size,
  colorName,
}: {
  product: Product;
  qty: number;
  setQty: (fn: (q: number) => number) => void;
  maxQty: number;
  out: boolean;
  size?: string;
  colorName?: string;
}) {
  const lineVariant = { ...(colorName ? { color: colorName } : {}), ...(size ? { size } : {}) };
  const variant = [colorName, size].filter(Boolean).join(" · ");
  return (
    <div
      className="pdp-sticky"
      data-cta="pdp-sticky"
      role="region"
      aria-label="Hızlı sepete ekle"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(56px + env(safe-area-inset-bottom))",
        zIndex: 28,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 14px",
        background: "rgba(11,11,11,.94)",
        borderTop: ".5px solid var(--hairline)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div style={{ minWidth: 0, flex: "0 1 120px" }}>
        <div className="price" style={{ fontSize: 15 }}>{money(product.price)}</div>
        {variant ? <div className="faint" style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{variant}</div> : null}
      </div>
      {!out ? (
        <>
          <div className="stepper" role="group" aria-label="Adet" style={{ flexShrink: 0 }}>
            <button type="button" aria-label="Azalt" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span aria-live="polite">{qty}</span>
            <button type="button" aria-label="Artır" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
            <AddButton productId={product.id} qty={qty} variant={lineVariant} />
            <BuyNowButton productId={product.id} qty={qty} variant={lineVariant} />
          </div>
        </>
      ) : (
        <div style={{ display: "flex", gap: 8, marginLeft: "auto", flexShrink: 0 }}>
          <NotifyRestockButton product={product} />
          <FavoriteButton productId={product.id} />
        </div>
      )}
    </div>
  );
}

export function PdpView({ product, related }: { product: Product; related: Product[] }) {
  const [shot, setShot] = useState(0);
  const [color, setColor] = useState(product.colors?.[0]?.id);
  const [size, setSize] = useState(product.sizes?.[1] ?? product.sizes?.[0]);
  const [qty, setQty] = useState(1);
  const [sticky, setSticky] = useState(false);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const out = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);
  const colorName = product.colors?.find((c) => c.id === color)?.name;
  useEffect(() => {
    pushRecent(product.id);
  }, [product.id]);
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const mq = window.matchMedia("(max-width: 1023px)");
    let visible = true;
    const apply = () => setSticky(mq.matches && !visible);
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        apply();
      },
      { threshold: 0, rootMargin: "-8px 0px 0px 0px" },
    );
    io.observe(el);
    const onMq = () => apply();
    mq.addEventListener("change", onMq);
    apply();
    return () => {
      io.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, [product.id]);
  return (
    <div className="product-page" data-sticky-cta={sticky ? "1" : "0"}>
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
        <p className="faint" data-stock={out ? "out" : isLowStock(product.stock) ? "low" : "ok"}>
          {out
            ? "tükendi"
            : isLowStock(product.stock)
              ? `Son ${product.stock} adet · acele et`
              : `stok ${product.stock} adet`}
        </p>
        <p className="policy-line">İade {RETURN_DAYS} gün · {money(SHIP_FREE)} üzeri kargo yok</p>
        {[colorName, size].filter(Boolean).length ? (
          <p className="faint" data-cta="pdp-variant-label" style={{ marginTop: 4 }}>
            Seçilen · {[colorName, size].filter(Boolean).join(" · ")}
          </p>
        ) : null}
        {!out ? (
          <div ref={ctaRef} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "12px 0 4px" }}>
            <div className="stepper" role="group" aria-label="Adet">
              <button type="button" aria-label="Azalt" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span aria-live="polite">{qty}</span>
              <button type="button" aria-label="Artır" disabled={qty >= maxQty} onClick={() => setQty((q) => Math.min(maxQty, q + 1))}>+</button>
            </div>
            <AddButton productId={product.id} qty={qty} variant={{ ...(colorName ? { color: colorName } : {}), ...(size ? { size } : {}) }} />
            <BuyNowButton productId={product.id} qty={qty} variant={{ ...(colorName ? { color: colorName } : {}), ...(size ? { size } : {}) }} />
            <FavoriteButton productId={product.id} />
            <ShareButton productId={product.id} />
            <CompareButton product={product} />
          </div>
        ) : (
          <div ref={ctaRef} style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", margin: "12px 0 4px" }}>
            <AddButton productId={product.id} disabled />
            <NotifyRestockButton product={product} />
            <FavoriteButton productId={product.id} />
            <ShareButton productId={product.id} />
            <CompareButton product={product} />
          </div>
        )}
        <AskAboutProduct product={product} />
        {related.length ? (
          <>
            <div className="section-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <span>Yakın üç</span>
              <BenzerDripButton product={product} />
            </div>
            <div className="featured" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        ) : null}
        <p style={{ marginTop: 24 }}><Link href="/" className="muted">Mağazaya dön</Link></p>
      </div>
      {sticky ? (
        <PdpStickyBar
          product={product}
          qty={qty}
          setQty={setQty}
          maxQty={maxQty}
          out={out}
          size={size}
          colorName={colorName}
        />
      ) : null}
    </div>
  );
}

export function CartPageView() {
  const { cart } = useCart();
  const { coupon } = useCoupon();
  const freeShip = isFreeShip(cart.subtotal, coupon);
  return (
    <div className="grid-wrap" style={{ maxWidth: 720 }}>
      <h1>Sepet</h1>
      {cart.items.length === 0 ? (
        <div className="empty">
          <div className="mark" />
          <h3>Sepet henüz boş</h3>
          <p>Keten, yün veya ev. Gridden bir parça ekle.</p>
          <p style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <Link className="btn" href="/">Mağazaya bak</Link>
            <Link className="btn" href="/?fav=1" data-cta="empty-to-favorites">Favorilere bak</Link>
          </p>
        </div>
      ) : (
        <>
          <LineList extra />
          <ShipBar subtotal={cart.subtotal} freeShip={freeShip} />
          <p>Ara toplam <strong>{money(cart.subtotal)}</strong></p>
          <CouponTotals subtotal={cart.subtotal} />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
            <SaveAllForLaterButton />
            <ClearCartButton />
          </div>
          <DeliveryField />
          <CouponField />
          <OrderNoteField />
          <PayButton />
          <CheckoutNote />
        </>
      )}
      <ShopFooter />
    </div>
  );
}

export { OrderConfirm } from "@/components/ui-order-confirm";
