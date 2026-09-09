export const dynamic = "force-dynamic";
import { AssistantRail, AssistantSheet, HomeView } from "@/components/ui-shop";
import { filterCatalog, getFeatured, greeting, shortDate } from "@/lib/core";

const SORT_OK = new Set(["default", "price_asc", "price_desc", "stock"]);

function truthy(v?: string) {
  if (!v) return false;
  const t = v.trim().toLowerCase();
  return t === "1" || t === "true" || t === "yes";
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    cat?: string;
    fav?: string;
    sort?: string;
    stock?: string;
    sale?: string;
    low?: string;
    recent?: string;
    watch?: string;
    cmp?: string;
  }>;
}) {
  const { q, cat, fav, sort, stock, sale, low, recent, watch, cmp } = await searchParams;
  const products = filterCatalog(q, cat);
  const initialFav = truthy(fav);
  const initialWatch = truthy(watch) && !initialFav;
  const initialCompare = truthy(cmp) && !initialFav && !initialWatch;
  const initialRecent = truthy(recent) && !initialFav && !initialWatch && !initialCompare;
  const initialSort = (sort && SORT_OK.has(sort) ? sort : "default") as
    | "default"
    | "price_asc"
    | "price_desc"
    | "stock";
  return (
    <div className="shop">
      <HomeView
        products={products}
        featured={getFeatured()}
        query={q}
        category={cat}
        initialFav={initialFav}
        initialSort={initialSort}
        initialStock={truthy(stock)}
        initialSale={truthy(sale)}
        initialLow={truthy(low)}
        initialRecent={initialRecent}
        initialWatch={initialWatch}
        initialCompare={initialCompare}
        greeting={greeting()}
        dateLabel={shortDate()}
      />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
