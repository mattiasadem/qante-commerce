"use client";
import { useEffect, useState } from "react";

const INSTR_KEY = "qante_ship_instr";

export type ShipInstr = "kapi" | "komsu" | "zil" | "ara";

export type ShipInstrInfo = {
  instr: ShipInstr | null;
};

const LABELS: Record<ShipInstr, string> = {
  kapi: "Kapıya bırak",
  komsu: "Komşuya bırak",
  zil: "Zili çalma",
  ara: "Arayarak gel",
};

const OPTIONS: ShipInstr[] = ["kapi", "komsu", "zil", "ara"];

const EMPTY: ShipInstrInfo = { instr: null };

export function readShipInstr(): ShipInstrInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(INSTR_KEY) || "null") as Partial<ShipInstrInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const i = raw.instr;
    if (i === "kapi" || i === "komsu" || i === "zil" || i === "ara") return { instr: i };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeShipInstr(info: ShipInstrInfo) {
  try {
    if (!info.instr) localStorage.removeItem(INSTR_KEY);
    else localStorage.setItem(INSTR_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-ship-instr"));
  } catch {
    /* ignore */
  }
}

export function clearShipInstr() {
  writeShipInstr({ ...EMPTY });
}

export function formatShipInstrTag(info: ShipInstrInfo = readShipInstr()): string | null {
  if (!info.instr) return null;
  return `[talimat:${info.instr}]`;
}

export function parseShipInstrFromNote(note?: string): { instr: ShipInstr; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[talimat:(kapi|komsu|zil|ara)\]/i);
  if (!m) return null;
  const instr = m[1].toLowerCase() as ShipInstr;
  return { instr, label: LABELS[instr] };
}

/** Cart /sepet + drawer: delivery instruction chips, localStorage only. */
export function ShipInstrField() {
  const [info, setInfo] = useState<ShipInstrInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readShipInstr());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-ship-instr", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-ship-instr", sync);
    };
  }, []);

  function pick(instr: ShipInstr) {
    const next = { instr: info.instr === instr ? null : instr };
    writeShipInstr(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="ship-instr-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat talimatı</span>
        {info.instr ? (
          <button
            className="chip"
            type="button"
            data-cta="ship-instr-clear"
            onClick={() => {
              clearShipInstr();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat talimatı" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {OPTIONS.map((c) => (
          <button
            key={c}
            className={`chip ${info.instr === c ? "on" : ""}`}
            type="button"
            aria-pressed={info.instr === c}
            data-cta={`ship-instr-${c}`}
            onClick={() => pick(c)}
          >
            {LABELS[c]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.instr
          ? `Seçilen · ${LABELS[info.instr]} · demo · checkout notuna yazılır · ikas'a gitmez`
          : "Kurye için kısa talimat · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { INSTR_KEY, LABELS as SHIP_INSTR_LABELS };
