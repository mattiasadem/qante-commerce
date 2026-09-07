/** Compact bracket tags from checkout note for DEMO_ORDERS cookie budget. */
export function compactBuyerNote(raw: string): string | undefined {
  const text = raw.trim();
  if (!text) return undefined;
  const tags = text.match(/\[[^\]]+\]/g);
  if (!tags?.length) return text.slice(0, 160);
  return tags.join(" ").slice(0, 220);
}

export const KEY_LABEL: Record<string, string> = {
  ambalaj: "Ambalaj",
  hediye: "Hediye",
  odeme: "Ödeme",
  saat: "Saat",
  fatura: "Fatura",
  iletisim: "İletişim",
  talimat: "Talimat",
  gun: "Gün",
  firma: "Firma",
  sekil: "Teslim şekli",
  hiz: "Hız",
  bahsis: "Bahşiş",
  eko: "Eko",
  alici: "Alıcı",
  kapici: "Kapıcı",
  sigorta: "Sigorta",
  bildirim: "Bildirim",
  zil: "Zil",
  ara: "Ara",
  iade: "İade",
  foto: "Foto",
  kirilgan: "Kırılgan",
  montaj: "Montaj",
  garanti: "Garanti",
  destek: "Destek",
  taksit: "Taksit",
  teslimat: "Teslimat",
  kupon: "Kupon",
  varyant: "Varyant",
};

export const VALUE_LABEL: Record<string, Record<string, string>> = {
  ambalaj: { standart: "Standart", premium: "Premium", minimal: "Minimal" },
  destek: { standart: "Standart", oncelikli: "Öncelikli", vip: "VIP" },
  garanti: { standart: "Standart", yil1: "1 yıl", yil2: "2 yıl" },
  montaj: { temel: "Temel", tam: "Tam", uzman: "Uzman" },
  kirilgan: { dolgu: "Dolgu", cift: "Çift kutu", etiket: "Etiket", "cift-kutu": "Çift kutu" },
  hiz: { standart: "Standart", hizli: "Hızlı", ekspres: "Ekspres" },
  sekil: { kargo: "Kargo", gelal: "Gel al", ayni: "Aynı gün" },
  eko: { kagit: "Kağıt", geri: "Geri dönüşüm", yok: "Yok", minimal: "Minimal", standart: "Standart" },
  odeme: { kart: "Kart", kapida: "Kapıda", havale: "Havale" },
  fatura: { bireysel: "Bireysel", kurumsal: "Kurumsal" },
  bildirim: { sms: "SMS", email: "E-posta", whatsapp: "WhatsApp", yok: "Yok" },
  zil: { sessiz: "Sessiz", normal: "Normal", yok: "Çalma" },
  ara: { once: "Önce ara", etme: "Arama", kapida: "Kapıda" },
  foto: { evet: "İste", yok: "Yok", kapida: "Kapıda" },
  sigorta: { temel: "Temel", tam: "Tam", yok: "Yok", standart: "Standart", premium: "Premium" },
};

export type BuyerPrefChip = { key: string; label: string };

export function parseBuyerPrefChips(note?: string): BuyerPrefChip[] {
  if (!note) return [];
  const out: BuyerPrefChip[] = [];
  const re = /\[([a-z0-9_]+)(?::([^\]]*))?\]/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(note))) {
    const key = m[1].toLowerCase();
    const val = (m[2] ?? "").trim();
    const head = KEY_LABEL[key] ?? key;
    const map = VALUE_LABEL[key];
    let pretty = val;
    if (val && map) {
      const hit = map[val.toLowerCase()] ?? map[val];
      if (hit) pretty = hit;
    }
    if (key === "bahsis" && val) pretty = `${val} ₺`;
    if (key === "iade" && val) pretty = `${val} gün`;
    const label = pretty ? `${head} · ${pretty.slice(0, 40)}` : head;
    out.push({ key, label });
    if (out.length >= 12) break;
  }
  return out;
}
