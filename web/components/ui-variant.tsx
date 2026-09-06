"use client";

/** Local cart line variants (beden/renk) — PDP selection → cart display + checkout note. */
const KEY = "qante_cart_variants";

export type LineVariant = { size?: string; color?: string };

export function readVariants(): Record<string, LineVariant> {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}") as Record<string, LineVariant>;
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
    const out: Record<string, LineVariant> = {};
    for (const [id, v] of Object.entries(raw)) {
      if (!id || !v || typeof v !== "object") continue;
      const size = typeof v.size === "string" ? v.size.trim() : "";
      const color = typeof v.color === "string" ? v.color.trim() : "";
      if (size || color) out[id] = { ...(size ? { size } : {}), ...(color ? { color } : {}) };
    }
    return out;
  } catch {
    return {};
  }
}

function writeVariants(map: Record<string, LineVariant>) {
  try {
    localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent("qante-variants"));
  } catch {
    /* ignore */
  }
}

export function setLineVariant(productId: string, variant: LineVariant) {
  if (!productId) return;
  const size = (variant.size ?? "").trim();
  const color = (variant.color ?? "").trim();
  const map = readVariants();
  if (!size && !color) {
    delete map[productId];
  } else {
    map[productId] = { ...(color ? { color } : {}), ...(size ? { size } : {}) };
  }
  writeVariants(map);
}

export function getLineVariant(productId: string): LineVariant | null {
  const v = readVariants()[productId];
  return v ?? null;
}

export function clearLineVariant(productId: string) {
  const map = readVariants();
  if (!(productId in map)) return;
  delete map[productId];
  writeVariants(map);
}

export function clearAllVariants() {
  writeVariants({});
}

export function formatVariantLabel(v: LineVariant | null | undefined): string {
  if (!v) return "";
  return [v.color, v.size].filter(Boolean).join(" · ");
}

/** Compact checkout tag, e.g. [varyant:p1=Bej/M;p2=/L] */
export function formatVariantsTag(productIds: string[]): string {
  const map = readVariants();
  const parts: string[] = [];
  for (const id of productIds) {
    const v = map[id];
    if (!v) continue;
    const color = (v.color ?? "").replace(/[;=\]]/g, "");
    const size = (v.size ?? "").replace(/[;=\]]/g, "");
    if (!color && !size) continue;
    parts.push(`${id}=${color}/${size}`);
  }
  if (!parts.length) return "";
  return `[varyant:${parts.join(";").slice(0, 180)}]`;
}

/** Parse [varyant:…] from order note into id → label. */
export function parseVariantsFromNote(note?: string): Record<string, string> {
  if (!note) return {};
  const m = note.match(/\[varyant:([^\]]+)\]/);
  if (!m) return {};
  const out: Record<string, string> = {};
  for (const part of m[1].split(";")) {
    const eq = part.indexOf("=");
    if (eq <= 0) continue;
    const id = part.slice(0, eq).trim();
    const rest = part.slice(eq + 1);
    const slash = rest.indexOf("/");
    const color = (slash >= 0 ? rest.slice(0, slash) : rest).trim();
    const size = (slash >= 0 ? rest.slice(slash + 1) : "").trim();
    const label = [color, size].filter(Boolean).join(" · ");
    if (id && label) out[id] = label;
  }
  return out;
}
