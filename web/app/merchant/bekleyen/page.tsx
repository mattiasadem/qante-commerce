import { MerchantShell } from "@/components/MerchantShell";
import { StagedQueue } from "@/components/ui-merchant";
import { getStaged } from "@/lib/core";

export const dynamic = "force-dynamic";

export default function BekleyenPage() {
  return (
    <MerchantShell current="/merchant/bekleyen">
      <header className="ops-head">
        <h1>Bekleyen</h1>
        <p className="lede">
          Onay kuyruğu. Toplu onayla yerel deftere yazar; canlı ikas yazımı kapalı.
        </p>
      </header>
      <StagedQueue initial={getStaged()} />
    </MerchantShell>
  );
}
