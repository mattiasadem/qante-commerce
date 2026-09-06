"use client";
import { useEffect, useState } from "react";

const DAY_KEY = "qante_ship_day";

export type ShipDay = "bugun" | "yarin" | "haftaici" | "cumartesi";

export type ShipDayInfo = {
  day: ShipDay | null;
};

const LABELS: Record<ShipDay, string> = {
  bugun: "Bugün",
  yarin: "Yarın",
  haftaici: "Hafta içi",
  cumartesi: "Cumartesi",
};

const DAYS: ShipDay[] = ["bugun", "yarin", "haftaici", "cumartesi"];

const EMPTY: ShipDayInfo = { day: null };

export function readShipDay(): ShipDayInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(DAY_KEY) || "null") as Partial<ShipDayInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const d = raw.day;
    if (d === "bugun" || d === "yarin" || d === "haftaici" || d === "cumartesi") return { day: d };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipDay(info: ShipDayInfo) {
  try {
    if (!info.day) localStorage.removeItem(DAY_KEY);
    else localStorage.setItem(DAY_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-day"));
  } catch {
    /* ignore */
  }
}

export function clearShipDay() {
  writeShipDay({ ...EMPTY });
}

export function shipDayLabel(day: ShipDay | null | undefined): string | null {
  if (!day) return null;
  return LABELS[day] ?? null;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatShipDayTag(info: ShipDayInfo = readShipDay()): string | null {
  if (!info.day) return null;
  return `[gun:${info.day}]`;
}

export function parseShipDayFromNote(note?: string): { day: ShipDay; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[gun:(bugun|yarin|haftaici|cumartesi)\]/i);
  if (!m) return null;
  const day = m[1].toLowerCase() as ShipDay;
  return { day, label: LABELS[day] };
}

/** Cart /sepet + drawer: demo delivery day chips, localStorage only. */
export function ShipDayField() {
  const [info, setInfo] = useState<ShipDayInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipDay());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-day", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-day", sync);
    };
  }, []);

  function pick(day: ShipDay) {
    const next = { day: info.day === day ? null : day };
    writeShipDay(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-day-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat günü</span>
        {info.day ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-day-clear"
            onClick={() => {
              clearShipDay();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat günü" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DAYS.map((d) => (
          <button
            key={d}
            className={`chip ${info.day === d ? "on" : ""}`}
            type="button"
            aria-pressed={info.day === d}
            data-cta={`ship-day-${d}`}
            onClick={() => pick(d)}
          >
            {LABELS[d]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.day
          ? `Seçilen · ${LABELS[info.day]} · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı gün · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { DAY_KEY, LABELS as SHIP_DAY_LABELS };
