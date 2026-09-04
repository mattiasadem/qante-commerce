"use client";

import Link from "next/link";
import type { GenProductsPayload } from "@/lib/stream-protocol";
import { money } from "@/lib/core";
import { useCart } from "@/components/ui-shell";

export function ProductsCard({
  payload,
  partial,
}: {
  payload: GenProductsPayload;
  partial?: boolean;
}) {
  const { add } = useCart();
  const items = payload.items ?? [];
  const layout = payload.layout ?? "carousel";
  const wrap = layout === "grid" ? "gen-grid" : layout === "list" ? "gen-list" : "gen-carousel";
  const empty = items.length === 0;
  return (
    <section className="gen-card ac-reveal" data-component="products">
      {payload.title ? <h3 className="gen-title">{payload.title}</h3> : null}
      <div className={wrap}>
        {items.map(({ product, reason }, i) => (
          <div key={product.id} className="gen-tile ac-reveal" style={{ animationDelay: `${i * 70}ms` }}>
            <Link href={`/urun/${product.id}`}>
              <img src={product.image} alt={product.name} />
            </Link>
            <div className="gen-meta">
              <Link href={`/urun/${product.id}`}>{product.name}</Link>
              <div className="faint">{money(product.price)}{product.stock <= 0 ? " · tükendi" : ""}</div>
              {reason ? <p className="gen-reason">{reason}</p> : null}
              <button
                className="chip"
                type="button"
                disabled={product.stock <= 0}
                onClick={() => void add(product.id)}
                style={{ marginTop: 8 }}
              >
                {product.stock <= 0 ? "Tükendi" : "Ekle"}
              </button>
            </div>
          </div>
        ))}
        {partial || empty ? (
          <>
            <div className="ac-skeleton gen-skel" aria-hidden />
            {empty ? <div className="ac-skeleton gen-skel" aria-hidden /> : null}
            {empty ? <div className="ac-skeleton gen-skel" aria-hidden /> : null}
          </>
        ) : null}
      </div>
    </section>
  );
}
