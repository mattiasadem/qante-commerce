"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { money } from "@/lib/format";
import { useCart } from "@/lib/cart-client";

export function ProductTile({ product }: { product: Product }) {
  const { add } = useCart();
  const out = product.stock <= 0;
  return (
    <article className="card">
      <Link href={`/urun/${product.id}`}>
        <img className="thumb" src={product.image} alt={product.name} />
      </Link>
      <div className="card-body">
        <h3>
          <Link href={`/urun/${product.id}`}>{product.name}</Link>
        </h3>
        <div>
          <span className="price">{money(product.price)}</span>
          {product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}
        </div>
        {out ? (
          <p className="stock-out">tükendi</p>
        ) : (
          <p className="faint">{product.category}</p>
        )}
        <button
          className="btn btn-primary"
          type="button"
          disabled={out}
          onClick={() => void add(product.id)}
          style={{ marginTop: 10, width: "100%" }}
        >
          Sepete ekle
        </button>
      </div>
    </article>
  );
}
