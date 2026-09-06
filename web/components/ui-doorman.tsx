"use client";
import { useEffect, useState } from "react";

const DOORMAN_KEY = "qante_doorman";

export type DoormanInfo = {
  enabled: boolean;
  note: string;
};

const EMPTY: DoormanInfo = { enabled: false, note: "" };

function cleanNote(s: string): string {
  return s.replace(/[|\]]/g, "").slice(0, 40);
}

export function readDoorman(): DoormanInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(DOORMAN_KEY) || "null") as Partial<DoormanInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    return {
      enabled: Boolean(raw.enabled),
      note: typeof raw.note === "string" ? cleanNote(raw.note) : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

export function writeDoorman(info: DoormanInfo) {
  try {
    localStorage.setItem(DOORMAN_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-doorman"));
  } catch {
    /* ignore */
  }
}

export function clearDoorman() {
  try {
    localStorage.removeItem(DOORMAN_KEY);
    window.dispatchEvent(new CustomEvent("qante-doorman"));
  } catch {
    /* ignore */
  }
}

/** Compact tag for order note (fits checkout note budget). */
export function formatDoormanTag(info: DoormanInfo = readDoorman()): string | null {
  if (!info.enabled) return null;
  const note = cleanNote(info.note.trim());
  return note ? `[kapici:${note}]` : "[kapici]";
}

export function parseDoormanFromNote(note?: string): { note: string; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[kapici(?::([^\]]*))?\]/i);
  if (!m) return null;
  const n = (m[1] ?? "").trim();
  return { note: n, label: n ? `Kapıcıya bırak · ${n}` : "Kapıcıya bırak" };
}

/** Cart /sepet + drawer: leave with doorman toggle, localStorage only. */
export function DoormanField() {
  const [info, setInfo] = useState<DoormanInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readDoorman());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-doorman", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-doorman", sync);
    };
  }, []);

  function setEnabled(enabled: boolean) {
    const next = { ...info, enabled };
    writeDoorman(next);
    setInfo(next);
  }

  function setNote(note: string) {
    const next = { ...info, note: cleanNote(note), enabled: true };
    writeDoorman(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="doorman-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <button
          className={`chip ${info.enabled ? "on" : ""}`}
          type="button"
          aria-pressed={info.enabled}
          data-cta="doorman-toggle"
          onClick={() => setEnabled(!info.enabled)}
        >
          Kapıcıya bırak{info.enabled ? " · açık" : ""}
        </button>
        {info.enabled ? (
          <button className="chip" type="button" data-cta="doorman-clear" onClick={() => { clearDoorman(); setInfo({ ...EMPTY }); }}>
            Kaldır
          </button>
        ) : null}
      </div>
      {info.enabled ? (
        <label style={{ display: "block", marginTop: 8 }} data-cta="doorman-note-form">
          <span className="faint" style={{ display: "block", marginBottom: 6 }}>
            Daire / isim (isteğe bağlı)
          </span>
          <input
            className="search"
            value={info.note}
            placeholder="3B · Yılmaz"
            aria-label="Kapıcı notu"
            data-cta="doorman-note"
            maxLength={40}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%" }}
          />
          <p className="faint" style={{ marginTop: 6 }}>
            Evde yoksa kapıcıya bırak · demo · checkout notuna yazılır · ikas&apos;a gitmez
          </p>
        </label>
      ) : (
        <p className="faint" style={{ marginTop: 6 }}>
          Açınca kapıcıya bırak + isteğe bağlı daire/isim · demo · ikas&apos;a gitmez
        </p>
      )}
    </div>
  );
}

export { DOORMAN_KEY };
