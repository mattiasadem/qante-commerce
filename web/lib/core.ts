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
