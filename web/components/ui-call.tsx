"use client";
import { useEffect, useState } from "react";

const CALL_KEY = "qante_call";

export type CallMode = "ara" | "whatsapp" | "yok";

export type CallInfo = {
  mode: CallMode | null;
};

const LABELS: Record<CallMode, string> = {
  ara: "Ara önce",
  whatsapp: "WhatsApp",
  yok: "Arama",
};

const SHORT: Record<CallMode, string> = {
  ara: "Ara önce",
  whatsapp: "WhatsApp",
  yok: "Arama",
};

const MODES: CallMode[] = ["ara", "whatsapp", "yok"];

const EMPTY: CallInfo = { mode: null };

export function readCall(): CallInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(CALL_KEY) || "null") as Partial<CallInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "ara" || m === "whatsapp" || m === "yok") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeCall(info: CallInfo) {
  try {
    if (!info.mode) localStorage.removeItem(CALL_KEY);
    else localStorage.setItem(CALL_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-call"));
  } catch {
    /* ignore */
  }
}

export function clearCall() {
  writeCall({ ...EMPTY });
}

export function useCall(): CallInfo {
  const [info, setInfo] = useState<CallInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readCall());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-call", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-call", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatCallTag(info: CallInfo = readCall()): string | null {
  if (!info.mode) return null;
  return `[ara:${info.mode}]`;
}

export function parseCallFromNote(note?: string): { mode: CallMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[ara:(ara|whatsapp|yok)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as CallMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Ara önce chips, localStorage only. */
export function CallField() {
  const [info, setInfo] = useState<CallInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readCall());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-call", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-call", sync);
    };
  }, []);

  function pick(mode: CallMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writeCall(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="call-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Ara önce</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="call-clear"
            onClick={() => {
              clearCall();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Ara önce" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`call-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · teslimat öncesi iletişim · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Ara önce / WhatsApp / Arama · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { CALL_KEY, LABELS as CALL_LABELS };
