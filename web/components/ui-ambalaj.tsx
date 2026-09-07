"use client";
import { useEffect, useState } from "react";

const AMBALAJ_KEY = "qante_ambalaj";

export type AmbalajMode = "standart" | "premium" | "minimal";

export type AmbalajInfo = {
  mode: AmbalajMode | null;
};

const LABELS: Record<AmbalajMode, string> = {
  standart: "Standart ambalaj",
  premium: "Premium ambalaj",
  minimal: "Minimal ambalaj",
};

const SHORT: Record<AmbalajMode, string> = {
  standart: "Standart",
  premium: "Premium",
  minimal: "Minimal",
};

const MODES: AmbalajMode[] = ["standart", "premium", "minimal"];

const EMPTY: AmbalajInfo = { mode: null };

export function readAmbalaj(): AmbalajInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(AMBALAJ_KEY) || "null") as Partial<AmbalajInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "standart" || m === "premium" || m === "minimal") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeAmbalaj(info: AmbalajInfo) {
  try {
    if (!info.mode) localStorage.removeItem(AMBALAJ_KEY);
    else localStorage.setItem(AMBALAJ_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ambalaj"));
  } catch {
    /* ignore */
  }
}

export function clearAmbalaj() {
  writeAmbalaj({ ...EMPTY });
}

export function useAmbalaj(): AmbalajInfo {
  const [info, setInfo] = useState<AmbalajInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readAmbalaj());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ambalaj", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ambalaj", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatAmbalajTag(info: AmbalajInfo = readAmbalaj()): string | null {
  if (!info.mode) return null;
  return "[ambalaj:" + info.mode + "]";
}

export function parseAmbalajFromNote(note?: string): { mode: AmbalajMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[ambalaj:(standart|premium|minimal)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as AmbalajMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Ambalaj tercihi chips, localStorage only. */
export function AmbalajField() {
  const [info, setInfo] = useState<AmbalajInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readAmbalaj());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ambalaj", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ambalaj", sync);
    };
  }, []);

  function pick(mode: AmbalajMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeAmbalaj(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ambalaj-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Ambalaj tercihi</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="ambalaj-clear"
            onClick={() => {
              clearAmbalaj();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Ambalaj tercihi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"ambalaj-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · ambalaj notu · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · Standart / Premium / Minimal · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { AMBALAJ_KEY, LABELS as AMBALAJ_LABELS };
