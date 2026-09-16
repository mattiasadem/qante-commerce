"use client";

import { useState } from "react";
import { parsePhotoFromNote } from "@/components/ui-photo";

/** Siparişlerim row: photo delivery preference from checkout note with copy CTA. */
export function MyOrderPhotoLine({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  const [copied, setCopied] = useState(false);
  if (!photo) return null;

  const label = `Foto · ${photo.label}`;

  async function copyFoto() {
    try {
      await navigator.clipboard.writeText(label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="faint" data-cta="my-orders-photo" style={{ marginTop: 6 }}>
      {label}
      <button
        className="chip"
        type="button"
        data-cta="my-orders-photo-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyFoto()}
      >
        {copied ? "kopyalandı" : "Fotoyu kopyala"}
      </button>
    </div>
  );
}
