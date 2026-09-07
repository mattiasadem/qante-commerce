"use client";
import { useEffect, useState } from "react";

const ERISIM_KEY = "qante_erisim";

export type ErisimMode = "asansor" | "merdiven" | "yardim";

export type ErisimInfo = {
  mode: ErisimMode | null;
};

const LABELS: Record<ErisimMode, string> = {
  asansor: "Asansör var",
  merdiven: "Merdiven",
  yardim: "Yardım lazım",
};

const SHORT: Record<ErisimMode, string> = {
  asansor: "Asansör",
  merdiven: "Merdiven",
  yardim: "Yardım",
};

const MODES: ErisimMode[] = ["asansor", "merdiven", "yardim"];

const EMPTY: ErisimInfo = { mode: null };

export function readErisim(): ErisimInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(ERISIM_KEY) || "null") as Partial<ErisimInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "asansor" || m === "merdiven" || m === "yardim") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeErisim(info: ErisimInfo) {
  try {
    if (!info.mode) localStorage.removeItem(ERISIM_KEY);
    else localStorage.setItem(ERISIM_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-erisim"));
  } catch {
    /* ignore */
  }
}

export function clearErisim() {
  writeErisim({ ...EMPTY });
}

export function useErisim(): ErisimInfo {
  const [info, setInfo] = useState<ErisimInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readErisim());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-erisim", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-erisim", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatErisimTag(info: ErisimInfo = readErisim()): string | null {
  if (!info.mode) return null;
  return "[erisim:" + info.mode + "]";
}

export function parseErisimFromNote(note?: string): { mode: ErisimMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[erisim:(asansor|merdiven|yardim)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as ErisimMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Erişim chips, localStorage only. */
export function ErisimField() {
  const [info, setInfo] = useState<ErisimInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readErisim());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-erisim", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-erisim", sync);
    };
  }, []);

  function pick(mode: ErisimMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeErisim(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="erisim-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Erişim</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="erisim-clear"
            onClick={() => {
              clearErisim();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Erişim" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"erisim-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · kurye erişimi · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · Asansör / Merdiven / Yardım · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { ERISIM_KEY, LABELS as ERISIM_LABELS };
