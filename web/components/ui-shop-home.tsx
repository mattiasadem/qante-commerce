"use client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { CATEGORIES } from "@/lib/core";
import { ShopFooter, useAsk } from "@/components/ui-shell";
import { ProductCard, ProductGrid, SORTS, type SortId } from "@/components/ui-shop-core";

export function HomeView({ products, featured, query, category, greeting, dateLabel }: {
  products: Product[]; featured: Product[]; query?: string; category?: string; greeting: string; dateLabel: string;
}) {
  const { requestAsk } = useAsk();
  const router = useRouter();
  const [sort, setSort] = useState<SortId>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (next) params.set("cat", next);
    router.push(params.toString() ? `/?${params}` : "/");
  }
  const filtered = useMemo(() => {
    let list = [...products];
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (onSaleOnly) list = list.filter((p) => typeof p.compare_at === "number" && p.compare_at > p.price);
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "stock") list.sort((a, b) => {
      const ao = a.stock > 0 ? 0 : 1;
      const bo = b.stock > 0 ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return b.stock - a.stock;
    });
    return list;
  }, [products, sort, inStockOnly, onSaleOnly]);
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
        <button
          className={`chip ${inStockOnly ? "on" : ""}`}
          type="button"
          aria-pressed={inStockOnly}
          data-filter="in-stock"
          onClick={() => setInStockOnly((v) => !v)}
        >
          Sadece stokta
        </button>
        <button
          className={`chip ${onSaleOnly ? "on" : ""}`}
          type="button"
          aria-pressed={onSaleOnly}
          data-filter="on-sale"
          onClick={() => setOnSaleOnly((v) => !v)}
        >
          İndirimli
        </button>
      </div>
      {!query && !category && featured.length && sort === "default" && !inStockOnly && !onSaleOnly ? (
        <>
          <div className="section-label">Öne çıkan</div>
          <div className="featured">{featured.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </>
      ) : null}
      <div className="section-label">{query ? `${filtered.length} sonuç · ${query}` : category ? category : "Katalog"}{sort !== "default" ? ` · ${SORTS.find((s) => s.id === sort)?.label}` : ""}{inStockOnly ? " · stokta" : ""}{onSaleOnly ? " · indirimli" : ""}</div>
      <ProductGrid products={filtered} />
      <ShopFooter />
    </div>
  );
}
