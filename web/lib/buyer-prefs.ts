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
  imza: "İmza",
  paketmatik: "Paketmatik",
  erisim: "Erişim",
  komsu: "Komşu",
  gizli: "Gizlilik",
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
  imza: { gerekli: "Gerekli", kimlik: "Kimlik", gerekmez: "İmzasız" },
  paketmatik: { mng: "MNG Kutu", ptt: "PTT Kargo", yurtici: "Yurtiçi Nokta" },
  erisim: { asansor: "Asansör var", merdiven: "Merdiven", yardim: "Yardım lazım" },
  komsu: { komsuya: "Komşuya bırak", kapida: "Kapıda bırak", alma: "Teslim alacağım" },
  gizli: { kapali: "Kapalı kutu", markasiz: "Markasız paket", fatura: "Fatura ayrı" },
  destek: { standart: "Standart", oncelikli: "Öncelikli", vip: "VIP" },
  garanti: { standart: "Standart", yil1: "1 yıl", yil2: "2 yıl" },
  montaj: { temel: "Temel", tam: "Tam", uzman: "Uzman" },
  kirilgan: { dolgu: "Dolgu", cift: "Çift kutu", etiket: "Etiket", "cift-kutu": "Çift kutu" },
  hiz: { standart: "Standart", express: "Express", ayni: "Aynı gün", hizli: "Hızlı", ekspres: "Ekspres" },
  sekil: { kargo: "Kargo", gelal: "Gel al", ayni: "Aynı gün" },
  eko: { kagit: "Kağıt", geri: "Geri dönüşüm", yok: "Yok", minimal: "Minimal", standart: "Standart", plastiksiz: "Plastiksiz" },
  odeme: { kart: "Kart", kapida: "Kapıda", havale: "Havale" },
  fatura: { bireysel: "Bireysel", kurumsal: "Kurumsal" },
  bildirim: { sms: "SMS", email: "E-posta", eposta: "E-posta", ikisi: "SMS + E-posta", whatsapp: "WhatsApp", yok: "Yok" },
  zil: { calma: "Zili çalma", sessiz: "Sessiz bırak", not: "Kapıya not", yok: "Zili çalma", normal: "Sessiz bırak" },
  ara: { ara: "Ara önce", whatsapp: "WhatsApp", yok: "Arama", once: "Önce ara", etme: "Arama", kapida: "Kapıda" },
  foto: { kapida: "Kapıda foto", kutu: "Kutuda foto", imza: "İmza + foto", evet: "İste", yok: "Yok" },
  sigorta: { temel: "Temel", tam: "Tam", yok: "Yok", standart: "Standart", premium: "Premium" },
  taksit: { pesin: "Peşin", "3": "3 taksit", "6": "6 taksit", "9": "9 taksit", "12": "12 taksit" },
  saat: { sabah: "Sabah 09–12", ogle: "Öğle 12–17", aksam: "Akşam 17–21" },
  gun: { bugun: "Bugün", yarin: "Yarın", haftaici: "Hafta içi", cumartesi: "Cumartesi" },
  firma: { yurtici: "Yurtiçi", mng: "MNG", aras: "Aras", surat: "Sürat" },
  iade: { "14": "14 gün", "30": "30 gün", "60": "60 gün" },
  kupon: { qante10: "%10", hosgeldin: "100 ₺", kargo: "Ücretsiz kargo" },
  iletisim: { whatsapp: "WhatsApp", sms: "SMS", email: "E-posta", ara: "Ara" },
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
    let label: string;
    if (key === "kapici") label = val ? `Kapıcı · ${val.slice(0, 32)}` : "Kapıcıya bırak";
    else if (key === "hediye" && !val) label = "Hediye paketi";
    else label = pretty ? `${head} · ${pretty.slice(0, 40)}` : head;
    out.push({ key, label });
    if (out.length >= 12) break;
  }
  return out;
}
