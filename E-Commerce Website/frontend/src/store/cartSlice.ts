import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { AnyAction } from "redux";
import type { ThunkAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type AddToCartPayload = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

type CartState = {
  items: CartItem[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: CartState = {
  items: [],
  status: "idle",
  error: null,
};

type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

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

function backendBaseUrl(): string {
  const value =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";
  return value.replace(/\/$/, "");
}

function normalizeCartItem(raw: unknown): CartItem | null {
  const row = asRecord(raw);
  if (!row) {
    return null;
  }

  const id =
    readString(row.id) ??
    readString(row._id) ??
    readString(row.productId) ??
    readString(row.product_id);
  const name =
    readString(row.name) ??
    readString(row.pname) ??
    readString(row.title) ??
    "Product";
  const imageUrl =
    readString(row.imageUrl) ??
    readString(row.image) ??
    readString(row.pimage) ??
    null;
  const rawPrice = row.price;
  const rawQty = row.quantity;

  const price =
    typeof rawPrice === "number" && Number.isFinite(rawPrice) ? rawPrice : 0;
  const quantity =
    typeof rawQty === "number" && Number.isFinite(rawQty) && rawQty > 0
      ? Math.floor(rawQty)
      : 1;

  if (!id) {
    return null;
  }

  return {
    id,
    name,
    price,
    imageUrl,
    quantity,
  };
}

export const fetchUserCart = createAsyncThunk("cart/fetchUserCart", async () => {
  const response = await fetch(`${backendBaseUrl()}/api/fetchcart`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cart (${response.status})`);
  }

  const payload: unknown = await response.json();
  const root = asRecord(payload);
  if (!root || root.ok !== true) {
    return [] as CartItem[];
  }

  const data = asRecord(root.data);
  const items = data?.CartItems;
  if (!Array.isArray(items)) {
    return [] as CartItem[];
  }

  return items
    .map((entry) => normalizeCartItem(entry))
    .filter((entry): entry is CartItem => entry !== null);
});

export const saveUserCart = createAsyncThunk(
  "cart/saveUserCart",
  async (items: CartItem[]) => {
    const response = await fetch(`${backendBaseUrl()}/api/savecart`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ cartData: items }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save cart (${response.status})`);
    }

    const payload: unknown = await response.json();
    const root = asRecord(payload);
    if (!root || root.ok !== true) {
      throw new Error(readString(root?.message) ?? "Failed to save cart.");
    }
  },
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartLocal: (state, action: PayloadAction<AddToCartPayload>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
        return;
      }

      state.items.push({ ...action.payload, quantity: 1 });
    },
    removeFromCartLocal: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
    incrementQuantityLocal: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (item) {
        item.quantity += 1;
      }
    },
    decrementQuantityLocal: (state, action: PayloadAction<string>) => {
      const item = state.items.find((entry) => entry.id === action.payload);
      if (!item) {
        return;
      }
      if (item.quantity <= 1) {
        state.items = state.items.filter((entry) => entry.id !== action.payload);
        return;
      }
      item.quantity -= 1;
    },
    clearCartLocal: (state) => {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCart.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchUserCart.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUserCart.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to fetch cart.";
      })
      .addCase(saveUserCart.rejected, (state, action) => {
        state.error = action.error.message ?? "Unable to sync cart.";
      });
  },
});

const {
  addToCartLocal,
  removeFromCartLocal,
  incrementQuantityLocal,
  decrementQuantityLocal,
  clearCartLocal,
} = cartSlice.actions;

const syncCartIfLoggedIn = (
  dispatch: (action: unknown) => unknown,
  getState: () => RootState,
) => {
  const state = getState();
  if (!state.auth.user) {
    return;
  }
  void dispatch(saveUserCart(state.cart.items));
};

export const addToCart =
  (payload: AddToCartPayload): AppThunk =>
  (dispatch, getState) => {
    dispatch(addToCartLocal(payload));
    syncCartIfLoggedIn(dispatch, getState);
  };

export const removeFromCart =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(removeFromCartLocal(id));
    syncCartIfLoggedIn(dispatch, getState);
  };

export const incrementQuantity =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(incrementQuantityLocal(id));
    syncCartIfLoggedIn(dispatch, getState);
  };

export const decrementQuantity =
  (id: string): AppThunk =>
  (dispatch, getState) => {
    dispatch(decrementQuantityLocal(id));
    syncCartIfLoggedIn(dispatch, getState);
  };

export const clearCart =
  (): AppThunk =>
  (dispatch, getState) => {
    dispatch(clearCartLocal());
    syncCartIfLoggedIn(dispatch, getState);
  };

export default cartSlice.reducer;
