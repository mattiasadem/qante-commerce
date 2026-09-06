"use client";
import { useEffect, useState } from "react";

const ECO_KEY = "qante_eco";

export type EcoPack = "minimal" | "geri" | "plastiksiz";

export type EcoInfo = {
  pack: EcoPack | null;
};

const LABELS: Record<EcoPack, string> = {
  minimal: "Minimal",
  geri: "Geri dönüşümlü",
  plastiksiz: "Plastiksiz",
};

const PACKS: EcoPack[] = ["minimal", "geri", "plastiksiz"];

const EMPTY: EcoInfo = { pack: null };

export function readEco(): EcoInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(ECO_KEY) || "null") as Partial<EcoInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const p = raw.pack;
    if (p === "minimal" || p === "geri" || p === "plastiksiz") return { pack: p };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeEco(info: EcoInfo) {
  try {
    if (!info.pack) localStorage.removeItem(ECO_KEY);
    else localStorage.setItem(ECO_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-eco"));
  } catch {
    /* ignore */
  }
}

export function clearEco() {
  writeEco({ ...EMPTY });
}

export function ecoLabel(pack: EcoPack | null | undefined): string | null {
  if (!pack) return null;
  return LABELS[pack] ?? null;
}

export function useEco(): EcoInfo {
  const [info, setInfo] = useState<EcoInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readEco());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-eco", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-eco", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatEcoTag(info: EcoInfo = readEco()): string | null {
  if (!info.pack) return null;
  return `[eko:${info.pack}]`;
}

export function parseEcoFromNote(note?: string): { pack: EcoPack; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[eko:(minimal|geri|plastiksiz)\]/i);
  if (!m) return null;
  const pack = m[1].toLowerCase() as EcoPack;
  return { pack, label: LABELS[pack] };
}

/** Cart /sepet + drawer: Çevre dostu paket chips, localStorage only. */
export function EcoField() {
  const [info, setInfo] = useState<EcoInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readEco());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-eco", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-eco", sync);
    };
  }, []);

  function pick(pack: EcoPack) {
    const next = { pack: info.pack === pack ? null : pack };
    writeEco(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="eco-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Çevre dostu paket</span>
        {info.pack ? (
          <button
            className="chip"
            type="button"
            data-cta="eco-clear"
            onClick={() => {
              clearEco();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Çevre dostu paket" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PACKS.map((p) => (
          <button
            key={p}
            className={`chip ${info.pack === p ? "on" : ""}`}
            type="button"
            aria-pressed={info.pack === p}
            data-cta={`eco-${p}`}
            onClick={() => pick(p)}
          >
            {LABELS[p]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.pack
          ? `Seçilen · ${LABELS[info.pack]} · ücretsiz · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Minimal / Geri dönüşümlü / Plastiksiz · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { ECO_KEY, LABELS as ECO_LABELS };
