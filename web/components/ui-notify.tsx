"use client";
import { useEffect, useState } from "react";

const NOTIFY_KEY = "qante_notify";

export type NotifyChannel = "sms" | "eposta" | "ikisi";

export type NotifyInfo = {
  channel: NotifyChannel | null;
};

const LABELS: Record<NotifyChannel, string> = {
  sms: "SMS",
  eposta: "E-posta",
  ikisi: "SMS + E-posta",
};

const SHORT: Record<NotifyChannel, string> = {
  sms: "SMS",
  eposta: "E-posta",
  ikisi: "Her ikisi",
};

const CHANNELS: NotifyChannel[] = ["sms", "eposta", "ikisi"];

const EMPTY: NotifyInfo = { channel: null };

export function readNotify(): NotifyInfo {
  try {
    const raw = JSON.parse(localStorage.getItem(NOTIFY_KEY) || "null") as Partial<NotifyInfo> | null;
    if (!raw || typeof raw !== "object") return { ...EMPTY };
    const c = raw.channel;
    if (c === "sms" || c === "eposta" || c === "ikisi") return { channel: c };
    return { ...EMPTY };
  } catch {
    return { ...EMPTY };
  }
}

export function writeNotify(info: NotifyInfo) {
  try {
    if (!info.channel) localStorage.removeItem(NOTIFY_KEY);
    else localStorage.setItem(NOTIFY_KEY, JSON.stringify(info));
    window.dispatchEvent(new CustomEvent("qante-notify"));
  } catch {
    /* ignore */
  }
}

export function clearNotify() {
  writeNotify({ ...EMPTY });
}

export function useNotify(): NotifyInfo {
  const [info, setInfo] = useState<NotifyInfo>({ ...EMPTY });
  useEffect(() => {
    const sync = () => setInfo(readNotify());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-notify", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-notify", sync);
    };
  }, []);
  return info;
}

/** Compact tag for order note (fits checkout note budget). */
export function formatNotifyTag(info: NotifyInfo = readNotify()): string | null {
  if (!info.channel) return null;
  return `[bildirim:${info.channel}]`;
}

export function parseNotifyFromNote(note?: string): { channel: NotifyChannel; label: string } | null {
  if (!note) return null;
  const m = note.match(/\[bildirim:(sms|eposta|ikisi)\]/i);
  if (!m) return null;
  const channel = m[1].toLowerCase() as NotifyChannel;
  return { channel, label: LABELS[channel] };
}

/** Cart /sepet + drawer: Teslimat bildirimi chips, localStorage only. */
export function NotifyField() {
  const [info, setInfo] = useState<NotifyInfo>({ ...EMPTY });

  useEffect(() => {
    const sync = () => setInfo(readNotify());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("qante-notify", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("qante-notify", sync);
    };
  }, []);

  function pick(channel: NotifyChannel) {
    const next = { channel: info.channel === channel ? null : channel };
    writeNotify(next);
    setInfo(next);
  }

  return (
    <div style={{ marginBottom: 12 }} data-cta="notify-field">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <span className="faint">Teslimat bildirimi</span>
        {info.channel ? (
          <button
            className="chip"
            type="button"
            data-cta="notify-clear"
            onClick={() => {
              clearNotify();
              setInfo({ ...EMPTY });
            }}
          >
            Kaldır
          </button>
        ) : null}
      </div>
      <div className="chips" role="group" aria-label="Teslimat bildirimi" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CHANNELS.map((c) => (
          <button
            key={c}
            className={`chip ${info.channel === c ? "on" : ""}`}
            type="button"
            aria-pressed={info.channel === c}
            data-cta={`notify-${c}`}
            onClick={() => pick(c)}
          >
            {SHORT[c]}
          </button>
        ))}
      </div>
      <p className="faint" style={{ marginTop: 6 }}>
        {info.channel
          ? `Seçilen · ${LABELS[info.channel]} · kargo/teslimat güncellemeleri · demo · checkout notuna yazılır · ikas'a gitmez`
          : "İsteğe bağlı · SMS / E-posta / Her ikisi · demo · ikas'a gitmez"}
      </p>
    </div>
  );
}

export { NOTIFY_KEY, LABELS as NOTIFY_LABELS };
