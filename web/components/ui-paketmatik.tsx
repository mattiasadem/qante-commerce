"use client";
import { useEffect, useState } from "react";

const PAKETMATIK_KEY = "qante_paketmatik";

export type PaketmatikMode = "mng" | "ptt" | "yurtici";

export type PaketmatikInfo = {
  mode: PaketmatikMode | null;
};

const LABELS: Record<PaketmatikMode, string> = {
  mng: "MNG Kutu",
  ptt: "PTT Kargo",
  yurtici: "Yurtiçi Nokta",
};

const SHORT: Record<PaketmatikMode, string> = {
  mng: "MNG",
  ptt: "PTT",
  yurtici: "Yurtiçi",
};

const MODES: PaketmatikMode[] = ["mng", "ptt", "yurtici"];

const EMPTY: PaketmatikInfo = { mode: null };

export function readPaketmatik(): PaketmatikInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(PAKETMATIK_KEY) || "null") as Partial<PaketmatikInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "mng" || m === "ptt" || m === "yurtici") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writePaketmatik(info: PaketmatikInfo) {
  try {
    if (!info.mode) localStorage.removeItem(PAKETMATIK_KEY);
    else localStorage.setItem(PAKETMATIK_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-paketmatik"));
  } catch {
    /* ignore */
  }
}

export function clearPaketmatik() {
  writePaketmatik({ ...EMPTY });
}

export function usePaketmatik(): PaketmatikInfo {
  const [info, setInfo] = useState<PaketmatikInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readPaketmatik());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-paketmatik", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-paketmatik", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatPaketmatikTag(info: PaketmatikInfo = readPaketmatik()): string | null {
  if (!info.mode) return null;
  return "[paketmatik:" + info.mode + "]";
}

export function parsePaketmatikFromNote(note?: string): { mode: PaketmatikMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[paketmatik:(mng|ptt|yurtici)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as PaketmatikMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Paketmatik chips, localStorage only. */
export function PaketmatikField() {
  const [info, setInfo] = useState<PaketmatikInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readPaketmatik());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-paketmatik", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-paketmatik", sync);
    };
  }, []);

  function pick(mode: PaketmatikMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writePaketmatik(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="paketmatik-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Paketmatik</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="paketmatik-clear"
            onClick={() => {
              clearPaketmatik();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Paketmatik" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={"chip " + (info.mode === m ? "on" : "")}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={"paketmatik-" + m}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? "Seçilen · " + LABELS[info.mode] + " · kargo noktası · demo · checkout notuna yazılır · ikas'a gitmez"
          : "İsteğe bağlı · MNG / PTT / Yurtiçi nokta · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { PAKETMATIK_KEY, LABELS as PAKETMATIK_LABELS };
