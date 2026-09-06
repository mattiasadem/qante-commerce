"use client";
import { useEffect, useState } from "react";

const INS_KEY = "qante_insurance";

export type InsPlan = "temel" | "tam" | "premium";

export type InsInfo = {
  plan: InsPlan | null;
};

const LABELS: Record<InsPlan, string> = {
  temel: "Temel · 29 ₺",
  tam: "Tam · 59 ₺",
  premium: "Premium · 99 ₺",
};

const SHORT: Record<InsPlan, string> = {
  temel: "Temel",
  tam: "Tam",
  premium: "Premium",
};

const PLANS: InsPlan[] = ["temel", "tam", "premium"];

const EMPTY: InsInfo = { plan: null };

export function readInsurance(): InsInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(INS_KEY) || "null") as Partial<InsInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const p = raw.plan;
    if (p === "temel" || p === "tam" || p === "premium") return { plan: p };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeInsurance(info: InsInfo) {
  try {
    if (!info.plan) localStorage.removeItem(INS_KEY);
    else localStorage.setItem(INS_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-insurance"));
  } catch {
    /* ignore */
  }
}

export function clearInsurance() {
  writeInsurance({ ...EMPTY });
}

export function useInsurance(): InsInfo {
  const [info, setInfo] = useState<InsInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readInsurance());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-insurance", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-insurance", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatInsuranceTag(info: InsInfo = readInsurance()): string | null {
  if (!info.plan) return null;
  return `[sigorta:${info.plan}]`;
}

export function parseInsuranceFromNote(note?: string): { plan: InsPlan; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[sigorta:(temel|tam|premium)\]/i);
  if (!m) return null;
  const plan = m[1].toLowerCase() as InsPlan;
  return { plan, label: LABELS[plan] };
}

/** Cart /sepet + drawer: Kargo sigortası chips, localStorage only. */
export function InsuranceField() {
  const [info, setInfo] = useState<InsInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readInsurance());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-insurance", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-insurance", sync);
    };
  }, []);

  function pick(plan: InsPlan) {
    const next = { plan: info.plan === plan ? null : plan };
    writeInsurance(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="insurance-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Kargo sigortası</span>
        {info.plan ? (
          <button
            className="chip"
            type="button"
            data-cta="insurance-clear"
            onClick={() => {
              clearInsurance();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Kargo sigortası" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PLANS.map((p) => (
          <button
            key={p}
            className={`chip ${info.plan === p ? "on" : ""}`}
            type="button"
            aria-pressed={info.plan === p}
            data-cta={`insurance-${p}`}
            onClick={() => pick(p)}
          >
            {SHORT[p]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.plan
          ? `Seçilen · ${LABELS[info.plan]} · hasar/kayıp koruması · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Temel 29 / Tam 59 / Premium 99 ₺ · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { INS_KEY, LABELS as INS_LABELS };
