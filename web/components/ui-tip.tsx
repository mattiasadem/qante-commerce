"use client";
import { useEffect, useState } from "react";

const TIP_KEY = "qante_tip";

export type TipAmount = "20" | "40" | "60";

export type TipInfo = {
  amount: TipAmount | null;
};

const LABELS: Record<TipAmount, string> = {
  "20": "20 ₺",
  "40": "40 ₺",
  "60": "60 ₺",
};

const AMOUNTS: TipAmount[] = ["20", "40", "60"];

const EMPTY: TipInfo = { amount: null };

export function readTip(): TipInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(TIP_KEY) || "null") as Partial<TipInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const a = raw.amount;
    if (a === "20" || a === "40" || a === "60") return { amount: a };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeTip(info: TipInfo) {
  try {
    if (!info.amount) localStorage.removeItem(TIP_KEY);
    else localStorage.setItem(TIP_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-tip"));
  } catch {
    /* ignore */
  }
}

export function clearTip() {
  writeTip({ ...EMPTY });
}

export function tipLabel(amount: TipAmount | null | undefined): string | null {
  if (!amount) return null;
  return LABELS[amount] ?? null;
}

export function useTip(): TipInfo {
  const [info, setInfo] = useState<TipInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readTip());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-tip", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-tip", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatTipTag(info: TipInfo = readTip()): string | null {
  if (!info.amount) return null;
  return `[bahsis:${info.amount}]`;
}

export function parseTipFromNote(note?: string): { amount: TipAmount; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[bahsis:(20|40|60)\]/i);
  if (!m) return null;
  const amount = m[1] as TipAmount;
  return { amount, label: LABELS[amount] };
}

/** Cart /sepet + drawer: Kurye bahşişi chips, localStorage only. */
export function TipField() {
  const [info, setInfo] = useState<TipInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readTip());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-tip", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-tip", sync);
    };
  }, []);

  function pick(amount: TipAmount) {
    const next = { amount: info.amount === amount ? null : amount };
    writeTip(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="tip-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Kurye bahşişi</span>
        {info.amount ? (
          <button
            className="chip"
            type="button"
            data-cta="tip-clear"
            onClick={() => {
              clearTip();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Kurye bahşişi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {AMOUNTS.map((a) => (
          <button
            key={a}
            className={`chip ${info.amount === a ? "on" : ""}`}
            type="button"
            aria-pressed={info.amount === a}
            data-cta={`tip-${a}`}
            onClick={() => pick(a)}
          >
            {LABELS[a]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.amount
          ? `Seçilen · ${LABELS[info.amount]} · isteğe bağlı · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı bahşiş · 20 / 40 / 60 ₺ · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { TIP_KEY, LABELS as TIP_LABELS };
