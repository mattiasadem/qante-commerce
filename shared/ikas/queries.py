"""Every GraphQL document sent to ikas lives in this module.

Candidate operation names come from docs/PLAN.md section 4.3. Field selections
are intentionally empty beyond __typename until the playground confirms the
schema. See docs/IKAS_API_NOTES.md. Do not inline query strings elsewhere.
"""

# UNVERIFIED: confirm listProduct vs listProducts (IKAS_API_NOTES Q-schema).
LIST_PRODUCT = """
query ListProduct {
  listProduct {
    __typename
  }
}
"""

# UNVERIFIED: confirm listCategory (IKAS_API_NOTES Q-schema).
LIST_CATEGORY = """
query ListCategory {
  listCategory {
    __typename
  }
}
"""

# UNVERIFIED: stock may live on the product node instead (IKAS_API_NOTES Q-schema).
LIST_PRODUCT_STOCK_LOCATIONS = """
query ListProductStockLocations {
  listProductStockLocations {
    __typename
  }
}
"""

# UNVERIFIED: confirm listOrder (IKAS_API_NOTES Q-schema).
LIST_ORDER = """
query ListOrder {
  listOrder {
    __typename
  }
}
"""

# UNVERIFIED: confirm listCustomer (IKAS_API_NOTES Q-schema).
LIST_CUSTOMER = """
query ListCustomer {
  listCustomer {
    __typename
  }
}
"""

# UNVERIFIED: mutation name saveProduct (IKAS_API_NOTES Q-schema). F2 only.
SAVE_PRODUCT = """
mutation SaveProduct {
  saveProduct {
    __typename
  }
}
"""

# UNVERIFIED: stock mutation name (IKAS_API_NOTES Q-schema). F2 only.
SAVE_PRODUCT_STOCK_LOCATIONS = """
mutation SaveProductStockLocations {
  saveProductStockLocations {
    __typename
  }
}
"""

# UNVERIFIED: webhook registration (IKAS_API_NOTES Q-schema).
SAVE_WEBHOOK = """
mutation SaveWebhook {
  saveWebhook {
    __typename
  }
}
"""

# Promotion/campaign object: open question Q3. No document until confirmed.
