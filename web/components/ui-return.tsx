"use client";
import { useEffect, useState } from "react";

const RETURN_KEY = "qante_return";

export type ReturnDays = "14" | "30" | "60";

export type ReturnInfo = {
  days: ReturnDays | null;
};

const LABELS: Record<ReturnDays, string> = {
  "14": "14 gün",
  "30": "30 gün",
  "60": "60 gün",
};

const DAYS: ReturnDays[] = ["14", "30", "60"];

const EMPTY: ReturnInfo = { days: null };

export function readReturn(): ReturnInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(RETURN_KEY) || "null") as Partial<ReturnInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const d = raw.days;
    if (d === "14" || d === "30" || d === "60") return { days: d };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeReturn(info: ReturnInfo) {
  try {
    if (!info.days) localStorage.removeItem(RETURN_KEY);
    else localStorage.setItem(RETURN_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-return"));
  } catch {
    /* ignore */
  }
}

export function clearReturn() {
  writeReturn({ ...EMPTY });
}

export function returnLabel(days: ReturnDays | null | undefined): string | null {
  if (!days) return null;
  return LABELS[days] ?? null;
}

export function useReturn(): ReturnInfo {
  const [info, setInfo] = useState<ReturnInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readReturn());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-return", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-return", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatReturnTag(info: ReturnInfo = readReturn()): string | null {
  if (!info.days) return null;
  return `[iade:${info.days}]`;
}

export function parseReturnFromNote(note?: string): { days: ReturnDays; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[iade:(14|30|60)\]/i);
  if (!m) return null;
  const days = m[1] as ReturnDays;
  return { days, label: LABELS[days] };
}

/** Cart /sepet + drawer: Kolay iade chips, localStorage only. */
export function ReturnField() {
  const [info, setInfo] = useState<ReturnInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readReturn());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-return", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-return", sync);
    };
  }, []);

  function pick(days: ReturnDays) {
    const next = { days: info.days === days ? null : days };
    writeReturn(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="return-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Kolay iade</span>
        {info.days ? (
          <button
            className="chip"
            type="button"
            data-cta="return-clear"
            onClick={() => {
              clearReturn();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Kolay iade" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DAYS.map((d) => (
          <button
            key={d}
            className={`chip ${info.days === d ? "on" : ""}`}
            type="button"
            aria-pressed={info.days === d}
            data-cta={`return-${d}`}
            onClick={() => pick(d)}
          >
            {LABELS[d]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.days
          ? `Seçilen · ${LABELS[info.days]} · isteğe bağlı · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı kolay iade süresi · 14 / 30 / 60 gün · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { RETURN_KEY, LABELS as RETURN_LABELS };
