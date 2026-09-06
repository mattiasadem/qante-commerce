"use client";
import { useEffect, useState } from "react";

const MONTAJ_KEY = "qante_montaj";

export type MontajMode = "temel" | "tam" | "uzman";

export type MontajInfo = {
  mode: MontajMode | null;
};

const LABELS: Record<MontajMode, string> = {
  temel: "Temel montaj",
  tam: "Tam kurulum",
  uzman: "Uzman kurulum",
};

const SHORT: Record<MontajMode, string> = {
  temel: "Temel",
  tam: "Tam",
  uzman: "Uzman",
};

const MODES: MontajMode[] = ["temel", "tam", "uzman"];

const EMPTY: MontajInfo = { mode: null };

export function readMontaj(): MontajInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(MONTAJ_KEY) || "null") as Partial<MontajInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "temel" || m === "tam" || m === "uzman") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeMontaj(info: MontajInfo) {
  try {
    if (!info.mode) localStorage.removeItem(MONTAJ_KEY);
    else localStorage.setItem(MONTAJ_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-montaj"));
  } catch {
    /* ignore */
  }
}

export function clearMontaj() {
  writeMontaj({ ...EMPTY });
}

export function useMontaj(): MontajInfo {
  const [info, setInfo] = useState<MontajInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readMontaj());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-montaj", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-montaj", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatMontajTag(info: MontajInfo = readMontaj()): string | null {
  if (!info.mode) return null;
  return `[montaj:${info.mode}]`;
}

export function parseMontajFromNote(note?: string): { mode: MontajMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[montaj:(temel|tam|uzman)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as MontajMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Montaj hizmeti chips, localStorage only. */
export function MontajField() {
  const [info, setInfo] = useState<MontajInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readMontaj());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-montaj", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-montaj", sync);
    };
  }, []);

  function pick(mode: MontajMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeMontaj(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="montaj-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Montaj hizmeti</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="montaj-clear"
            onClick={() => {
              clearMontaj();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Montaj hizmeti" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`montaj-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · montaj notu · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Temel / Tam / Uzman · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { MONTAJ_KEY, LABELS as MONTAJ_LABELS };
