"use client";
import { useEffect, useState } from "react";

const KOMSU_KEY = "qante_komsu";

export type KomsuMode = "komsuya" | "kapida" | "alma";

export type KomsuInfo = {
  mode: KomsuMode | null;
};

const LABELS: Record<KomsuMode, string> = {
  komsuya: "Komşuya bırak",
  kapida: "Kapıda bırak",
  alma: "Teslim alacağım",
};

const SHORT: Record<KomsuMode, string> = {
  komsuya: "Komşu",
  kapida: "Kapıda",
  alma: "Alacağım",
};

const MODES: KomsuMode[] = ["komsuya", "kapida", "alma"];

const EMPTY: KomsuInfo = { mode: null };

export function readKomsu(): KomsuInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(KOMSU_KEY) || "null") as Partial<KomsuInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "komsuya" || m === "kapida" || m === "alma") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeKomsu(info: KomsuInfo) {
  try {
    if (!info.mode) localStorage.removeItem(KOMSU_KEY);
    else localStorage.setItem(KOMSU_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-komsu"));
  } catch {
    /* ignore */
  }
}

export function clearKomsu() {
  writeKomsu({ ...EMPTY });
}

export function useKomsu(): KomsuInfo {
  const [info, setInfo] = useState<KomsuInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readKomsu());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-komsu", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-komsu", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatKomsuTag(info: KomsuInfo = readKomsu()): string | null {
  if (!info.mode) return null;
  return "[komsu:" + info.mode + "]";
}

export function parseKomsuFromNote(note?: string): { mode: KomsuMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[komsu:(komsuya|kapida|alma)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as KomsuMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Komşu teslimatı chips, localStorage only. */
export function KomsuField() {
  const [info, setInfo] = useState<KomsuInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readKomsu());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-komsu", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-komsu", sync);
    };
  }, []);

  function pick(mode: KomsuMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeKomsu(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="komsu-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Komşu teslimatı</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="komsu-clear"
            onClick={() => {
              clearKomsu();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Komşu teslimatı" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"komsu-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · yokken bırakma · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · Komşu / Kapıda / Alacağım · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { KOMSU_KEY, LABELS as KOMSU_LABELS };
