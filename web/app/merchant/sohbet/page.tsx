import { MerchantShell } from "@/components/MerchantShell";
import { MerchantChat } from "@/components/MerchantChat";

export default async function SohbetPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return (
    <MerchantShell current="/merchant/sohbet">
      <h1>Sohbet</h1>
      <MerchantChat prefill={q} />
    </MerchantShell>
  );
}
