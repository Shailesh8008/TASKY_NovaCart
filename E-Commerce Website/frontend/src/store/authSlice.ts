import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

type LoginPayload = {
  email: string;
  pass: string;
};

type RegisterPayload = {
  fname: string;
  lname?: string;
  email: string;
  pass1: string;
};

export type AuthUser = {
  id: string;
  name: string;
};

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loginStatus: "idle" | "loading" | "succeeded" | "failed";
  registerStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  loginError: string | null;
  registerError: string | null;
};

const initialState: AuthState = {
  user: null,
  status: "idle",
  loginStatus: "idle",
  registerStatus: "idle",
  error: null,
  loginError: null,
  registerError: null,
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function backendBaseUrl(): string {
  const value = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";
  return value.replace(/\/$/, "");
}

function mapUser(payload: unknown): AuthUser | null {
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  const userRecord = asRecord(root.user) ?? root;

  const id =
    readString(userRecord.id) ??
    readString(userRecord._id) ??
    readString(userRecord.userId) ??
    readString(userRecord.user_id) ??
    "";

  const name =
    readString(userRecord.name) ??
    readString(userRecord.fullName) ??
    readString(userRecord.full_name) ??
    "User";

  if (!id) {
    return null;
  }

  return {
    id,
    name: name || "User",
  };
}

async function requestCurrentUser(): Promise<AuthUser | null> {
  const response = await fetch(`${backendBaseUrl()}/api/auth/user`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user (${response.status})`);
  }

  const payload: unknown = await response.json();
  const root = asRecord(payload);
  if (!root) {
    return null;
  }

  if (root.ok !== true) {
    return null;
  }

  return mapUser(payload);
}

export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async () => requestCurrentUser(),
);

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (payload: LoginPayload) => {
    const response = await fetch(`${backendBaseUrl()}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data: unknown = await response.json();
    const root = asRecord(data);
    const message = readString(root?.message);
    if (!response.ok) {
      throw new Error(message ?? `Login request failed (${response.status})`);
    }

    if (!root || root.ok !== true) {
      throw new Error(message ?? "Invalid email or password.");
    }

    const user = mapUser(data) ?? (await requestCurrentUser());
    if (!user) {
      throw new Error("Login succeeded but user session was not found.");
    }
    return user;
  },
);

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (payload: RegisterPayload) => {
    const response = await fetch(`${backendBaseUrl()}/api/reg`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data: unknown = await response.json();
    const root = asRecord(data);
    const message = readString(root?.message);

    if (!response.ok) {
      throw new Error(message ?? `Registration request failed (${response.status})`);
    }

    if (!root || root.ok !== true) {
      throw new Error(message ?? "Registration failed.");
    }

    return message ?? "User registered successfully";
  },
);

export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  const response = await fetch(`${backendBaseUrl()}/api/logout`, {
    method: "DELETE",
    credentials: "include",
  });

  const data: unknown = await response.json();
  const root = asRecord(data);
  const message = readString(root?.message);

  if (!response.ok) {
    throw new Error(message ?? `Logout request failed (${response.status})`);
  }

  if (!root || root.ok !== true) {
    throw new Error(message ?? "Logout failed.");
  }

  return message ?? "Successfully Logout";
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? "Unable to fetch user.";
      })
      .addCase(loginUser.pending, (state) => {
        state.loginStatus = "loading";
        state.loginError = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loginStatus = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loginStatus = "failed";
        state.loginError = action.error.message ?? "Login failed.";
      })
      .addCase(registerUser.pending, (state) => {
        state.registerStatus = "loading";
        state.registerError = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.registerStatus = "succeeded";
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.registerStatus = "failed";
        state.registerError = action.error.message ?? "Registration failed.";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loginStatus = "idle";
        state.loginError = null;
      });
  },
});

export default authSlice.reducer;
