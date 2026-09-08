import { Suspense } from "react";
import { CatalogTable } from "@/components/ui-merchant";
import { MerchantShell } from "@/components/ui-shell";
import { getProducts } from "@/lib/core";

export const dynamic = "force-dynamic";

export default function KatalogPage() {
  return (
    <MerchantShell current="/merchant/katalog">
      <header className="ops-head">
        <h1>Katalog</h1>
        <p className="lede">
          12 ürün. Filtre + URL (filter/cat/q/sort) + toplu aksiyonlar yerel Bekleyen kuyruğuna yazar.
        </p>
      </header>
      <Suspense fallback={<p className="muted">katalog…</p>}>
        <CatalogTable products={getProducts()} />
      </Suspense>
    </MerchantShell>
  );
}
