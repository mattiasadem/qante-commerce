import type { Product, Order } from "@/lib/core-types";
import { PRODUCTS } from "@/lib/core-art";

const OR = "ord_0610|2026-06-10T11:00:00+03:00|fulfilled|219|prod_kadife_minder:1:219\nord_0620|2026-06-20T11:00:00+03:00|fulfilled|329.5|prod_ipek_fular:1:329.5\nord_0708|2026-07-08T11:20:00+03:00|fulfilled|1249.9|prod_keten_gomlek:1:1249.9\nord_0712|2026-07-12T16:05:00+03:00|fulfilled|249.9|prod_pamuklu_tisort:1:249.9\nord_0715|2026-07-15T09:40:00+03:00|fulfilled|2169.5|prod_yun_kazak:1:1490,prod_seramik_vazo:1:679.5\nord_0719|2026-07-19T14:10:00+03:00|cancelled|1890|prod_keten_pantolon:1:1890\nord_0722|2026-07-22T18:30:00+03:00|fulfilled|778|prod_yun_atki:2:389\nord_0728|2026-07-28T10:00:00+03:00|fulfilled|1498.9|prod_keten_gomlek:1:1249.9,prod_pamuklu_tisort:1:249.9\nord_0801|2026-08-01T13:15:00+03:00|fulfilled|888|prod_ahsap_tepsi:1:429,prod_cam_surahi:1:459\nord_0805|2026-08-05T12:00:00+03:00|fulfilled|1890|prod_keten_pantolon:1:1890\nord_0807|2026-08-07T09:25:00+03:00|fulfilled|679.5|prod_seramik_vazo:1:679.5\nord_0810|2026-08-10T17:40:00+03:00|fulfilled|2499.8|prod_keten_gomlek:2:1249.9\nord_0812|2026-08-12T11:05:00+03:00|fulfilled|1490|prod_yun_kazak:1:1490\nord_0814|2026-08-14T15:50:00+03:00|return_requested|1199|prod_keten_nevresim:1:1199\nord_0818|2026-08-18T10:20:00+03:00|fulfilled|888.8|prod_pamuklu_tisort:2:249.9,prod_yun_atki:1:389\nord_0820|2026-08-20T19:00:00+03:00|fulfilled|549|prod_deri_cuzdan:1:549\nord_0823|2026-08-23T13:35:00+03:00|fulfilled|1138.5|prod_seramik_vazo:1:679.5,prod_cam_surahi:1:459\nord_0826|2026-08-26T16:10:00+03:00|fulfilled|1249.9|prod_keten_gomlek:1:1249.9\nord_0828|2026-08-28T09:45:00+03:00|fulfilled|2319|prod_keten_pantolon:1:1890,prod_ahsap_tepsi:1:429\nord_0830|2026-08-30T12:00:00+03:00|paid|1490|prod_yun_kazak:1:1490\nord_0901|2026-09-01T08:30:00+03:00|pending_payment|389|prod_yun_atki:1:389\nord_0902|2026-09-02T14:20:00+03:00|return_requested|679.5|prod_seramik_vazo:1:679.5\nord_0903|2026-09-03T10:05:00+03:00|fulfilled|499.8|prod_pamuklu_tisort:2:249.9\nord_0904|2026-09-04T09:15:00+03:00|pending_payment|549|prod_deri_cuzdan:1:549\nord_0905|2026-09-04T11:40:00+03:00|pending_payment|429|prod_ahsap_tepsi:1:429";
export const ORDERS: Order[] = OR.split("\n").map((l) => {
  const [id, created_at, status, t, its] = l.split("|");
  return { id, created_at, status, total: +t, items: its.split(",").map((x) => { const [product_id, qty, price] = x.split(":"); return { product_id, qty: +qty, price: +price }; }) };
});

export const getProducts = () => PRODUCTS;
export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getOrders = () => ORDERS;
export const getFeatured = () => PRODUCTS.filter((p) => p.featured);
export function relatedTo(id: string, n = 3) {
  const cur = getProduct(id);
  const pool = PRODUCTS.filter((p) => p.id !== id).sort((a, b) => {
    const sa = a.category === cur?.category ? 0 : 1;
    const sb = b.category === cur?.category ? 0 : 1;
    return sa - sb;
  });
  return pool.slice(0, n);
}
export function filterCatalog(query?: string, category?: string) {
  const q = (query ?? "").trim().toLocaleLowerCase("tr-TR");
  const cat = (category ?? "").trim();
  return PRODUCTS.filter((p) => {
    const hay = `${p.name} ${p.category} ${p.tags.join(" ")} ${p.description}`.toLocaleLowerCase("tr-TR");
    const qOk = !q || hay.includes(q);
    let cOk = true;
    if (cat === "Yaz") cOk = p.tags.includes("yaz");
    else if (cat === "Kış") cOk = p.tags.includes("kış");
    else if (cat) cOk = p.category === cat;
    return qOk && cOk;
  });
}
export function qualityScore(p: Product) {
  let s = 48;
  if (p.description.length > 36) s += 12;
  if (p.stock > 0) s += 14; else s -= 8;
  if (p.compare_at) s += 8;
  if (p.colors?.length) s += 8;
  if (p.sizes?.length) s += 6;
  if (p.gallery.length >= 2) s += 4;
  return Math.max(12, Math.min(98, s));
}

export const KEYS: Record<string, string[]> = {
  gömlek: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  gomlek: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  keten: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_keten_nevresim"],
  yaz: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_ipek_fular"],
  yün: ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
  yun: ["prod_yun_atki", "prod_yun_kazak", "prod_ipek_fular"],
  atkı: ["prod_yun_atki", "prod_yun_kazak"],
  atki: ["prod_yun_atki", "prod_yun_kazak"],
  kazak: ["prod_yun_kazak", "prod_yun_atki", "prod_keten_gomlek"],
  vazo: ["prod_seramik_vazo", "prod_cam_surahi", "prod_ahsap_tepsi"],
  seramik: ["prod_seramik_vazo", "prod_cam_surahi", "prod_ahsap_tepsi"],
  ev: ["prod_seramik_vazo", "prod_ahsap_tepsi", "prod_cam_surahi"],
  cüzdan: ["prod_deri_cuzdan", "prod_ipek_fular", "prod_yun_atki"],
  cuzdan: ["prod_deri_cuzdan"],
  tişört: ["prod_pamuklu_tisort", "prod_keten_gomlek", "prod_keten_pantolon"],
  tisort: ["prod_pamuklu_tisort"],
  giyim: ["prod_keten_gomlek", "prod_keten_pantolon", "prod_yun_kazak"],
  aksesuar: ["prod_yun_atki", "prod_deri_cuzdan", "prod_ipek_fular"],
  kış: ["prod_yun_kazak", "prod_yun_atki", "prod_deri_cuzdan"],
  kis: ["prod_yun_kazak", "prod_yun_atki", "prod_deri_cuzdan"],
};

export function pick(ids: string[], n = 3) {
  const seen = new Set<string>();
  const out: Product[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const p = getProduct(id);
    if (p) out.push(p);
    if (out.length === n) break;
  }
  return out;
}
