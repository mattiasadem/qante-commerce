import { AssistantRail, AssistantSheet } from "@/components/AssistantRail";
import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/seed";

function fold(s: string): string {
  return s.toLocaleLowerCase("tr-TR");
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const all = getProducts();
  const query = (q ?? "").trim();
  const products = query
    ? all.filter((p) => {
        const hay = fold(`${p.name} ${p.category} ${p.tags.join(" ")} ${p.description}`);
        return hay.includes(fold(query));
      })
    : all;
  return (
    <div className="shop">
      <div className="grid-wrap">
        <h1>Mağaza</h1>
        {query ? <p className="muted" style={{ marginTop: -8 }}>{products.length} sonuç · {query}</p> : (
          <p className="muted" style={{ marginTop: -8 }}>Keten, yün, ev.</p>
        )}
        <ProductGrid products={products.length ? products : all} />
      </div>
      <AssistantRail />
      <AssistantSheet />
    </div>
  );
}
