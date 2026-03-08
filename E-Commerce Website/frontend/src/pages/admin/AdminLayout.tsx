import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../../store/authSlice";
import { useAppDispatch } from "../../store/hooks";

function backendBaseUrl(): string {
  const value = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";
  return value.replace(/\/$/, "");
}

export default function AdminLayout() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "authorized" | "unauthorized">("loading");
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const response = await fetch(`${backendBaseUrl()}/api/checkadmin`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          setStatus("unauthorized");
          return;
        }

        const payload: unknown = await response.json();
        const root =
          typeof payload === "object" && payload !== null
            ? (payload as Record<string, unknown>)
            : null;
        setStatus(root?.ok === true ? "authorized" : "unauthorized");
      } catch (_error) {
        setStatus("unauthorized");
      }
    };

    void verifyAdmin();
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      const message = await dispatch(logoutUser()).unwrap();
      toast.success(message);
      navigate("/", { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Logout failed";
      toast.error(message);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">Loading admin panel...</p>
      </div>
    );
  }

  if (status === "unauthorized") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center">
          <h1 className="text-xl font-bold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-600">
            You are not authorized to access this panel.
          </p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 p-4 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4">
          <h1 className="text-lg font-bold tracking-tight">Admin Panel</h1>
          <nav className="mt-4 grid gap-2">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/queries"
              className={({ isActive }) =>
                `rounded-xl px-3 py-2 text-sm font-medium ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              Queries
            </NavLink>
          </nav>

          <div className="mt-6 grid gap-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
            <Link
              to="/"
              className="rounded-full border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              View Store
            </Link>
          </div>
        </aside>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
