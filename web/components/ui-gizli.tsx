"use client";
import { useEffect, useState } from "react";

const GIZLI_KEY = "qante_gizli";

export type GizliMode = "kapali" | "markasiz" | "fatura";

export type GizliInfo = {
  mode: GizliMode | null;
};

const LABELS: Record<GizliMode, string> = {
  kapali: "Kapalı kutu",
  markasiz: "Markasız paket",
  fatura: "Fatura ayrı",
};

const SHORT: Record<GizliMode, string> = {
  kapali: "Kapalı",
  markasiz: "Markasız",
  fatura: "Fatura ayrı",
};

const MODES: GizliMode[] = ["kapali", "markasiz", "fatura"];

const EMPTY: GizliInfo = { mode: null };

export function readGizli(): GizliInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(GIZLI_KEY) || "null") as Partial<GizliInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "kapali" || m === "markasiz" || m === "fatura") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeGizli(info: GizliInfo) {
  try {
    if (!info.mode) localStorage.removeItem(GIZLI_KEY);
    else localStorage.setItem(GIZLI_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-gizli"));
  } catch {
    /* ignore */
  }
}

export function clearGizli() {
  writeGizli({ ...EMPTY });
}

export function useGizli(): GizliInfo {
  const [info, setInfo] = useState<GizliInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readGizli());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-gizli", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-gizli", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatGizliTag(info: GizliInfo = readGizli()): string | null {
  if (!info.mode) return null;
  return "[gizli:" + info.mode + "]";
}

export function parseGizliFromNote(note?: string): { mode: GizliMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[gizli:(kapali|markasiz|fatura)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as GizliMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Gizlilik paketi chips, localStorage only. */
export function GizliField() {
  const [info, setInfo] = useState<GizliInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readGizli());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-gizli", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-gizli", sync);
    };
  }, []);

  function pick(mode: GizliMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeGizli(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="gizli-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Gizlilik paketi</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="gizli-clear"
            onClick={() => {
              clearGizli();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Gizlilik paketi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"gizli-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · ücretsiz · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · Kapalı / Markasız / Fatura ayrı · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { GIZLI_KEY, LABELS as GIZLI_LABELS };
