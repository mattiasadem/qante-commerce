"use client";
import { useEffect, useState } from "react";

const PHOTO_KEY = "qante_photo";

export type PhotoMode = "kapida" | "kutu" | "imza";

export type PhotoInfo = {
  mode: PhotoMode | null;
};

const LABELS: Record<PhotoMode, string> = {
  kapida: "Kapıda foto",
  kutu: "Kutuda foto",
  imza: "İmza + foto",
};

const SHORT: Record<PhotoMode, string> = {
  kapida: "Kapıda",
  kutu: "Kutuda",
  imza: "İmza",
};

const MODES: PhotoMode[] = ["kapida", "kutu", "imza"];

const EMPTY: PhotoInfo = { mode: null };

export function readPhoto(): PhotoInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(PHOTO_KEY) || "null") as Partial<PhotoInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const m = raw.mode;
    if (m === "kapida" || m === "kutu" || m === "imza") return { mode: m };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writePhoto(info: PhotoInfo) {
  try {
    if (!info.mode) localStorage.removeItem(PHOTO_KEY);
    else localStorage.setItem(PHOTO_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-photo"));
  } catch {
    /* ignore */
  }
}

export function clearPhoto() {
  writePhoto({ ...EMPTY });
}

export function usePhoto(): PhotoInfo {
  const [info, setInfo] = useState<PhotoInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readPhoto());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-photo", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-photo", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatPhotoTag(info: PhotoInfo = readPhoto()): string | null {
  if (!info.mode) return null;
  return `[foto:${info.mode}]`;
}

export function parsePhotoFromNote(note?: string): { mode: PhotoMode; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[foto:(kapida|kutu|imza)\]/i);
  if (!m) return null;
  const mode = m[1].toLowerCase() as PhotoMode;
  return { mode, label: LABELS[mode] };
}

/** Cart /sepet + drawer: Fotoğraflı teslimat chips, localStorage only. */
export function PhotoField() {
  const [info, setInfo] = useState<PhotoInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readPhoto());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-photo", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-photo", sync);
    };
  }, []);

  function pick(mode: PhotoMode) {
    const next = { mode: info.mode === mode ? null : mode };
    writePhoto(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="photo-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Fotoğraflı teslimat</span>
        {info.mode ? (
          <button
            className="chip"
            type="button"
            data-cta="photo-clear"
            onClick={() => {
              clearPhoto();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Fotoğraflı teslimat" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {MODES.map((m) => (
          <button
            key={m}
            className={`chip ${info.mode === m ? "on" : ""}`}
            type="button"
            aria-pressed={info.mode === m}
            data-cta={`photo-${m}`}
            onClick={() => pick(m)}
          >
            {SHORT[m]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.mode
          ? `Seçilen · ${LABELS[info.mode]} · kurye kanıt fotoğrafı · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · Kapıda / Kutuda / İmza · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { PHOTO_KEY, LABELS as PHOTO_LABELS };
