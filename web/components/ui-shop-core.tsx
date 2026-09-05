"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/core";
import { money } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell";

export function AddButton({ productId, disabled, qty = 1 }: { productId: string; disabled?: boolean; qty?: number }) {
  const { add } = useCart();
  const n = Math.max(1, qty);
  return (
    <button className="btn btn-primary" type="button" disabled={disabled} onClick={() => void add(productId, n)}>
      {n > 1 ? `Sepete ekle · ${n}` : "Sepete ekle"}
    </button>
  );
}

/** PDP buy-now: clear cart, add qty, checkout → /siparis (local ledger). */
export function BuyNowButton({ productId, disabled, qty = 1 }: { productId: string; disabled?: boolean; qty?: number }) {
  const { clear, add, checkout } = useCart();
  const { setCartOpen } = useAsk();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const n = Math.max(1, qty);
  return (
    <button
      className="btn"
      type="button"
      disabled={disabled || busy}
      data-cta="buy-now"
      onClick={async () => {
        setBusy(true);
        try {
          await clear();
          await add(productId, n);
          const order = await checkout();
          if (!order) return;
          setCartOpen(false);
          router.push(`/siparis?id=${encodeURIComponent(order.order_id)}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      {busy ? "yazılıyor" : n > 1 ? `Hemen al · ${n}` : "Hemen al"}
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


export type SortId = "default" | "price_asc" | "price_desc" | "stock";

export const SORTS: { id: SortId; label: string }[] = [
  { id: "default", label: "Önerilen" },
  { id: "price_asc", label: "Fiyat ↑" },
  { id: "price_desc", label: "Fiyat ↓" },
  { id: "stock", label: "Stokta önce" },
];
