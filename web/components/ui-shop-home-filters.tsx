"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell";
import { SORTS, isLowStock, useFavorites, useRecentViews, useRestockWatch, type SortId } from "@/components/ui-shop-core";

const SORT_IDS = new Set<SortId>(SORTS.map((s) => s.id));


function parseCompareParam(raw?: string | null): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of raw.split(/[,+|]/)) {
    const id = part.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= 3) break;
  }
  return out;
}

export function parseSort(v?: string | null): SortId {
  if (v && SORT_IDS.has(v as SortId) && v !== "default") return v as SortId;
  return "default";
}

export function buildHomeQs(opts: {
  query?: string;
  category?: string;
  sort: SortId;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  lowStockOnly: boolean;
  favOnly: boolean;
  recentOnly: boolean;
  watchOnly: boolean;
  compareIds?: string[];
}) {
  const params = new URLSearchParams();
  if (opts.query) params.set("q", opts.query);
  if (opts.category) params.set("cat", opts.category);
  if (opts.sort !== "default") params.set("sort", opts.sort);
  if (opts.inStockOnly) params.set("stock", "1");
  if (opts.onSaleOnly) params.set("sale", "1");
  if (opts.lowStockOnly) params.set("low", "1");
  if (opts.favOnly) params.set("fav", "1");
  if (opts.recentOnly) params.set("recent", "1");
  if (opts.watchOnly) params.set("watch", "1");
  const compare = (opts.compareIds ?? []).map((x) => x.trim()).filter(Boolean).slice(0, 3);
  if (compare.length) params.set("compare", compare.join(","));
  return params.toString();
}

