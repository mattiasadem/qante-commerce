# Qante Commerce Agents

Claude-based shopping + merchant agents on ikas, for Qante (Nivorius GmbH).

Source of truth: [docs/PLAN.md](docs/PLAN.md).

The Vercel-facing demo lives in `web/` (Next.js App Router). Set Root Directory to `web`.
This repo is not the separate Qante inventory viewer.

## Demo

Work inside `web/`. Install Node packages, then start the Next.js dev server.
Routes: `/` storefront, `/urun/[id]` product, `/sepet` cart,
`/merchant` Ozet, `/merchant/sohbet` chat, `/merchant/bekleyen` queue.

The demo does not call a model API and does not call ikas.
Numbers come from `merchant/data/seed.json` (mirrored at `web/data/seed.json`).

## Python host

Use a virtualenv. Install both requirements files.
Merchant API on port 8005 with local store enabled.
Storefront API on port 8004.
Run the linter, then the test suite. Details: docs/PLAN.md section 11.

Blueprint example scaffolding lives in `vendor/` (web-shared, demo_common, skills) from anthropics/commerce-agents@fd4d592. Core agent packages stay git-pinned in `requirements.txt` comments until F1+ install. The demo `web/` imports Suggestions from web-shared; full StoreShell/Chat/useAgentTurn wait on shopping_agent SSE.

## Layout

- `web/` Next.js demo (one Hobby app)
- `storefront/api/` shopping host
- `merchant/api/` merchant host
- `shared/ikas/` GraphQL transport
- `merchant/data/seed.json` catalog
- `docs/` PLAN, ADR-001, SAFETY, ikas questions
- `vendor/` Anthropic examples scaffolding (do not edit)

## Rules

User-facing copy is Turkish. Identifiers, comments, and commits are English.
Ikas writes stay off by default.
When an ikas field name is uncertain, add a question in `docs/IKAS_API_NOTES.md`.
