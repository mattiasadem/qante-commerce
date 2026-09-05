"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { CATEGORIES } from "@/lib/core";
import { ShopFooter, useAsk, useCart } from "@/components/ui-shell";
import { ProductCard, ProductGrid, SORTS, useFavorites, useRecentViews, type SortId } from "@/components/ui-shop-core";

export function HomeView({
  products,
  featured,
  query,
  category,
  initialFav = false,
  greeting,
  dateLabel,
}: {
  products: Product[];
  featured: Product[];
  query?: string;
  category?: string;
  initialFav?: boolean;
  greeting: string;
  dateLabel: string;
}) {
  const { requestAsk } = useAsk();
  const router = useRouter();
  const { ids: favIds, clear: clearFavorites } = useFavorites();
  const { ids: recentIds, clear: clearRecentViews } = useRecentViews();
  const { add } = useCart();
  const [favBusy, setFavBusy] = useState(false);
  const [sort, setSort] = useState<SortId>("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [favOnly, setFavOnly] = useState(Boolean(initialFav));
  const [recentOnly, setRecentOnly] = useState(false);
  function setFavFilter(next: boolean) {
    setFavOnly(next);
    if (next) setRecentOnly(false);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("cat", category);
    if (next) params.set("fav", "1");
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/", { scroll: false });
  }
  useEffect(() => {
    if (initialFav) {
      setFavOnly(true);
      setRecentOnly(false);
    }
  }, [initialFav]);
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
    if (favOnly) {
      const set = new Set(favIds);
      list = list.filter((p) => set.has(p.id));
    }
    if (recentOnly) {
      const order = new Map(recentIds.map((id, i) => [id, i]));
      list = list.filter((p) => order.has(p.id));
      list.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
    }
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (onSaleOnly) list = list.filter((p) => typeof p.compare_at === "number" && p.compare_at > p.price);
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    else if (sort === "stock")
      list.sort((a, b) => {
        const ao = a.stock > 0 ? 0 : 1;
        const bo = b.stock > 0 ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return b.stock - a.stock;
      });
    return list;
  }, [products, sort, inStockOnly, onSaleOnly, favOnly, favIds, recentOnly, recentIds]);
  const recentProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return recentIds.map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [products, recentIds]);
  const favInStock = useMemo(
    () => filtered.filter((p) => p.stock > 0),
    [filtered],
  );
  async function addAllFavorites() {
    if (!favInStock.length) return;
    setFavBusy(true);
    try {
      for (const p of favInStock) {
        await add(p.id, 1);
      }
    } finally {
      setFavBusy(false);
    }
  }
  const showFeatured =
    !query && !category && featured.length && sort === "default" && !inStockOnly && !onSaleOnly && !favOnly && !recentOnly;
  const showRecentRail =
    !query && !category && recentProducts.length > 0 && sort === "default" && !inStockOnly && !onSaleOnly && !favOnly && !recentOnly;
  return (
    <div className="grid-wrap">
      <div className="hero-row">
        <h1>{greeting}</h1>
        <span className="date-line">{dateLabel}</span>
      </div>
      <p className="lede">Bugün raflarda keten, yün ve ev. Asistan sağda; arama hem grid hem rayı doldurur.</p>
      <div className="chips scroll" data-chips="category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? "on" : ""}`}
            type="button"
            aria-pressed={category === c}
            onClick={() => pick(c)}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="chips scroll" data-chips="sort" role="tablist" aria-label="Sırala" style={{ marginTop: 8 }}>
        {SORTS.map((s) => (
          <button
            key={s.id}
            className={`chip ${sort === s.id ? "on" : ""}`}
            type="button"
            aria-pressed={sort === s.id}
            onClick={() => setSort(s.id)}
          >
            {s.label}
          </button>
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
        <button
          className={`chip ${favOnly ? "on" : ""}`}
          type="button"
          aria-pressed={favOnly}
          data-filter="favorites"
          onClick={() => setFavFilter(!favOnly)}
        >
          Favoriler{favIds.length ? ` · ${favIds.length}` : ""}
        </button>
        <button
          className={`chip ${recentOnly ? "on" : ""}`}
          type="button"
          aria-pressed={recentOnly}
          data-filter="recent"
          onClick={() => {
            setRecentOnly((v) => {
              const next = !v;
              if (next && favOnly) setFavFilter(false);
              return next;
            });
          }}
        >
          Son bakılanlar{recentIds.length ? ` · ${recentIds.length}` : ""}
        </button>
        {recentOnly && recentIds.length ? (
          <button
            className="chip"
            type="button"
            data-cta="clear-recent"
            onClick={() => {
              clearRecentViews();
              setRecentOnly(false);
            }}
          >
            Geçmişi temizle
          </button>
        ) : null}
        {favOnly && favInStock.length ? (
          <button
            className="chip on"
            type="button"
            data-cta="favorites-add-all"
            disabled={favBusy}
            onClick={() => void addAllFavorites()}
          >
            {favBusy ? "ekleniyor…" : `Tümünü sepete ekle · ${favInStock.length}`}
          </button>
        ) : null}
        {favOnly && favIds.length ? (
          <button
            className="chip"
            type="button"
            data-cta="clear-favorites"
            onClick={() => {
              clearFavorites();
              setFavFilter(false);
            }}
          >
            Favorileri temizle
          </button>
        ) : null}
      </div>
      {showRecentRail ? (
        <>
          <div className="section-label">Son bakılanlar</div>
          <div className="featured" data-rail="recent">
            {recentProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : null}
      {showFeatured ? (
        <>
          <div className="section-label">Öne çıkan</div>
          <div className="featured">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      ) : null}
      <div className="section-label">
        {query
          ? `${filtered.length} sonuç · ${query}`
          : favOnly
            ? `Favoriler · ${filtered.length}`
            : recentOnly
              ? `Son bakılanlar · ${filtered.length}`
              : category
                ? category
                : "Katalog"}
        {sort !== "default" ? ` · ${SORTS.find((s) => s.id === sort)?.label}` : ""}
        {inStockOnly ? " · stokta" : ""}
        {onSaleOnly ? " · indirimli" : ""}
      </div>
      <ProductGrid products={filtered} />
      <ShopFooter />
    </div>
  );
}
