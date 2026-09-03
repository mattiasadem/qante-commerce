import type { Brand } from "@/lib/types";

export const BRAND: Brand = {
  name: "Qante",
  assistant_name: "Qante Asistan",
  voice: "samimi, kısa, Türkçe",
  tokens: {
    bg: "#0b0b0b",
    surface: "#171717",
    text: "#f3f3f0",
    muted: "#9a9a94",
    accent: "#d8c7a6",
    radius: "12px",
    grain: "dark",
  },
  logo: { kind: "square_round_pip" },
};

export function logoSvg(size = 32): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="6" fill="#d8c7a6"/><circle cx="23" cy="23" r="5.5" fill="#0b0b0b"/></svg>`;
}
