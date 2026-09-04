# Vendor wiring (commerce-agents @ fd4d592)

## Vendored paths (unmodified)

Pin: `fd4d59224ab96b43c6dc6888207c67b3bd5a24cf` — same as Shopify `claude-for-commerce-examples`.

| Path | Upstream | Notes |
|---|---|---|
| `vendor/web-shared/` | `examples/web-shared` | npm workspace `web-shared`. Exports `StoreShell`, `Chat`, `useAgentTurn`. |
| `vendor/demo_common/` | `examples/demo_common` | `pip install -e ./vendor` |
| `vendor/skills/shopping/` | `shopping-agent/skills` | Do not edit. |
| `vendor/skills/merchant/` | `merchant-agent/skills` | Do not edit. |

## npm resolution (Shopify pattern)

Root workspaces: `vendor/web-shared`, `web`. `web` depends on `web-shared: *`.
`web/tsconfig.json` paths + `transpilePackages` resolve the package.

Live import: `web/components/BlueprintBridge.tsx` and `web/app/(shop)/layout.tsx` import `StoreShell` / `useAgentTurn`.
Demo UI keeps Qante chrome + `Suggestions` in `ui-shop.tsx`.

## Still needed: shopping_agent / merchant_agent pip pins

Uncomment git pins in root `requirements.txt` at fd4d592 for commerce-common, shopping-agent-core/runtime, merchant-agent-core/runtime, and `-e ./vendor`.

Then: ikas backends, FastAPI hosts via `demo_common`, `AgentApi` SSE (`X-Session-Id`), Tailwind/utilities for StoreShell classes, Option B `cart_store` until `cart_update`.
