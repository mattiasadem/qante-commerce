import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PdpView } from "@/components/ui-shop";
import { AssistantRail, AssistantSheet } from "@/components/GenAssistant";
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
      <Suspense fallback={<div className="grid-wrap"><p className="muted">ürün</p></div>}>
        <PdpView product={product} related={relatedTo(id)} />
      </Suspense>
      <AssistantRail productId={product.id} />
      <AssistantSheet productId={product.id} />
    </div>
  );
}
