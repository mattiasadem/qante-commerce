import { notFound } from "next/navigation";
import { AssistantRail, AssistantSheet, PdpView } from "@/components/ui-shop";
import { getProduct, getProducts, relatedTo } from "@/lib/core";

export function generateStaticParams() {
  return getProducts().map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) notFound();
  return (
    <div className="shop">
      <PdpView product={product} related={relatedTo(id)} />
      <AssistantRail productId={product.id} />
      <AssistantSheet productId={product.id} />
    </div>
  );
}
