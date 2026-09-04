"use client";

import { useCallback, useRef, useState } from "react";
import type { Cart, StagedChange } from "@/lib/core";
import type { GenSlot } from "@/components/generative";
import type { StreamEvent } from "@/lib/stream-protocol";

export type StreamMsg = {
  role: "user" | "assistant";
  text: string;
  slots: GenSlot[];
  suggestions?: string[];
  actions?: unknown[];
  pending?: boolean;
};

type Opts = {
  endpoint: string;
  onCartUpdate?: (cart: Cart) => void;
  onChangeUpdate?: (change: StagedChange) => void;
};

export function useAgentStream({ endpoint, onCartUpdate, onChangeUpdate }: Opts) {
  const [messages, setMessages] = useState<StreamMsg[]>([]);
  const [busy, setBusy] = useState(false);
  const [activity, setActivity] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const submit = useCallback(
    async (text: string, productId?: string) => {
      const message = text.trim();
      if (!message || busy) return;
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      setBusy(true);
      setActivity("Ürünleri arıyorum…");
      setMessages((m) => [
        ...m,
        { role: "user", text: message, slots: [] },
        { role: "assistant", text: "", slots: [], pending: true },
      ]);

      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({ message, productId }),
          signal: ac.signal,
        });
        if (!res.ok || !res.body) throw new Error(`stream ${res.status}`);

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        let currentEvent = "";

        const patchAssistant = (fn: (msg: StreamMsg) => StreamMsg) => {
          setMessages((all) => {
            const next = [...all];
            for (let i = next.length - 1; i >= 0; i--) {
              if (next[i].role === "assistant") {
                next[i] = fn(next[i]);
                break;
              }
            }
            return next;
          });
        };

        const handle = (ev: StreamEvent) => {
          if (ev.type === "tool_call" || ev.type === "progress") {
            if ("label" in ev && ev.label) setActivity(ev.label);
          } else if (ev.type === "activity" && ev.content) {
            setActivity(ev.content);
          } else if (ev.type === "tool_result") {
            /* keep last activity until text/ui */
          } else if (ev.type === "text_delta") {
            setActivity("");
            patchAssistant((msg) => ({ ...msg, text: msg.text + ev.text }));
          } else if (ev.type === "text") {
            setActivity("");
            patchAssistant((msg) => ({ ...msg, text: ev.content }));
          } else if (ev.type === "ui_partial" || ev.type === "ui") {
            setActivity("");
            patchAssistant((msg) => {
              const slots = [...msg.slots];
              const idx = slots.findIndex((s) => s.stream_id === ev.stream_id);
              const slot: GenSlot = {
                stream_id: ev.stream_id,
                component: ev.component,
                payload: ev.payload,
                status: ev.type === "ui" ? "final" : "partial",
              };
              if (idx >= 0) slots[idx] = slot;
              else slots.push(slot);
              return { ...msg, slots };
            });
          } else if (ev.type === "suggestions") {
            patchAssistant((msg) => ({ ...msg, suggestions: ev.suggestions.slice(0, 4) }));
          } else if (ev.type === "actions") {
            patchAssistant((msg) => ({ ...msg, actions: ev.actions }));
          } else if (ev.type === "cart_update") {
            onCartUpdate?.(ev.cart as Cart);
          } else if (ev.type === "change_update") {
            onChangeUpdate?.(ev.change);
          } else if (ev.type === "turn_complete" || ev.type === "done") {
            patchAssistant((msg) => ({ ...msg, pending: false }));
            setActivity("");
          } else if (ev.type === "error") {
            patchAssistant((msg) => ({ ...msg, text: ev.message || "Bir hata oluştu.", pending: false }));
            setActivity("");
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n");
          buf = parts.pop() ?? "";
          for (const line of parts) {
            if (line.startsWith("event:")) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
              const raw = line.slice(5).trim();
              if (!raw) continue;
              try {
                const parsed = JSON.parse(raw) as StreamEvent;
                // Some encoders only put type in data; prefer data.type
                handle(parsed.type ? parsed : ({ ...parsed, type: currentEvent } as StreamEvent));
              } catch {
                /* ignore bad chunk */
              }
            } else if (line === "") {
              currentEvent = "";
            }
          }
        }
        patchAssistant((msg) => ({ ...msg, pending: false }));
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
        setMessages((all) => {
          const next = [...all];
          const last = next[next.length - 1];
          if (last?.role === "assistant") {
            next[next.length - 1] = { ...last, text: last.text || "Bağlantı kesildi. Yeniden dene.", pending: false };
          }
          return next;
        });
      } finally {
        setBusy(false);
        setActivity("");
      }
    },
    [busy, endpoint, onCartUpdate, onChangeUpdate],
  );

  return { messages, busy, activity, submit, setMessages };
}