export function useHomeFilters(opts: {
  products: Product[];
  query?: string;
  category?: string;
  initialFav?: boolean;
  initialSort?: SortId;
  initialStock?: boolean;
  initialSale?: boolean;
  initialLow?: boolean;
  initialRecent?: boolean;
  initialWatch?: boolean;
}) {
  const {
    products,
    query,
    category,
    initialFav = false,
    initialSort = "default",
    initialStock = false,
    initialSale = false,
    initialLow = false,
    initialRecent = false,
    initialWatch = false,
  } = opts;
  const { requestAsk } = useAsk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const compareIds = useMemo(() => parseCompareParam(searchParams.get("compare")), [searchParams]);
  const { ids: favIds, clear: clearFavorites } = useFavorites();
  const { ids: recentIds, clear: clearRecentViews } = useRecentViews();
  const { ids: watchIds, clear: clearRestockWatch } = useRestockWatch();
  const { add } = useCart();
  const [favBusy, setFavBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [recentBusy, setRecentBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sort, setSort] = useState<SortId>(parseSort(initialSort));
  const [inStockOnly, setInStockOnly] = useState(Boolean(initialStock));
  const [onSaleOnly, setOnSaleOnly] = useState(Boolean(initialSale));
  const [lowStockOnly, setLowStockOnly] = useState(Boolean(initialLow));
  const [favOnly, setFavOnly] = useState(Boolean(initialFav));
  const [recentOnly, setRecentOnly] = useState(Boolean(initialRecent) && !initialFav && !initialWatch);
  const [watchOnly, setWatchOnly] = useState(Boolean(initialWatch) && !initialFav);

  useEffect(() => { setSort(parseSort(initialSort)); }, [initialSort]);
  useEffect(() => { setInStockOnly(Boolean(initialStock)); }, [initialStock]);
  useEffect(() => { setOnSaleOnly(Boolean(initialSale)); }, [initialSale]);
  useEffect(() => { setLowStockOnly(Boolean(initialLow)); }, [initialLow]);
  useEffect(() => {
    if (initialFav) { setFavOnly(true); setRecentOnly(false); setWatchOnly(false); }
    else setFavOnly(false);
  }, [initialFav]);
  useEffect(() => {
    if (initialWatch && !initialFav) { setWatchOnly(true); setRecentOnly(false); setFavOnly(false); }
    else if (!initialWatch) setWatchOnly(false);
  }, [initialWatch, initialFav]);
  useEffect(() => {
    if (initialRecent && !initialFav && !initialWatch) { setRecentOnly(true); setFavOnly(false); setWatchOnly(false); }
    else if (!initialRecent) setRecentOnly(false);
  }, [initialRecent, initialFav, initialWatch]);

  useEffect(() => {
    const next = buildHomeQs({ query, category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly,
      compareIds,
    });
    const cur = buildHomeQs({
      query, category,
      sort: parseSort(initialSort),
      inStockOnly: Boolean(initialStock),
      onSaleOnly: Boolean(initialSale),
      lowStockOnly: Boolean(initialLow),
      favOnly: Boolean(initialFav),
      recentOnly: Boolean(initialRecent) && !initialFav && !initialWatch,
      watchOnly: Boolean(initialWatch) && !initialFav,
      compareIds,
    });
    if (next === cur) return;
    router.replace(next ? `/?${next}` : "/", { scroll: false });
  }, [query, category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly, compareIds, initialSort, initialStock, initialSale, initialLow, initialFav, initialRecent, initialWatch, router]);

  function setFavFilter(next: boolean) {
    setFavOnly(next);
    if (next) { setRecentOnly(false); setWatchOnly(false); }
  }
  function setWatchFilter(next: boolean) {
    setWatchOnly(next);
    if (next) { setFavOnly(false); setRecentOnly(false); }
  }
  function setRecentFilter(next: boolean) {
    setRecentOnly(next);
    if (next) { setFavOnly(false); setWatchOnly(false); }
  }
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const qs = buildHomeQs({ query, category: next || undefined, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly,
      compareIds,
    });
    router.push(qs ? `/?${qs}` : "/");
  }
  async function copyLink() {
    const qs = buildHomeQs({ query, category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly,
      compareIds,
    });
    const path = qs ? `/?${qs}` : "/";
    const href = typeof window !== "undefined" ? `${window.location.origin}${path}` : path;
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch { /* ignore */ }
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
    if (watchOnly) {
      const order = new Map(watchIds.map((id, i) => [id, i]));
      list = list.filter((p) => order.has(p.id));
      list.sort((a, b) => {
        const ao = a.stock > 0 ? 0 : 1;
        const bo = b.stock > 0 ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return order.get(a.id)! - order.get(b.id)!;
      });
    }
    if (inStockOnly) list = list.filter((p) => p.stock > 0);
    if (onSaleOnly) list = list.filter((p) => typeof p.compare_at === "number" && p.compare_at > p.price);
    if (lowStockOnly) list = list.filter((p) => isLowStock(p.stock));
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
  }, [products, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, favIds, recentOnly, recentIds, watchOnly, watchIds]);

  const recentProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return recentIds.map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [products, recentIds]);
  const favProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return favIds.map((id) => map.get(id)).filter(Boolean) as Product[];
  }, [products, favIds]);
  const watchProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    const list = watchIds.map((id) => map.get(id)).filter(Boolean) as Product[];
    // In-stock (back) first, then watch order
    list.sort((a, b) => {
      const ao = a.stock > 0 ? 0 : 1;
      const bo = b.stock > 0 ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return watchIds.indexOf(a.id) - watchIds.indexOf(b.id);
    });
    return list;
  }, [products, watchIds]);
  const favInStock = useMemo(() => {
    const base = favOnly ? filtered : favProducts;
    return base.filter((p) => p.stock > 0);
  }, [favOnly, filtered, favProducts]);
  const recentInStock = useMemo(() => recentProducts.filter((p) => p.stock > 0), [recentProducts]);
  const watchInStock = useMemo(() => {
    const base = watchOnly ? filtered : watchProducts;
    return base.filter((p) => p.stock > 0);
  }, [watchOnly, filtered, watchProducts]);
  const watchBackCount = useMemo(
    () => products.filter((p) => watchIds.includes(p.id) && p.stock > 0).length,
    [products, watchIds],
  );

  async function addAllFavorites() {
    if (!favInStock.length) return;
    setFavBusy(true);
    try { for (const p of favInStock) await add(p.id, 1); }
    finally { setFavBusy(false); }
  }
  async function addAllRecentInStock() {
    if (!recentInStock.length) return;
    setRecentBusy(true);
    try { for (const p of recentInStock) await add(p.id, 1); }
    finally { setRecentBusy(false); }
  }
  async function addAllWatchInStock() {
    if (!watchInStock.length) return;
    setWatchBusy(true);
    try { for (const p of watchInStock) await add(p.id, 1); }
    finally { setWatchBusy(false); }
  }

  return {
    sort, setSort, inStockOnly, setInStockOnly, onSaleOnly, setOnSaleOnly, lowStockOnly, setLowStockOnly,
    favOnly, recentOnly, watchOnly, favIds, recentIds, watchIds, favBusy, watchBusy, recentBusy, copied,
    filtered, recentProducts, favProducts, watchProducts, favInStock, recentInStock, watchInStock, watchBackCount,
    setFavFilter, setWatchFilter, setRecentFilter, pick, copyLink,
    addAllFavorites, addAllRecentInStock, addAllWatchInStock, clearFavorites, clearRecentViews, clearRestockWatch,
    query, category,
  };
}
