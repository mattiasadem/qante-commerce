import { MerchantShell } from "@/components/MerchantShell";
import { MerchantChat } from "@/components/ui-merchant";

export default async function SohbetPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <MerchantShell current="/merchant/sohbet">
      <header className="ops-head">
        <h1>Sohbet</h1>
        <p className="lede">
          Özet, stok ve bekleyen için starter&apos;lar. URL (?q=) paylaşılabilir; Yenile / Düzelt / İndirim yerel kuyruğa yazar; Onayla ikas&apos;a gitmez.
        </p>
      </header>
      <MerchantChat prefill={q} />
    </MerchantShell>
  );
}
