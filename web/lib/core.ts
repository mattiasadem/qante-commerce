export type Swatch = { id: string; name: string; hex: string };
export type Product = {
  id: string; name: string; category: string; price: number; compare_at: number | null;
  stock: number; sku: string; description: string; image: string; gallery: string[];
  tags: string[]; colors?: Swatch[]; sizes?: string[]; featured?: boolean;
};
export type Cart = { items: { product_id: string; qty: number; product: Product | null; line_total: number }[]; subtotal: number; currency: string };
export type Snapshot = { period_start: string; period_end: string; period_days: number; revenue: number; order_count: number; aov: number; cancel_rate: number; refund_rate: number; revenue_delta_pct: number; order_delta_pct: number; aov_delta_pct: number };
export type Alert = { kind: string; product_id: string; product_name: string; stock: number; days_cover: number | null; days_without_sale: number | null; message: string };
export type Issue = { kind: string; order_id: string; status: string; age_hours: number; total: number; message: string };
export type WeeklyBar = { label: string; value: number };
export type Guard = { id: string; label: string; ok: boolean };
export type StagedChange = {
  id: string; kind: "price" | "stock" | "listing"; product_id: string; product_name: string;
  staged_by: string; created_at: string; variant_count: number;
  before: Record<string, string>; after: Record<string, string>; reason: string;
  guardrails: Guard[]; status: "staged" | "discarded" | "applied"; decision_note?: string;
};
export type LedgerEntry = { status: "applied" | "discarded"; decision_note?: string; decided_at?: string };
export type UiBlock = { type: string; products?: Product[]; rows?: { label: string; value: string }[]; columns?: string[]; table?: string[][] };
export type ChatResponse = { text: string; ui: UiBlock[]; suggestions: string[]; activity: string };

