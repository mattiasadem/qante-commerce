import Link from "next/link";
import { notFound } from "next/navigation";
import { AskAboutProduct } from "@/components/AskAboutProduct";
import { AssistantRail, AssistantSheet } from "@/components/AssistantRail";
import { AddButton } from "@/components/AddButton";
import { getProduct, getProducts } from "@/lib/seed";
import { money } from "@/lib/format";

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <div className="shop">
      <div className="product-page">
        <div className="hero">
          <img src={product.image} alt={product.name} />
        </div>
        <div>
          <p className="faint">{product.category}</p>
          <h1>{product.name}</h1>
          <p>
            <span className="price">{money(product.price)}</span>
            {product.compare_at ? <span className="compare">{money(product.compare_at)}</span> : null}
          </p>
          <p className="muted">{product.description}</p>
          <p className="faint">{product.stock > 0 ? `stok ${product.stock}` : "tükendi"}</p>
          <AddButton productId={product.id} disabled={product.stock <= 0} />
          <AskAboutProduct product={product} />
          <p style={{ marginTop: 24 }}>
            <Link href="/" className="muted">
              Mağazaya dön
            </Link>
          </p>
        </div>
      </div>
      <AssistantRail productId={product.id} />
      <AssistantSheet productId={product.id} />
    </div>
  );
}
