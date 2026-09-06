"use client";
import { useEffect, useState } from "react";

const QUIET_KEY = "qante_quiet";

export type QuietMode = "calma" | "sessiz" | "not";

export type QuietInfo = {
  mode: QuietMode | null;
};

const LABELS: Record<QuietMode, string> = {
  calma: "Zili çalma",
  sessiz: "Sessiz bırak",
  not: "Kapıya not",
};

const SHORT: Record<QuietMode, string> = {
  calma: "Zili çalma",
  sessiz: "Sessiz bırak",
  not: "Kapıya not",
};

const MODES: QuietMode[] = ["calma", "sessiz", "not"];

const EMPTY: QuietInfo = { mode: null };

export function readQuiet(): QuietInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(QUIET_KEY) || "null") as Partial<QuietInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "calma" || m === "sessiz" || m === "not") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeQuiet(info: QuietInfo) {
  try {
    if (!info.mode) localStorage.removeItem(QUIET_KEY);
    else localStorage.setItem(QUIET_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-quiet"));
  } catch {
    /* ignore */
  }
}

export function clearQuiet() {
  writeQuiet({ ...EMPTY });
}

export function useQuiet(): QuietInfo {
  const [info, setInfo] = useState<QuietInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readQuiet());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-quiet", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-quiet", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatQuietTag(info: QuietInfo = readQuiet()): string | null {
  if (!info.mode) return null;
  return `[zil:${info.mode}]`;
}

export function parseQuietFromNote(note?: string): { mode: QuietMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[zil:(calma|sessiz|not)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as QuietMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Zili çalma chips, localStorage only. */
export function QuietField() {
  const [info, setInfo] = useState<QuietInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readQuiet());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-quiet", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-quiet", sync);
    };
  }, []);

  function pick(mode: QuietMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeQuiet(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="quiet-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Zili çalma</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="quiet-clear"
            onClick={() => {
              clearQuiet();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Zili çalma" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`quiet-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · sessiz teslimat · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Zili çalma / Sessiz bırak / Kapıya not · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { QUIET_KEY, LABELS as QUIET_LABELS };
