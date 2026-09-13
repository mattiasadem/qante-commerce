import { NextResponse } from "next/server";
import { mergeStaged } from "@/lib/core";
import {
  LEDGER, EXTRA,
  cookie, parseLedger, parseExtras, setCookies,
} from "./route-shared";

export async function handlePostChanges(req: Request, slug: string): Promise<Response | null> {
  if (slug !== "merchant/changes") return null;
  const body = (await req.json()) as { id?: string; ids?: string[]; action?: string; reason?: string };
  const ledger = parseLedger(cookie(req, LEDGER));
  const extras = parseExtras(cookie(req, EXTRA));
  const now = new Date().toISOString();

  if (body.action === "approve_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
    const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
    if (!targets.length) return NextResponse.json({ error: "nothing to approve" }, { status: 400 });
    for (const c of targets) ledger[c.id] = { status: "applied", decided_at: now };
    const merged = mergeStaged(ledger, extras);
    const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

  if (body.action === "discard_all") {
    const wanted = Array.isArray(body.ids) ? body.ids.filter((x) => typeof x === "string" && x) : [];
    const note = (body.reason ?? "").trim();
    if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
    const pending = mergeStaged(ledger, extras).filter((c) => c.status === "staged");
    const targets = wanted.length ? pending.filter((c) => wanted.includes(c.id)) : pending;
    if (!targets.length) return NextResponse.json({ error: "nothing to discard" }, { status: 400 });
    for (const c of targets) ledger[c.id] = { status: "discarded", decision_note: note, decided_at: now };
    const merged = mergeStaged(ledger, extras);
    const changes = targets.map((t) => merged.find((c) => c.id === t.id)!).filter(Boolean);
    const res = NextResponse.json({ changes, demo: true, ikas_written: false, count: changes.length });
    return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
  }

  const id = body.id ?? "";
  const current = mergeStaged(ledger, extras).find((c) => c.id === id);
  if (!current) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (body.action === "discard") {
    const note = (body.reason ?? "").trim();
    if (!note) return NextResponse.json({ error: "reason required" }, { status: 400 });
    ledger[id] = { status: "discarded", decision_note: note, decided_at: now };
  } else if (body.action === "approve") {
    ledger[id] = { status: "applied", decided_at: now };
  } else return NextResponse.json({ error: "bad action" }, { status: 400 });
  const change = mergeStaged(ledger, extras).find((c) => c.id === id);
  const res = NextResponse.json({ change, demo: true, ikas_written: false });
  return setCookies(res, [{ name: LEDGER, value: JSON.stringify(ledger) }]);
}
