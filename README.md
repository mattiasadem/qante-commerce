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

Demo CTAs: `POST /api/cart` with `action=checkout`; `POST /api/merchant/changes` with `approve` or `discard`. Vercel file deploys of this tree return 403 on update, so GitHub is the source of truth.

## Python host

Use a virtualenv. Install both requirements files.
Merchant API on port 8005 with local store enabled.
Storefront API on port 8004.
Run the linter, then the test suite. Details: docs/PLAN.md section 11.

Blueprint packages are not vendored. See comments in `requirements.txt`.

## Layout

- `web/` Next.js demo (one Hobby app)
- `storefront/api/` shopping host
- `merchant/api/` merchant host
- `shared/ikas/` GraphQL transport
- `merchant/data/seed.json` catalog
- `docs/` PLAN, ADR-001, SAFETY, ikas questions

## Rules

User-facing copy is Turkish. Identifiers, comments, and commits are English.
Ikas writes stay off by default.
When an ikas field name is uncertain, add a question in `docs/IKAS_API_NOTES.md`.
