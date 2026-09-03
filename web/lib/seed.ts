import type { Order, Product } from "@/lib/types";
import raw from "@/data/seed.json";

type SeedFile = {
  store: { name: string; currency: string; timezone: string };
  products: Product[];
  orders: Order[];
};

const seed = raw as SeedFile;

export function getProducts(): Product[] {
  return seed.products;
}

export function getProduct(id: string): Product | undefined {
  return seed.products.find((p) => p.id === id);
}

export function getOrders(): Order[] {
  return seed.orders;
}

export function getStore() {
  return seed.store;
}
