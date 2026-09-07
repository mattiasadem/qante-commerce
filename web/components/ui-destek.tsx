"use client";
import { useEffect, useState } from "react";

const DESTEK_KEY = "qante_destek";

export type DestekMode = "standart" | "oncelikli" | "vip";

export type DestekInfo = {
  mode: DestekMode | null;
};

const LABELS: Record<DestekMode, string> = {
  standart: "Standart destek",
  oncelikli: "Öncelikli destek",
  vip: "VIP destek",
};

const SHORT: Record<DestekMode, string> = {
  standart: "Standart",
  oncelikli: "Öncelikli",
  vip: "VIP",
};

const MODES: DestekMode[] = ["standart", "oncelikli", "vip"];

const EMPTY: DestekInfo = { mode: null };

export function readDestek(): DestekInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(DESTEK_KEY) || "null") as Partial<DestekInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "standart" || m === "oncelikli" || m === "vip") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeDestek(info: DestekInfo) {
  try {
    if (!info.mode) localStorage.removeItem(DESTEK_KEY);
    else localStorage.setItem(DESTEK_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-destek"));
  } catch {
    /* ignore */
  }
}

export function clearDestek() {
  writeDestek({ ...EMPTY });
}

export function useDestek(): DestekInfo {
  const [info, setInfo] = useState<DestekInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readDestek());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-destek", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-destek", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatDestekTag(info: DestekInfo = readDestek()): string | null {
  if (!info.mode) return null;
  return "[destek:" + info.mode + "]";
}

export function parseDestekFromNote(note?: string): { mode: DestekMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[destek:(standart|oncelikli|vip)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as DestekMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Öncelikli destek chips, localStorage only. */
export function DestekField() {
  const [info, setInfo] = useState<DestekInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readDestek());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-destek", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-destek", sync);
    };
  }, []);

  function pick(mode: DestekMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeDestek(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="destek-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Öncelikli destek</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="destek-clear"
            onClick={() => {
              clearDestek();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Öncelikli destek" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"destek-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · destek notu · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · Standart / Öncelikli / VIP · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { DESTEK_KEY, LABELS as DESTEK_LABELS };
