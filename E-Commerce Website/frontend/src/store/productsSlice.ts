import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export type Product = {
  id: string;
  name: string;
  price: string;
  priceValue: number | null;
  imageUrl: string | null;
  tag: string;
  category: string;
  status: string;
};

type ProductsState = {
  items: Product[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ProductsState = {
  items: [],
  status: "idle",
  error: null,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function formatPrice(value: unknown): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `$${value}`;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }
  return "Price unavailable";
}

function parsePriceValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const numeric = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(numeric) ? numeric : null;
  }
  return null;
}

function extractProductArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  const body = asRecord(payload);
  if (!body) {
    return [];
  }

  const keys = ["products", "data", "result", "items"];
  for (const key of keys) {
    const candidate = body[key];
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

function normalizeProduct(raw: unknown, index: number): Product | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }

  const name =
    readString(row.pname) ??
    readString(row.name) ??
    readString(row.title) ??
    readString(row.productName) ??
    readString(row.product_name);

  if (!name) {
    return null;
  }

  const rawId =
    readString(row.id) ??
    readString(row._id) ??
    readString(row.productId) ??
    readString(row.product_id);

  const imageUrl =
    readString(row.pimage) ??
    readString(row.image) ??
    readString(row.imageUrl) ??
    readString(row.image_url) ??
    readString(row.thumbnail);

  const tag =
    readString(row.category) ??
    readString(row.status) ??
    readString(row.tag) ??
    readString(row.brand) ??
    "Featured";

  const category = readString(row.category) ?? "Uncategorized";
  const status = readString(row.status) ?? "Unknown";
  const rawPrice = row.price ?? row.cost ?? row.amount;

  return {
    id: rawId ?? `${name}-${index}`,
    name,
    price: formatPrice(rawPrice),
    priceValue: parsePriceValue(rawPrice),
    imageUrl,
    tag,
    category,
    status,
  };
}

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const backendUrl =
      (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";
    const endpoint = `${backendUrl.replace(/\/$/, "")}/api/products`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Failed to fetch products (${response.status})`);
    }

    const payload: unknown = await response.json();
    const rows = extractProductArray(payload);
    return rows
      .map((row, index) => normalizeProduct(row, index))
      .filter((product): product is Product => product !== null);
  },
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to load products.";
      });
  },
});

export default productsSlice.reducer;
