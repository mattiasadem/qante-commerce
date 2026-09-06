"use client";
import { useEffect, useState } from "react";
import { readPayment } from "@/components/ui-payment";

const TAKSIT_KEY = "qante_taksit";

export type TaksitOption = "pesin" | "3" | "6" | "9" | "12";

export type TaksitInfo = {
  option: TaksitOption | null;
};

const LABELS: Record<TaksitOption, string> = {
  pesin: "Peşin",
  "3": "3 taksit",
  "6": "6 taksit",
  "9": "9 taksit",
  "12": "12 taksit",
};

const OPTIONS: TaksitOption[] = ["pesin", "3", "6", "9", "12"];

const EMPTY: TaksitInfo = { option: null };

export function readTaksit(): TaksitInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(TAKSIT_KEY) || "null") as Partial<TaksitInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const o = raw.option;
    if (o === "pesin" || o === "3" || o === "6" || o === "9" || o === "12") return { option: o };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeTaksit(info: TaksitInfo) {
  try {
    if (!info.option) localStorage.removeItem(TAKSIT_KEY);
    else localStorage.setItem(TAKSIT_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-taksit"));
  } catch {
    /* ignore */
  }
}

export function clearTaksit() {
  writeTaksit({ ...EMPTY });
}

export function taksitLabel(option: TaksitOption | null | undefined): string | null {
  if (!option) return null;
  return LABELS[option] ?? null;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatTaksitTag(info: TaksitInfo = readTaksit()): string | null {
  if (!info.option) return null;
  const pay = readPayment();
  if (pay.method && pay.method !== "kart") return null;
  return `[taksit:${info.option}]`;
}

export function parseTaksitFromNote(note?: string): { option: TaksitOption; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[taksit:(pesin|3|6|9|12)\]/i);
  if (!m) return null;
  const option = m[1].toLowerCase() as TaksitOption;
  return { option, label: LABELS[option] };
}

/** Cart /sepet + drawer: installment chips when Ödeme = Kart, localStorage only. */
export function TaksitField() {
  const [info, setInfo] = useState<TaksitInfo>({ ...EMPTY });
  const [kart, setKart] = useState(false);

  useEffect(() => {
    const sync = () => {
      setInfo(readTaksit());
      const pay = readPayment();
      const isKart = pay.method === "kart";
      setKart(isKart);
      if (!isKart && readTaksit().option) clearTaksit();
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-taksit", sync);
    window.addEventListener("qante-payment", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-taksit", sync);
      window.removeEventListener("qante-payment", sync);
    };
  }, []);

  if (!kart) return null;

  function pick(option: TaksitOption) {
    const next = { option: info.option === option ? null : option };
    writeTaksit(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="taksit-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Taksit</span>
        {info.option ? (
          <button
            className="chip"
            type="button"
            data-cta="taksit-clear"
            onClick={() => {
              clearTaksit();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Taksit" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((o) => (
          <button
            key={o}
            className={`chip ${info.option === o ? "on" : ""}`}
            type="button"
            aria-pressed={info.option === o}
            data-cta={`taksit-${o}`}
            onClick={() => pick(o)}
          >
            {LABELS[o]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.option
          ? `Seçilen · ${LABELS[info.option]} · demo · checkout notuna yazılır · ikas'a gitmez`
          : "Kart ile peşin veya taksit · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { TAKSIT_KEY, LABELS as TAKSIT_LABELS };
