/* eslint-disable react-refresh/only-export-components */
import {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type AuthUser = Record<string, unknown>;

type AuthContextValue = {
  user: AuthUser | null;
  setUser: Dispatch<SetStateAction<AuthUser | null>>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const authStorageKey = "tasky-auth-user";
const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(authStorageKey);
  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AuthUser;
  } catch {
    window.localStorage.removeItem(authStorageKey);
    return null;
  }
};

const toAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  return value as AuthUser;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [loading, setLoading] = useState(true);

  const setPersistedUser: Dispatch<SetStateAction<AuthUser | null>> =
    useCallback((value) => {
      setUser((currentUser) => {
        const resolvedValue =
          typeof value === "function"
            ? (value as (prevState: AuthUser | null) => AuthUser | null)(
                currentUser,
              )
            : value;

        if (typeof window !== "undefined") {
          if (resolvedValue) {
            window.localStorage.setItem(
              authStorageKey,
              JSON.stringify(resolvedValue),
            );
          } else {
            window.localStorage.removeItem(authStorageKey);
          }
        }

        return resolvedValue;
      });
    }, []);

  useEffect(() => {
    let cancelled = false;

    const validateUser = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/user`, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to validate user");
        }

        const data = (await response.json()) as unknown;
        const nextUser =
          data && typeof data === "object" && "user" in data
            ? toAuthUser((data as { user?: unknown }).user)
            : toAuthUser(data);

        if (!cancelled) {
          setPersistedUser(nextUser ?? null);
        }
      } catch {
        if (!cancelled) {
          setPersistedUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    validateUser();
    return () => {
      cancelled = true;
    };
  }, [setPersistedUser]);

  const value = useMemo(
    () => ({
      user,
      setUser: setPersistedUser,
      loading,
    }),
    [user, loading, setPersistedUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
