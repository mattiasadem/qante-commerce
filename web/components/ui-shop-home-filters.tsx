"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/core";
import { useAsk, useCart } from "@/components/ui-shell";
import { SORTS, isLowStock, useFavorites, useRecentViews, useRestockWatch, type SortId } from "@/components/ui-shop-core";
import { useCompare } from "@/components/ui-compare-model";

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
  compareOnly: boolean;
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
  if (opts.compareOnly) params.set("cmp", "1");
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
  initialCompare?: boolean;
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
    initialCompare = false,
  } = opts;
  const { requestAsk } = useAsk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const compareIds = useMemo(() => parseCompareParam(searchParams.get("compare")), [searchParams]);
  const { ids: favIds, clear: clearFavorites } = useFavorites();
  const { ids: recentIds, clear: clearRecentViews } = useRecentViews();
  const { ids: watchIds, clear: clearRestockWatch } = useRestockWatch();
  const { items: compareItems, clear: clearCompare } = useCompare();
  const { add } = useCart();
  const [favBusy, setFavBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [recentBusy, setRecentBusy] = useState(false);
  const [compareBusy, setCompareBusy] = useState(false);
  const [saleBusy, setSaleBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sort, setSort] = useState<SortId>(parseSort(initialSort));
  const [inStockOnly, setInStockOnly] = useState(Boolean(initialStock));
  const [onSaleOnly, setOnSaleOnly] = useState(Boolean(initialSale));
  const [lowStockOnly, setLowStockOnly] = useState(Boolean(initialLow));
  const [favOnly, setFavOnly] = useState(Boolean(initialFav));
  const [watchOnly, setWatchOnly] = useState(Boolean(initialWatch) && !initialFav);
  const [compareOnly, setCompareOnly] = useState(Boolean(initialCompare) && !initialFav && !initialWatch);
  const [recentOnly, setRecentOnly] = useState(Boolean(initialRecent) && !initialFav && !initialWatch && !initialCompare);

  useEffect(() => { setSort(parseSort(initialSort)); }, [initialSort]);
  useEffect(() => { setInStockOnly(Boolean(initialStock)); }, [initialStock]);
  useEffect(() => { setOnSaleOnly(Boolean(initialSale)); }, [initialSale]);
  useEffect(() => { setLowStockOnly(Boolean(initialLow)); }, [initialLow]);
  useEffect(() => {
    if (initialFav) { setFavOnly(true); setRecentOnly(false); setWatchOnly(false); setCompareOnly(false); }
    else setFavOnly(false);
  }, [initialFav]);
  useEffect(() => {
    if (initialWatch && !initialFav) { setWatchOnly(true); setRecentOnly(false); setFavOnly(false); setCompareOnly(false); }
    else if (!initialWatch) setWatchOnly(false);
  }, [initialWatch, initialFav]);
  useEffect(() => {
    if (initialCompare && !initialFav && !initialWatch) { setCompareOnly(true); setRecentOnly(false); setFavOnly(false); setWatchOnly(false); }
    else if (!initialCompare) setCompareOnly(false);
  }, [initialCompare, initialFav, initialWatch]);
  useEffect(() => {
    if (initialRecent && !initialFav && !initialWatch && !initialCompare) { setRecentOnly(true); setFavOnly(false); setWatchOnly(false); setCompareOnly(false); }
    else if (!initialRecent) setRecentOnly(false);
  }, [initialRecent, initialFav, initialWatch, initialCompare]);

  useEffect(() => {
    const next = buildHomeQs({ query, category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly, compareOnly,
      compareIds,
    });
    const cur = buildHomeQs({
      query, category,
      sort: parseSort(initialSort),
      inStockOnly: Boolean(initialStock),
      onSaleOnly: Boolean(initialSale),
      lowStockOnly: Boolean(initialLow),
      favOnly: Boolean(initialFav),
      recentOnly: Boolean(initialRecent) && !initialFav && !initialWatch && !initialCompare,
      watchOnly: Boolean(initialWatch) && !initialFav,
      compareOnly: Boolean(initialCompare) && !initialFav && !initialWatch,
      compareIds,
    });
    if (next === cur) return;
    router.replace(next ? `/?${next}` : "/", { scroll: false });
  }, [query, category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly, compareOnly, compareIds, initialSort, initialStock, initialSale, initialLow, initialFav, initialRecent, initialWatch, initialCompare, router]);

  function setFavFilter(next: boolean) {
    setFavOnly(next);
    if (next) { setRecentOnly(false); setWatchOnly(false); setCompareOnly(false); }
  }
  function setWatchFilter(next: boolean) {
    setWatchOnly(next);
    if (next) { setFavOnly(false); setRecentOnly(false); setCompareOnly(false); }
  }
  function setRecentFilter(next: boolean) {
    setRecentOnly(next);
    if (next) { setFavOnly(false); setWatchOnly(false); setCompareOnly(false); }
  }
  function setCompareFilter(next: boolean) {
    setCompareOnly(next);
    if (next) { setFavOnly(false); setRecentOnly(false); setWatchOnly(false); }
  }
  function pick(cat: string) {
    const next = category === cat ? "" : cat;
    requestAsk(next ? `${next} bakıyorum` : "öne çıkanlar");
    const qs = buildHomeQs({ query, category: next || undefined, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly, compareOnly,
      compareIds,
    });
    router.push(qs ? `/?${qs}` : "/");
  }
  async function copyLink() {
    const qs = buildHomeQs({ query, category: category, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, recentOnly, watchOnly, compareOnly,
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
    if (compareOnly) {
      const order = new Map(compareItems.map((c, i) => [c.id, i]));
      list = list.filter((p) => order.has(p.id));
      list.sort((a, b) => (order.get(a.id)! - order.get(b.id)!));
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
  }, [products, sort, inStockOnly, onSaleOnly, lowStockOnly, favOnly, favIds, recentOnly, recentIds, watchOnly, watchIds, compareOnly, compareItems]);

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
    list.sort((a, b) => {
      const ao = a.stock > 0 ? 0 : 1;
      const bo = b.stock > 0 ? 0 : 1;
      if (ao !== bo) return ao - bo;
      return watchIds.indexOf(a.id) - watchIds.indexOf(b.id);
    });
    return list;
  }, [products, watchIds]);
  const compareProducts = useMemo(() => {
    const map = new Map(products.map((p) => [p.id, p]));
    return compareItems.map((c) => map.get(c.id)).filter(Boolean) as Product[];
  }, [products, compareItems]);
  const favInStock = useMemo(() => {
    const base = favOnly ? filtered : favProducts;
    return base.filter((p) => p.stock > 0);
  }, [favOnly, filtered, favProducts]);
  const recentInStock = useMemo(() => recentProducts.filter((p) => p.stock > 0), [recentProducts]);
  const watchInStock = useMemo(() => {
    const base = watchOnly ? filtered : watchProducts;
    return base.filter((p) => p.stock > 0);
  }, [watchOnly, filtered, watchProducts]);
  const compareInStock = useMemo(() => {
    const base = compareOnly ? filtered : compareProducts;
    return base.filter((p) => p.stock > 0);
  }, [compareOnly, filtered, compareProducts]);
  const saleProducts = useMemo(() => {
    const list = products.filter((p) => typeof p.compare_at === "number" && p.compare_at > p.price);
    list.sort((a, b) => {
      const ad = (a.compare_at ?? a.price) - a.price;
      const bd = (b.compare_at ?? b.price) - b.price;
      if (bd !== ad) return bd - ad;
      return a.price - b.price;
    });
    return list;
  }, [products]);
  const saleInStock = useMemo(() => {
    const base = onSaleOnly ? filtered : saleProducts;
    return base.filter((p) => p.stock > 0);
  }, [onSaleOnly, filtered, saleProducts]);
  const compareIdsLive = useMemo(() => compareItems.map((c) => c.id), [compareItems]);
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
  async function addAllCompareInStock() {
    if (!compareInStock.length) return;
    setCompareBusy(true);
    try { for (const p of compareInStock) await add(p.id, 1); }
    finally { setCompareBusy(false); }
  }
  async function addAllSaleInStock() {
    if (!saleInStock.length) return;
    setSaleBusy(true);
    try { for (const p of saleInStock) await add(p.id, 1); }
    finally { setSaleBusy(false); }
  }

  function clearAllFilters() {
    setSort("default");
    setInStockOnly(false);
    setOnSaleOnly(false);
    setLowStockOnly(false);
    setFavOnly(false);
    setRecentOnly(false);
    setWatchOnly(false);
    setCompareOnly(false);
    const qs = buildHomeQs({
      sort: "default",
      inStockOnly: false,
      onSaleOnly: false,
      lowStockOnly: false,
      favOnly: false,
      recentOnly: false,
      watchOnly: false,
      compareOnly: false,
      compareIds,
    });
    router.push(qs ? `/?${qs}` : "/");
  }

  const filtersActive = Boolean(
    category ||
      query ||
      sort !== "default" ||
      inStockOnly ||
      onSaleOnly ||
      lowStockOnly ||
      favOnly ||
      recentOnly ||
      watchOnly ||
      compareOnly,
  );

  return {
    sort, setSort, inStockOnly, setInStockOnly, onSaleOnly, setOnSaleOnly, lowStockOnly, setLowStockOnly,
    favOnly, recentOnly, watchOnly, compareOnly, favIds, recentIds, watchIds, compareIdsLive, favBusy, watchBusy, recentBusy, compareBusy, saleBusy, copied,
    filtered, recentProducts, favProducts, watchProducts, compareProducts, saleProducts, favInStock, recentInStock, watchInStock, compareInStock, saleInStock, watchBackCount,
    setFavFilter, setWatchFilter, setRecentFilter, setCompareFilter, pick, copyLink,
    addAllFavorites, addAllRecentInStock, addAllWatchInStock, addAllCompareInStock, addAllSaleInStock, clearFavorites, clearRecentViews, clearRestockWatch, clearCompare,
    clearAllFilters, filtersActive,
    query, category,
  };
}
