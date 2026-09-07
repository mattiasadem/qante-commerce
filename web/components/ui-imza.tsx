"use client";
import { useEffect, useState } from "react";

const IMZA_KEY = "qante_imza";

export type ImzaMode = "gerekli" | "kimlik" | "gerekmez";

export type ImzaInfo = {
  mode: ImzaMode | null;
};

const LABELS: Record<ImzaMode, string> = {
  gerekli: "İmza gerekli",
  kimlik: "Kimlik + imza",
  gerekmez: "İmzasız bırak",
};

const SHORT: Record<ImzaMode, string> = {
  gerekli: "İmza",
  kimlik: "Kimlik",
  gerekmez: "İmzasız",
};

const MODES: ImzaMode[] = ["gerekli", "kimlik", "gerekmez"];

const EMPTY: ImzaInfo = { mode: null };

export function readImza(): ImzaInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(IMZA_KEY) || "null") as Partial<ImzaInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "gerekli" || m === "kimlik" || m === "gerekmez") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeImza(info: ImzaInfo) {
  try {
    if (!info.mode) localStorage.removeItem(IMZA_KEY);
    else localStorage.setItem(IMZA_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-imza"));
  } catch {
    /* ignore */
  }
}

export function clearImza() {
  writeImza({ ...EMPTY });
}

export function useImza(): ImzaInfo {
  const [info, setInfo] = useState<ImzaInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readImza());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-imza", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-imza", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatImzaTag(info: ImzaInfo = readImza()): string | null {
  if (!info.mode) return null;
  return "[imza:" + info.mode + "]";
}

export function parseImzaFromNote(note?: string): { mode: ImzaMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[imza:(gerekli|kimlik|gerekmez)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as ImzaMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: İmza teslimatı chips, localStorage only. */
export function ImzaField() {
  const [info, setInfo] = useState<ImzaInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readImza());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-imza", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-imza", sync);
    };
  }, []);

  function pick(mode: ImzaMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeImza(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="imza-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">İmza teslimatı</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="imza-clear"
            onClick={() => {
              clearImza();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="İmza teslimatı" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"imza-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · teslimat notu · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · İmza / Kimlik / İmzasız · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { IMZA_KEY, LABELS as IMZA_LABELS };
