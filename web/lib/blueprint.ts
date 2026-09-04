/**
 * Re-exports from vendored Anthropic examples/web-shared (PLAN section 15.2).
 * Full StoreShell/Chat/useAgentTurn need shopping_agent SSE + Tailwind tokens;
 * until then the demo keeps Turkish Qante chrome and Option B cart_store,
 * and imports shared pieces where they fit.
 */
export {
  AgentApi,
  type AgentEvent,
  type AgentTurn,
  type ChatItem,
  type Prefill,
  type Profile,
  type Session,
  type StoreView,
  ActivityLine,
  AskLink,
  BagPanel,
  Chat,
  CheckoutButton,
  Greeting,
  HomeSection,
  RemoveLink,
  Starters,
  Stepper,
  StorePage,
  StoreShell,
  Suggestions,
  TotalRow,
  useAgentTurn,
  useCatalogIndex,
  useResource,
  useSession,
  useStoreFrame,
  AssistantPanel,
  AssistantRail,
  PortalShell,
  useMerchantChat,
} from "web-shared";
