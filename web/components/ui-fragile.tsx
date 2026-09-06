"use client";
import { useEffect, useState } from "react";

const FRAGILE_KEY = "qante_fragile";

export type FragileMode = "dolgu" | "cift" | "etiket";

export type FragileInfo = {
  mode: FragileMode | null;
};

const LABELS: Record<FragileMode, string> = {
  dolgu: "Ekstra dolgu",
  cift: "Çift kutu",
  etiket: "Kırılgan etiket",
};

const SHORT: Record<FragileMode, string> = {
  dolgu: "Dolgu",
  cift: "Çift kutu",
  etiket: "Etiket",
};

const MODES: FragileMode[] = ["dolgu", "cift", "etiket"];

const EMPTY: FragileInfo = { mode: null };

export function readFragile(): FragileInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(FRAGILE_KEY) || "null") as Partial<FragileInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "dolgu" || m === "cift" || m === "etiket") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeFragile(info: FragileInfo) {
  try {
    if (!info.mode) localStorage.removeItem(FRAGILE_KEY);
    else localStorage.setItem(FRAGILE_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-fragile"));
  } catch {
    /* ignore */
  }
}

export function clearFragile() {
  writeFragile({ ...EMPTY });
}

export function useFragile(): FragileInfo {
  const [info, setInfo] = useState<FragileInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readFragile());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-fragile", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-fragile", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatFragileTag(info: FragileInfo = readFragile()): string | null {
  if (!info.mode) return null;
  return `[kirilgan:${info.mode}]`;
}

export function parseFragileFromNote(note?: string): { mode: FragileMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[kirilgan:(dolgu|cift|etiket)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as FragileMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Kırılgan paket chips, localStorage only. */
export function FragileField() {
  const [info, setInfo] = useState<FragileInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readFragile());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-fragile", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-fragile", sync);
    };
  }, []);

  function pick(mode: FragileMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeFragile(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="fragile-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Kırılgan paket</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="fragile-clear"
            onClick={() => {
              clearFragile();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Kırılgan paket" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`fragile-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · paketleme notu · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Dolgu / Çift kutu / Etiket · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { FRAGILE_KEY, LABELS as FRAGILE_LABELS };
