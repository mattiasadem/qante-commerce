"use client";
import {
  parseSort,
  buildHomeQs,
  useHomeFilters as useHomeFiltersImpl,
} from "./ui-shop-home-filters-impl";

export { parseSort, buildHomeQs };

type FilterOpts = Parameters<typeof useHomeFiltersImpl>[0];

export function useHomeFilters(opts: FilterOpts) {
  const h = useHomeFiltersImpl(opts);
  return {
    ...h,
    setInStockOnly: (next: boolean | ((v: boolean) => boolean)) => {
      const value = typeof next === "function" ? next(h.inStockOnly) : next;
      h.setInStockOnly(value);
    },
    setOutOfStockOnly: (next: boolean | ((v: boolean) => boolean)) => {
      const value = typeof next === "function" ? next(h.outOfStockOnly) : next;
      h.setOutOfStockOnly(value);
    },
  };
}
