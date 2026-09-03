"""Domain models used by the local store and (later) ikas response mapping.

Ikas field names are not assumed here. Mapping from Admin API payloads lands
in F1 after playground verification (docs/IKAS_API_NOTES.md).
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class Variant(BaseModel):
    id: str
    sku: str
    price: float
    stock: int
    name: str | None = None


class Product(BaseModel):
    id: str
    name: str
    category: str
    price: float
    stock: int
    sku: str
    description: str = ""
    image: str = ""
    tags: list[str] = Field(default_factory=list)
    compare_at: float | None = None
    variants: list[Variant] = Field(default_factory=list)


class OrderItem(BaseModel):
    product_id: str
    qty: int
    price: float


class Order(BaseModel):
    id: str
    created_at: str
    status: str
    total: float
    items: list[OrderItem] = Field(default_factory=list)


class StoreContext(BaseModel):
    name: str = "Qante"
    currency: str = "TRY"
    timezone: str = "Europe/Istanbul"
