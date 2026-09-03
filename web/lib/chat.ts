import type { ChatResponse, Product } from "@/lib/types";
import { getProduct } from "@/lib/seed";

const KEYS: Record<string, string[]> = {
  gömlek: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  gomlek: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  keten: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  yaz: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_ipek_fular"],
  yün: ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
  yun: ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
  atkı: ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
  atki: ["prod_yun_atki", "prod_yun_kazak"],
  kazak: ["prod_yun_kazak", "prod_yun_atki", "prod_keten_gomlek"],
  vazo: ["prod_seramik_vazo", "prod_cam_surahi", "prod_ahsap_tepsi"],
  seramik: ["prod_seramik_vazo", "prod_cam_surahi", "prod_ahsap_tepsi"],
  ev: ["prod_seramik_vazo", "prod_ahsap_tepsi", "prod_cam_surahi"],
  cüzdan: ["prod_deri_cuzdan", "prod_ipek_fular", "prod_yun_atki"],
  cuzdan: ["prod_deri_cuzdan"],
  tişört: ["prod_pamuklu_tisort", "prod_keten_gomlek", "prod_keten_pantolon"],
  tisort: ["prod_pamuklu_tisort"],
};

function pick(ids: string[]): Product[] {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const product = getProduct(id);
    if (product) out.push(product);
    if (out.length === 3) break;
  }
  return out;
}

export function demoTurn(message: string, productId?: string | null): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const ids: string[] = [];
  if (productId) ids.push(productId);
  for (const [key, values] of Object.entries(KEYS)) {
    if (text.includes(key)) ids.push(...values);
  }
  if (ids.length === 0) {
    ids.push("prod_keten_gomlek", "prod_seramik_vazo", "prod_yun_kazak");
  }
  const products = pick(ids);
  const names = products.map((p) => p.name).join(", ");
  let reply: string;
  if (productId) {
    const current = getProduct(productId);
    const label = current?.name ?? "Bu parça";
    const stock = current?.stock ?? 0;
    reply = `${label} stokta ${stock} adet. Yakın üç öneri: ${names}.`;
  } else if (text.includes("iade")) {
    reply = "İade 14 gün. Etiket duruyorsa mağaza veya kargo ile. Ürünler aşağıda.";
  } else if (text.includes("kargo")) {
    reply = "Kargo 1-3 iş günü. 1500 ₺ ve üzeri kargo yok. Bakabileceğin parçalar:";
  } else {
    reply = `${names} bu aramaya uyuyor. Stok ve fiyat kartlarda.`;
  }
  return {
    text: reply,
    ui: [{ type: "present_products", products }],
    suggestions: ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"],
  };
}
