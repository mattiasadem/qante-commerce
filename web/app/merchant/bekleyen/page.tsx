import { MerchantShell } from "@/components/MerchantShell";

export default function BekleyenPage() {
  return (
    <MerchantShell current="/merchant/bekleyen">
      <h1>Bekleyen</h1>
      <p className="muted">Bekleyen değişiklik yok. Staged writes F2.</p>
    </MerchantShell>
  );
}
