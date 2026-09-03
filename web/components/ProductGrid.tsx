import type { Product } from "@/lib/types";
import { ProductTile } from "@/components/ProductTile";

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductTile key={p.id} product={p} />
      ))}
    </div>
  );
}
