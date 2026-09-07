"use client";
import { useEffect, useState } from "react";

const WARRANTY_KEY = "qante_warranty";

export type WarrantyMode = "standart" | "yil1" | "yil2";

export type WarrantyInfo = {
  mode: WarrantyMode | null;
};

const LABELS: Record<WarrantyMode, string> = {
  standart: "Standart garanti",
  yil1: "+1 yıl uzatma",
  yil2: "+2 yıl uzatma",
};

const SHORT: Record<WarrantyMode, string> = {
  standart: "Standart",
  yil1: "+1 yıl",
  yil2: "+2 yıl",
};

const MODES: WarrantyMode[] = ["standart", "yil1", "yil2"];

const EMPTY: WarrantyInfo = { mode: null };

export function readWarranty(): WarrantyInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(WARRANTY_KEY) || "null") as Partial<WarrantyInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "standart" || m === "yil1" || m === "yil2") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeWarranty(info: WarrantyInfo) {
  try {
    if (!info.mode) localStorage.removeItem(WARRANTY_KEY);
    else localStorage.setItem(WARRANTY_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-warranty"));
  } catch {
    /* ignore */
  }
}

export function clearWarranty() {
  writeWarranty({ ...EMPTY });
}

export function useWarranty(): WarrantyInfo {
  const [info, setInfo] = useState<WarrantyInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readWarranty());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-warranty", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-warranty", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatWarrantyTag(info: WarrantyInfo = readWarranty()): string | null {
  if (!info.mode) return null;
  return `[garanti:${info.mode}]`;
}

export function parseWarrantyFromNote(note?: string): { mode: WarrantyMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[garanti:(standart|yil1|yil2)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as WarrantyMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Garanti uzatma chips, localStorage only. */
export function WarrantyField() {
  const [info, setInfo] = useState<WarrantyInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readWarranty());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-warranty", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-warranty", sync);
    };
  }, []);

  function pick(mode: WarrantyMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeWarranty(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="warranty-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Garanti uzatma</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="warranty-clear"
            onClick={() => {
              clearWarranty();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Garanti uzatma" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`warranty-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · garanti notu · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Standart / +1 yıl / +2 yıl · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { WARRANTY_KEY, LABELS as WARRANTY_LABELS };