export const money = (n: number) => `${new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)} ₺`;
export const number = (n: number, d = 0) => new Intl.NumberFormat("tr-TR", { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
export const percent = (n: number) => `${n > 0 ? "+" : ""}${number(n, 1)}%`;
export function shortDate(iso?: string | Date) {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" }).format(d);
}
export function greeting(now = new Date()) {
  const h = Number(new Intl.DateTimeFormat("tr-TR", { hour: "numeric", hour12: false, timeZone: "Europe/Istanbul" }).format(now));
  if (h < 12) return "Günaydın";
  if (h < 18) return "İyi günler";
  return "İyi akşamlar";
}

export const SHIP_FREE = 1500;
export const RETURN_DAYS = 30;
export const IKAS_WRITES_ENABLED = false;
export const CATEGORIES = ["Giyim", "Ev", "Aksesuar", "Yaz", "Kış"] as const;
export const BRAND = {
  name: "Qante", assistant_name: "Qante Asistan", voice: "samimi, kısa, Türkçe",
  tokens: { bg: "#0b0b0b", surface: "#171717", text: "#f3f3f0", muted: "#9a9a94", accent: "#d8c7a6", radius: "12px", grain: "dark" },
  logo: { kind: "square_round_pip" }, ship_free: SHIP_FREE, return_days: RETURN_DAYS, writes_enabled: IKAS_WRITES_ENABLED,
};
export const logoSvg = (s = 32) => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 32 32"><rect width="32" height="32" fill="#d8c7a6"/><circle cx="24" cy="24" r="6" fill="#0b0b0b"/></svg>`;

function art(bg: string, extra: string, shift = 0) {
  const cx = 32 + shift * 20;
  const cy = 24 + shift * 10;
  const xml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500"><defs><radialGradient id="sp" cx="${cx}%" cy="${cy}%" r="68%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset="1" stop-color="${bg}" stop-opacity="0"/></radialGradient><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .5 0"/></filter></defs><rect width="400" height="500" fill="${bg}"/><circle cx="${70 + shift * 50}" cy="${80 + shift * 20}" r="170" fill="#fff" opacity=".05"/><rect width="400" height="500" fill="url(#sp)"/>${extra}<rect width="400" height="500" filter="url(#n)" opacity=".18"/></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(xml)}`;
}
const S = {
  shirt: (f: string) => `<rect x="118" y="92" width="164" height="28" rx="6" fill="${f}" opacity=".55"/><rect x="108" y="118" width="184" height="250" rx="14" fill="${f}"/><rect x="78" y="130" width="42" height="150" rx="16" fill="${f}" opacity=".85"/><rect x="280" y="130" width="42" height="150" rx="16" fill="${f}" opacity=".85"/><circle cx="200" cy="118" r="22" fill="${f}" opacity=".4"/>`,
  pants: (f: string) => `<rect x="132" y="90" width="136" height="36" rx="8" fill="${f}" opacity=".7"/><rect x="118" y="122" width="68" height="270" rx="12" fill="${f}"/><rect x="214" y="122" width="68" height="270" rx="12" fill="${f}"/>`,
  scarf: (f: string) => `<rect x="64" y="210" width="272" height="44" rx="22" fill="${f}"/><rect x="64" y="262" width="18" height="36" rx="3" fill="${f}" opacity=".7"/><rect x="92" y="262" width="18" height="28" rx="3" fill="${f}" opacity=".55"/><rect x="318" y="174" width="18" height="36" rx="3" fill="${f}" opacity=".7"/>`,
  vase: (f: string) => `<rect x="176" y="96" width="48" height="54" rx="6" fill="${f}"/><ellipse cx="200" cy="300" rx="78" ry="128" fill="${f}"/><ellipse cx="200" cy="250" rx="48" ry="70" fill="#fff" opacity=".08"/>`,
  wallet: (f: string) => `<rect x="86" y="168" width="228" height="148" rx="16" fill="${f}"/><rect x="108" y="192" width="184" height="10" rx="2" fill="#fff" opacity=".12"/><rect x="108" y="214" width="120" height="8" rx="2" fill="#fff" opacity=".08"/>`,
  knit: (f: string) => `<rect x="96" y="128" width="208" height="240" rx="18" fill="${f}"/><circle cx="200" cy="128" r="34" fill="${f}" opacity=".35"/><rect x="70" y="150" width="48" height="150" rx="18" fill="${f}"/><rect x="282" y="150" width="48" height="150" rx="18" fill="${f}"/>`,
  tray: (f: string) => `<ellipse cx="200" cy="262" rx="142" ry="78" fill="${f}"/><ellipse cx="200" cy="250" rx="118" ry="58" fill="${f}" opacity=".55"/><ellipse cx="200" cy="250" rx="86" ry="36" fill="#fff" opacity=".06"/>`,
  fold: (f: string) => `<rect x="70" y="110" width="260" height="170" rx="10" fill="${f}"/><rect x="90" y="210" width="220" height="150" rx="10" fill="${f}" opacity=".72"/><rect x="110" y="280" width="180" height="90" rx="8" fill="${f}" opacity=".5"/>`,
  silk: (f: string) => `<path d="M70 240 C140 160 180 320 250 210 C310 130 340 280 360 220" fill="none" stroke="${f}" stroke-width="36" stroke-linecap="round"/><path d="M90 268 C150 200 200 330 270 240" fill="none" stroke="${f}" stroke-width="10" opacity=".45" stroke-linecap="round"/>`,
  jug: (f: string) => `<rect x="168" y="88" width="64" height="40" rx="8" fill="${f}"/><ellipse cx="200" cy="290" rx="70" ry="130" fill="${f}"/><path d="M268 210 C318 210 322 300 268 312" fill="none" stroke="${f}" stroke-width="16" stroke-linecap="round"/><ellipse cx="186" cy="240" rx="18" ry="48" fill="#fff" opacity=".12"/>`,
  cushion: (f: string) => `<rect x="86" y="130" width="228" height="228" rx="18" fill="${f}"/><rect x="112" y="156" width="176" height="176" rx="12" fill="${f}" opacity=".55"/><rect x="138" y="182" width="124" height="124" rx="8" fill="#fff" opacity=".06"/>`,
  tee: (f: string) => `<rect x="122" y="118" width="156" height="210" rx="16" fill="${f}"/><rect x="74" y="130" width="56" height="88" rx="20" fill="${f}"/><rect x="270" y="130" width="56" height="88" rx="20" fill="${f}"/><circle cx="200" cy="118" r="26" fill="${f}" opacity=".4"/>`,
};

const LINEN = [{ id: "kum", name: "Kum", hex: "#c4b49a" }, { id: "zeytin", name: "Zeytin", hex: "#6d7a5c" }, { id: "kir", name: "Kır", hex: "#e6dfd2" }];
const WOOL = [{ id: "cam", name: "Çam", hex: "#3d4a3a" }, { id: "kömür", name: "Kömür", hex: "#2a2420" }];
const EARTH = [{ id: "kil", name: "Kil", hex: "#8a5a3c" }, { id: "taş", name: "Taş", hex: "#7f8c7a" }];
const SIZES = ["S", "M", "L", "XL"];

type Row = [string, string, string, number, number | null, number, string, string, string, boolean, string, string, Swatch[] | undefined, string[] | undefined];
const PR: Row[] = [
  ["prod_keten_gomlek", "Keten Gömlek", "Giyim", 1249.9, 1490, 14, "QN-GOM-001", "Yıkandıkça yumuşayan keten. Rahat kesim, yazlık.", "keten,gömlek,yaz", true, "#2f3a2e", "shirt", LINEN, SIZES],
  ["prod_yun_atki", "Yün Atkı", "Aksesuar", 389, null, 3, "QN-ATK-014", "İnce yün atkı. Boyun ve omuz için.", "yün,atkı,kış", false, "#241e1a", "scarf", WOOL, undefined],
  ["prod_seramik_vazo", "Seramik Vazo", "Ev", 679.5, null, 8, "QN-VAZ-003", "El yapımı seramik. Mat sırlama.", "seramik,vazo,ev", true, "#1c2428", "vase", EARTH, undefined],
  ["prod_keten_pantolon", "Keten Pantolon", "Giyim", 1890, 2190, 6, "QN-PAN-007", "Geniş paça keten pantolon. Yazlık.", "keten,pantolon,yaz", true, "#2c2a26", "pants", LINEN, SIZES],
  ["prod_pamuklu_tisort", "Pamuklu Tişört", "Giyim", 249.9, null, 42, "QN-TSH-021", "Organik pamuk. Düz kesim.", "pamuk,tişört", false, "#26282c", "tee", LINEN, SIZES],
  ["prod_deri_cuzdan", "Deri Cüzdan", "Aksesuar", 549, null, 2, "QN-CUZ-009", "Bitkisel tabaklanmış deri. İnce profil.", "deri,cüzdan", false, "#1a1614", "wallet", [{ id: "ceviz", name: "Ceviz", hex: "#5c3b2a" }, { id: "mürekkep", name: "Mürekkep", hex: "#1a1614" }], undefined],
  ["prod_yun_kazak", "Yün Kazak", "Giyim", 1490, null, 9, "QN-KZK-004", "Merino karışımı. Yuvarlak yaka.", "yün,kazak,kış", true, "#241e1c", "knit", WOOL, SIZES],
  ["prod_ahsap_tepsi", "Ahşap Tepsi", "Ev", 429, null, 11, "QN-TEP-012", "Ceviz ahşap tepsi. Yağlanmış yüzey.", "ahşap,tepsi,ev", false, "#1e1a16", "tray", undefined, undefined],
  ["prod_keten_nevresim", "Keten Nevresim", "Ev", 1199, 1390, 5, "QN-NEV-002", "Çift kişilik keten nevresim takımı.", "keten,nevresim,ev,yaz", false, "#22201c", "fold", LINEN, undefined],
  ["prod_ipek_fular", "İpek Fular", "Aksesuar", 329.5, null, 0, "QN-FUL-018", "Küçük ipek fular. Desenli.", "ipek,fular,yaz", false, "#1c1820", "silk", [{ id: "gül", name: "Gül", hex: "#c45c6a" }, { id: "mürekkep", name: "Mürekkep", hex: "#3a3044" }], undefined],
  ["prod_cam_surahi", "Cam Sürahi", "Ev", 459, null, 7, "QN-SUR-006", "Üfleme cam sürahi. 1.2 litre.", "cam,sürahi,ev", false, "#141820", "jug", undefined, undefined],
  ["prod_kadife_minder", "Kadife Minder", "Ev", 219, null, 18, "QN-MIN-011", "Pamuk kadife minder kılıfı. 45x45.", "kadife,minder,ev", false, "#1a201c", "cushion", [{ id: "orman", name: "Orman", hex: "#3d5a4a" }, { id: "kum", name: "Kum", hex: "#c4b49a" }], undefined],
];

function shape(kind: string, fill: string) {
  const fn = (S as Record<string, (f: string) => string>)[kind];
  return fn ? fn(fill) : S.fold(fill);
}
function fills(kind: string, colors?: Swatch[]) {
  const a = colors?.[0]?.hex ?? "#c4b49a";
  const b = colors?.[1]?.hex ?? a;
  return [a, b, a];
}

export const PRODUCTS: Product[] = PR.map(([id, name, category, price, compare_at, stock, sku, description, tags, featured, bg, kind, colors, sizes]) => {
  const [a, b] = fills(kind, colors);
  const gallery = [art(bg, shape(kind, a), 0), art(bg, shape(kind, b), 1), art(bg, shape(kind, a), 2)];
  return { id, name, category, price, compare_at, stock, sku, description, image: gallery[0], gallery, tags: tags.split(","), colors, sizes, featured };
});

const OR = "ord_0610|2026-06-10T11:00:00+03:00|fulfilled|219|prod_kadife_minder:1:219\nord_0620|2026-06-20T11:00:00+03:00|fulfilled|329.5|prod_ipek_fular:1:329.5\nord_0708|2026-07-08T11:20:00+03:00|fulfilled|1249.9|prod_keten_gomlek:1:1249.9\nord_0712|2026-07-12T16:05:00+03:00|fulfilled|249.9|prod_pamuklu_tisort:1:249.9\nord_0715|2026-07-15T09:40:00+03:00|fulfilled|2169.5|prod_yun_kazak:1:1490,prod_seramik_vazo:1:679.5\nord_0719|2026-07-19T14:10:00+03:00|cancelled|1890|prod_keten_pantolon:1:1890\nord_0722|2026-07-22T18:30:00+03:00|fulfilled|778|prod_yun_atki:2:389\nord_0728|2026-07-28T10:00:00+03:00|fulfilled|1498.9|prod_keten_gomlek:1:1249.9,prod_pamuklu_tisort:1:249.9\nord_0801|2026-08-01T13:15:00+03:00|fulfilled|888|prod_ahsap_tepsi:1:429,prod_cam_surahi:1:459\nord_0805|2026-08-05T12:00:00+03:00|fulfilled|1890|prod_keten_pantolon:1:1890\nord_0807|2026-08-07T09:25:00+03:00|fulfilled|679.5|prod_seramik_vazo:1:679.5\nord_0810|2026-08-10T17:40:00+03:00|fulfilled|2499.8|prod_keten_gomlek:2:1249.9\nord_0812|2026-08-12T11:05:00+03:00|fulfilled|1490|prod_yun_kazak:1:1490\nord_0814|2026-08-14T15:50:00+03:00|fulfilled|1199|prod_keten_nevresim:1:1199\nord_0818|2026-08-18T10:20:00+03:00|fulfilled|888.8|prod_pamuklu_tisort:2:249.9,prod_yun_atki:1:389\nord_0820|2026-08-20T19:00:00+03:00|fulfilled|549|prod_deri_cuzdan:1:549\nord_0823|2026-08-23T13:35:00+03:00|fulfilled|1138.5|prod_seramik_vazo:1:679.5,prod_cam_surahi:1:459\nord_0826|2026-08-26T16:10:00+03:00|fulfilled|1249.9|prod_keten_gomlek:1:1249.9\nord_0828|2026-08-28T09:45:00+03:00|fulfilled|2319|prod_keten_pantolon:1:1890,prod_ahsap_tepsi:1:429\nord_0830|2026-08-30T12:00:00+03:00|paid|1490|prod_yun_kazak:1:1490\nord_0901|2026-09-01T08:30:00+03:00|pending_payment|389|prod_yun_atki:1:389\nord_0902|2026-09-02T14:20:00+03:00|return_requested|679.5|prod_seramik_vazo:1:679.5\nord_0903|2026-09-03T10:05:00+03:00|fulfilled|499.8|prod_pamuklu_tisort:2:249.9";
type Ord = { id: string; created_at: string; status: string; total: number; items: { product_id: string; qty: number; price: number }[] };
const ORDERS: Ord[] = OR.split("\n").map((l) => {
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

const KEYS: Record<string, string[]> = {
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

function pick(ids: string[], n = 3) {
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

export function demoTurn(message: string, productId?: string | null): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const ids: string[] = productId ? [productId] : [];
  for (const [k, v] of Object.entries(KEYS)) if (text.includes(k)) ids.push(...v);
  if (!ids.length) ids.push("prod_keten_gomlek", "prod_seramik_vazo", "prod_yun_kazak");
  const compare = /karşılaştır|karsilastir|fark|yoksa/.test(text);
  const products = pick(ids, compare ? 2 : 3);
  const names = products.map((p) => p.name).join(", ");
  let reply: string;
  let activity = "katalogda bakıyorum";
  if (text.includes("iade")) {
    activity = "iade metnine bakıyorum";
    reply = `İade ${RETURN_DAYS} gün. Etiket duruyorsa mağaza veya kargo ile.`;
  } else if (text.includes("kargo")) {
    activity = "kargo eşiğine bakıyorum";
    reply = `Kargo 1–3 iş günü. ${money(SHIP_FREE)} ve üzeri kargo yok.`;
  } else if (text.includes("beden")) {
    activity = "beden ve stok bakıyorum";
    const c = productId ? getProduct(productId) : products[0];
    reply = c?.sizes?.length ? `${c.name} bedenleri ${c.sizes.join(", ")}. Stok ${c.stock} adet.` : `${c?.name ?? "Bu parça"} tek beden. Stok ${c?.stock ?? 0} adet.`;
  } else if (productId) {
    const c = getProduct(productId);
    reply = `${c?.name ?? "Bu parça"} stokta ${c?.stock ?? 0} adet. Yakın üç öneri: ${names}.`;
  } else if (compare) {
    activity = "iki parçayı yan yana koyuyorum";
    reply = `${products[0]?.name} ve ${products[1]?.name} yan yana. Fiyat ve stok kartlarda.`;
  } else {
    reply = `${names} bu aramaya uyuyor. Stok ve fiyat kartlarda.`;
  }
  const ui: UiBlock[] = compare
    ? [{ type: "present_comparison", products }]
    : [{ type: "present_products", products }];
  return { text: reply, ui, suggestions: ["Keten bakıyorum", "Eve bir vazo", "Yün atkı var mı"].slice(0, 3), activity };
}

export function merchantTurn(message: string): ChatResponse {
  const text = message.toLocaleLowerCase("tr-TR");
  const snap = computeSnapshot();
  const alerts = computeAlerts();
  const issues = computeIssues();
  const suggestions = ["Bu hafta ciro", "Stoğu bitmeye yakın", "Açık siparişler"].slice(0, 3);
  if (/stok|yenile|bit/.test(text)) {
    const rows = alerts.slice(0, 5).map((a) => ({ label: a.product_name, value: `${a.stock} adet · ${a.days_cover ?? "—"} gün` }));
    return { text: `Stok uyarısı ${alerts.length} kayıt. Seed katalog, canlı ikas değil.`, ui: [{ type: "present_metrics", rows }], suggestions, activity: "stok uyarısına bakıyorum" };
  }
  if (/sipariş|siparis|iade|ödeme|odeme/.test(text)) {
    const rows = issues.map((i) => ({ label: i.order_id, value: i.message }));
    return { text: `Açık konu ${issues.length}. Durum seed siparişlerinden.`, ui: [{ type: "present_metrics", rows }], suggestions, activity: "sipariş konularına bakıyorum" };
  }
  if (/düzelt|duzelt|başlık|baslik|seo/.test(text)) {
    const p = PRODUCTS.find((x) => text.includes(x.name.toLocaleLowerCase("tr-TR"))) ?? PRODUCTS[0];
    return {
      text: `${p.name} kalite ${qualityScore(p)}. Başlık ve açıklama seed üzerinde; yazma F2 ve ikas kapalı.`,
      ui: [{ type: "present_table", columns: ["Alan", "Değer"], table: [["SKU", p.sku], ["Fiyat", money(p.price)], ["Stok", String(p.stock)], ["Kalite", String(qualityScore(p))]] }],
      suggestions, activity: "liste kaydına bakıyorum",
    };
  }
  const rows = [
    { label: "Ciro", value: money(snap.revenue) },
    { label: "Sipariş", value: number(snap.order_count) },
    { label: "Ort. sepet", value: money(snap.aov) },
    { label: "İptal", value: percent(snap.cancel_rate * 100) },
  ];
  const table = [
    ["Ciro", money(snap.revenue), percent(snap.revenue_delta_pct)],
    ["Sipariş", number(snap.order_count), percent(snap.order_delta_pct)],
    ["Ort. sepet", money(snap.aov), percent(snap.aov_delta_pct)],
  ];
  return {
    text: `Son ${snap.period_days} günde ciro ${money(snap.revenue)}, ${number(snap.order_count)} sipariş, ortalama sepet ${money(snap.aov)}. Dikkat: ${alerts.slice(0, 3).map((a) => a.product_name).join(", ") || "yok"}.`,
    ui: [{ type: "present_metrics", rows }, { type: "present_table", columns: ["Metrik", "Değer", "Δ"], table }],
    suggestions, activity: "özet rakamlara bakıyorum",
  };
}

const REV = new Set(["fulfilled", "shipped", "paid", "return_requested"]);
const iso = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
function stats(start: Date, end: Date) {
  const all = ORDERS.filter((o) => { const c = new Date(o.created_at); return c >= start && c < end; });
  const sel = all.filter((o) => REV.has(o.status));
  const revenue = Math.round(sel.reduce((s, o) => s + o.total, 0) * 100) / 100;
  const order_count = sel.length;
  const denom = all.length || 1;
  return { revenue, order_count, aov: order_count ? Math.round((revenue / order_count) * 100) / 100 : 0, cancel_rate: Math.round((all.filter((o) => o.status === "cancelled").length / denom) * 10000) / 10000, refund_rate: Math.round((all.filter((o) => o.status === "return_requested").length / denom) * 10000) / 10000 };
}
const dlt = (c: number, p: number) => (p === 0 ? (c === 0 ? 0 : 100) : Math.round(((c - p) / p) * 1000) / 10);
export function computeSnapshot(now = new Date(), days = 30): Snapshot {
  const end = now, start = new Date(end.getTime() - days * 86400000), prev = new Date(start.getTime() - days * 86400000);
  const cur = stats(start, end), pr = stats(prev, start);
  return { period_start: iso(start), period_end: iso(end), period_days: days, ...cur, revenue_delta_pct: dlt(cur.revenue, pr.revenue), order_delta_pct: dlt(cur.order_count, pr.order_count), aov_delta_pct: dlt(cur.aov, pr.aov) };
}
export function weeklyBars(now = new Date(), weeks = 8): WeeklyBar[] {
  const out: WeeklyBar[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const end = new Date(now.getTime() - i * 7 * 86400000);
    const start = new Date(end.getTime() - 7 * 86400000);
    const { revenue } = stats(start, end);
    out.push({ label: shortDate(start).replace(/ \d{4}$/, ""), value: revenue });
  }
  return out;
}
export function computeAlerts(now = new Date()): Alert[] {
  const a: Alert[] = [];
  for (const p of PRODUCTS) {
    let sold = 0, latest: Date | null = null;
    for (const o of ORDERS) {
      const c = new Date(o.created_at);
      if (REV.has(o.status) && c >= new Date(now.getTime() - 30 * 86400000) && c < now) for (const i of o.items) if (i.product_id === p.id) sold += i.qty;
      if (o.items.some((i) => i.product_id === p.id) && (!latest || c > latest)) latest = c;
    }
    const daily = sold / 30, days_cover = daily <= 0 ? null : Math.round((p.stock / daily) * 10) / 10, days_without_sale = latest ? Math.floor((now.getTime() - latest.getTime()) / 86400000) : null;
    if (p.stock <= 0) { a.push({ kind: "out_of_stock", product_id: p.id, product_name: p.name, stock: p.stock, days_cover: 0, days_without_sale, message: `${p.name} tükendi.` }); continue; }
    if (p.stock <= 5 || (days_cover !== null && days_cover < 7)) a.push({ kind: "low_stock", product_id: p.id, product_name: p.name, stock: p.stock, days_cover, days_without_sale, message: `${p.name} stok ${p.stock} adet.` });
    if (days_without_sale !== null && days_without_sale > 45) a.push({ kind: "slow_mover", product_id: p.id, product_name: p.name, stock: p.stock, days_cover, days_without_sale, message: `${p.name} ${days_without_sale} gündür satılmadı.` });
  }
  return a;
}
export function computeIssues(now = new Date()): Issue[] {
  const a: Issue[] = [];
  for (const o of ORDERS) {
    const age_hours = Math.round(((now.getTime() - new Date(o.created_at).getTime()) / 3600000) * 10) / 10;
    if (o.status === "paid" && age_hours > 48) a.push({ kind: "unshipped", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ${Math.floor(age_hours)} saattir kargoya verilmedi.` });
    else if (o.status === "pending_payment" && age_hours > 24) a.push({ kind: "pending_payment", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} ödemesi ${Math.floor(age_hours)} saattir bekliyor.` });
    else if (o.status === "return_requested") a.push({ kind: "return_open", order_id: o.id, status: o.status, age_hours, total: o.total, message: `${o.id} iade talebi açık.` });
  }
  return a;
}

const ok = (id: string, label: string): Guard => ({ id, label, ok: true });
export const STAGED: StagedChange[] = [
  {
    id: "chg_price_gomlek", kind: "price", product_id: "prod_keten_gomlek", product_name: "Keten Gömlek",
    staged_by: "ajan", created_at: "2026-09-02T16:40:00+03:00", variant_count: 1,
    before: { fiyat: money(1249.9) }, after: { fiyat: money(1099.9) },
    reason: "Yaz sonu hareket yavaş. %12 indirim, fiyat cap %20 içinde.",
    guardrails: [ok("price", "fiyat sınırı"), ok("discount", "indirim derinliği"), ok("protected", "korunan alan")],
    status: "staged",
  },
  {
    id: "chg_stock_cuzdan", kind: "stock", product_id: "prod_deri_cuzdan", product_name: "Deri Cüzdan",
    staged_by: "ajan", created_at: "2026-09-03T09:10:00+03:00", variant_count: 1,
    before: { stok: "2" }, after: { stok: "24" },
    reason: "Gün cover 4 günün altında. 22 adet yenileme, restock cap 500 altında.",
    guardrails: [ok("restock", "restock boyutu"), ok("protected", "korunan alan")],
    status: "staged",
  },
  {
    id: "chg_price_atki", kind: "price", product_id: "prod_yun_atki", product_name: "Yün Atkı",
    staged_by: "ajan", created_at: "2026-09-03T11:05:00+03:00", variant_count: 1,
    before: { fiyat: money(389) }, after: { fiyat: money(349) },
    reason: "Stok 3, kış yaklaşırken görünürlük için küçük fiyat adımı.",
    guardrails: [ok("price", "fiyat sınırı"), ok("discount", "indirim derinliği"), ok("protected", "korunan alan")],
    status: "staged",
  },
];
export const getStaged = () => STAGED;
export function mergeStaged(ledger: Record<string, LedgerEntry> = {}) {
  return STAGED.map((c) => {
    const e = ledger[c.id];
    if (!e) return c;
    return { ...c, status: e.status, decision_note: e.decision_note };
  });
}
export const KIND_LABEL: Record<string, string> = { price: "Fiyat güncellemesi", stock: "Stok yenileme", listing: "Liste düzeltmesi" };
export const STATUS_LABEL: Record<string, string> = { paid: "ödeme alındı", pending_payment: "ödeme bekliyor", return_requested: "iade açık", fulfilled: "teslim", cancelled: "iptal", shipped: "kargoda" };
