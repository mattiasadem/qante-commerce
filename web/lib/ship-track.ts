export type Carrier = { id: string; label: string };

/** Turkish demo carriers for merchant ship UI (local ledger only). */
export const CARRIERS: Carrier[] = [
  { id: "yurtici", label: "Yurtiçi Kargo" },
  { id: "mng", label: "MNG" },
  { id: "aras", label: "Aras" },
  { id: "ptt", label: "PTT" },
  { id: "surat", label: "Sürat" },
  { id: "hepsijet", label: "HepsiJet" },
  { id: "trendyol", label: "Trendyol Express" },
  { id: "other", label: "Diğer" },
];

function carrierLabel(raw?: string): string {
  const v = (raw ?? "").trim();
  if (!v) return "";
  const hit = CARRIERS.find((c) => c.id === v || c.label.toLocaleLowerCase("tr-TR") === v.toLocaleLowerCase("tr-TR"));
  return hit?.label ?? v.slice(0, 40);
}

/** Compact ledger note: [kargo:Carrier|TRACK] — fits cookie budget. */
export function formatShipNote(carrier?: string, tracking?: string): string | undefined {
  const label = carrierLabel(carrier);
  const code = (tracking ?? "").trim().replace(/[\]|]/g, "").slice(0, 64);
  if (!label && !code) return undefined;
  if (label && code) return `[kargo:${label}|${code}]`;
  if (label) return `[kargo:${label}]`;
  return `[kargo:|${code}]`;
}

export function parseShipNote(note?: string): { carrier: string; tracking: string } | null {
  if (!note) return null;
  const m = note.match(/\[kargo:([^\]]*)\]/i);
  if (!m) return null;
  const parts = m[1].split("|");
  const carrier = (parts[0] ?? "").trim();
  const tracking = (parts[1] ?? "").trim();
  if (!carrier && !tracking) return null;
  return { carrier, tracking };
}

export function shipNoteLabel(note?: string): string | null {
  const p = parseShipNote(note);
  if (!p) return note?.trim() || null;
  return [p.carrier, p.tracking].filter(Boolean).join(" · ") || null;
}
