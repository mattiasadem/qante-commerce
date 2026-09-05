export const dynamic = "force-dynamic";
import { AssistantRail, AssistantSheet, HomeView } from "@/components/ui-shop";
import { filterCatalog, getFeatured, greeting, shortDate } from "@/lib/core";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; fav?: string }> }) {
  const { q, cat, fav } = await searchParams;
  const products = filterCatalog(q, cat);
  const initialFav = fav === "1" || fav === "true" || fav === "yes";
  return (
    <div className="shop">
      <HomeView
        products={products}
        featured={getFeatured()}
        query={q}
        category={cat}
        initialFav={initialFav}
        greeting={greeting()}
        dateLabel={shortDate()}
      />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
