"use client";

import { useState } from "react";
import { parsePhotoFromNote } from "@/components/ui-photo";

/** /siparis confirm: photo-proof delivery preference from checkout note with copy CTA. */
export function OrderConfirmPhotoSummary({ note }: { note?: string }) {
  const photo = parsePhotoFromNote(note);
  const [copied, setCopied] = useState(false);

  async function copyPhoto() {
    if (!photo) return;
    try {
      await navigator.clipboard.writeText(photo.label);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  if (!photo) return null;
  return (
    <p className="muted" data-cta="photo-summary" style={{ marginTop: 6 }}>
      Foto · {photo.label}
      <button
        className="chip"
        type="button"
        data-cta="photo-copy"
        style={{ marginLeft: 10 }}
        onClick={() => void copyPhoto()}
      >
        {copied ? "kopyalandı" : "Fotoyu kopyala"}
      </button>
    </p>
  );
}
