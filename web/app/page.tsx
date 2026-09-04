export const dynamic = "force-dynamic";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";
import { HomeView } from "@/components/ui-shop";
import { filterCatalog, getFeatured, greeting, shortDate } from "@/lib/core";

export default async function HomePage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const products = filterCatalog(q, cat);
  return (
    <div className="shop">
      <HomeView
        products={products}
        featured={getFeatured()}
        query={q}
        category={cat}
        greeting={greeting()}
        dateLabel={shortDate()}
      />
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
