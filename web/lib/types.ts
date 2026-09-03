export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  compare_at: number | null;
  stock: number;
  sku: string;
  description: string;
  image: string;
  tags: string[];
};

export type OrderItem = {
  product_id: string;
  qty: number;
  price: number;
};

export type Order = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  items: OrderItem[];
};

export type CartLine = {
  product_id: string;
  qty: number;
  product: Product | null;
  line_total: number;
};

export type Cart = {
  items: CartLine[];
  subtotal: number;
  currency: string;
};

export type Brand = {
  name: string;
  assistant_name: string;
  voice: string;
  tokens: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    accent: string;
    radius: string;
    grain: string;
  };
  logo: { kind: string };
};

export type Snapshot = {
  period_start: string;
  period_end: string;
  period_days: number;
  revenue: number;
  order_count: number;
  aov: number;
  cancel_rate: number;
  refund_rate: number;
  revenue_delta_pct: number;
  order_delta_pct: number;
  aov_delta_pct: number;
};

export type Alert = {
  kind: string;
  product_id: string;
  product_name: string;
  stock: number;
  days_cover: number | null;
  days_without_sale: number | null;
  message: string;
};

export type Issue = {
  kind: string;
  order_id: string;
  status: string;
  age_hours: number;
  total: number;
  message: string;
};

export type ChatResponse = {
  text: string;
  ui: { type: string; products?: Product[] }[];
  suggestions: string[];
};
