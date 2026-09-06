"use client";
import { useEffect, useState } from "react";

const SPEED_KEY = "qante_ship_speed";

export type ShipSpeed = "standart" | "express" | "ayni";

export type ShipSpeedInfo = {
  speed: ShipSpeed | null;
};

const LABELS: Record<ShipSpeed, string> = {
  standart: "Standart",
  express: "Express",
  ayni: "Aynı gün",
};

const SPEEDS: ShipSpeed[] = ["standart", "express", "ayni"];

const EMPTY: ShipSpeedInfo = { speed: null };

export function readShipSpeed(): ShipSpeedInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(SPEED_KEY) || "null") as Partial<ShipSpeedInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const s = raw.speed;
    if (s === "standart" || s === "express" || s === "ayni") return { speed: s };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipSpeed(info: ShipSpeedInfo) {
  try {
    if (!info.speed) localStorage.removeItem(SPEED_KEY);
    else localStorage.setItem(SPEED_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-speed"));
  } catch {
    /* ignore */
  }
}

export function clearShipSpeed() {
  writeShipSpeed({ ...EMPTY });
}

export function shipSpeedLabel(speed: ShipSpeed | null | undefined): string | null {
  if (!speed) return null;
  return LABELS[speed] ?? null;
}

export function useShipSpeed(): ShipSpeedInfo {
  const [info, setInfo] = useState<ShipSpeedInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readShipSpeed());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-speed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-speed", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatShipSpeedTag(info: ShipSpeedInfo = readShipSpeed()): string | null {
  if (!info.speed) return null;
  return `[hiz:${info.speed}]`;
}

export function parseShipSpeedFromNote(note?: string): { speed: ShipSpeed; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[hiz:(standart|express|ayni)\]/i);
  if (!m) return null;
  const speed = m[1].toLowerCase() as ShipSpeed;
  return { speed, label: LABELS[speed] };
}

/** Cart /sepet + drawer: Standart / Express / Aynı gün chips, localStorage only. */
export function ShipSpeedField() {
  const [info, setInfo] = useState<ShipSpeedInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipSpeed());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-speed", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-speed", sync);
    };
  }, []);

  function pick(speed: ShipSpeed) {
    const next = { speed: info.speed === speed ? null : speed };
    writeShipSpeed(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-speed-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat hızı</span>
        {info.speed ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-speed-clear"
            onClick={() => {
              clearShipSpeed();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat hızı" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`chip ${info.speed === s ? "on" : ""}`}
            type="button"
            aria-pressed={info.speed === s}
            data-cta={`ship-speed-${s}`}
            onClick={() => pick(s)}
          >
            {LABELS[s]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.speed === "express"
          ? "Seçilen · Express · 1–2 iş günü · demo · checkout notuna yazılır · ikas'a gitmez"
          : info.speed === "ayni"
            ? "Seçilen · Aynı gün · uygun bölgeler · demo · checkout notuna yazılır · ikas'a gitmez"
            : info.speed === "standart"
              ? "Seçilen · Standart · 3–5 iş günü · demo · checkout notuna yazılır · ikas'a gitmez"
              : "İsteğe bağlı hız · Standart / Express / Aynı gün · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { SPEED_KEY, LABELS as SHIP_SPEED_LABELS };
