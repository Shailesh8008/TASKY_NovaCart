import { useEffect, useMemo, useState } from "react";

type ProductRecord = {
  id: string;
  status: string;
};

type QueryRecord = {
  id: string;
  status: string;
};

function backendBaseUrl(): string {
  const value = (import.meta.env.VITE_BACKEND_URL as string | undefined)?.trim() ?? "";
  return value.replace(/\/$/, "");
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

export default function AdminOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [queries, setQueries] = useState<QueryRecord[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const [productsRes, queriesRes] = await Promise.all([
          fetch(`${backendBaseUrl()}/api/getproducts`),
          fetch(`${backendBaseUrl()}/api/getqueries`),
        ]);

        if (!productsRes.ok || !queriesRes.ok) {
          throw new Error("Failed to load admin stats.");
        }

        const productsPayload: unknown = await productsRes.json();
        const queriesPayload: unknown = await queriesRes.json();
        const productsRoot = asRecord(productsPayload);
        const queriesRoot = asRecord(queriesPayload);

        const productRows = Array.isArray(productsRoot?.data) ? productsRoot.data : [];
        const queryRows = Array.isArray(queriesRoot?.data) ? queriesRoot.data : [];

        setProducts(
          productRows
            .map((entry) => {
              const rec = asRecord(entry);
              if (!rec) {
                return null;
              }
              return {
                id: typeof rec._id === "string" ? rec._id : "",
                status: typeof rec.status === "string" ? rec.status : "Unknown",
              };
            })
            .filter((entry): entry is ProductRecord => entry !== null),
        );

        setQueries(
          queryRows
            .map((entry) => {
              const rec = asRecord(entry);
              if (!rec) {
                return null;
              }
              return {
                id: typeof rec._id === "string" ? rec._id : "",
                status: typeof rec.status === "string" ? rec.status : "Pending",
              };
            })
            .filter((entry): entry is QueryRecord => entry !== null),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    void loadStats();
  }, []);

  const inStock = useMemo(
    () => products.filter((product) => product.status.toLowerCase() === "in stock").length,
    [products],
  );
  const outOfStock = products.length - inStock;
  const repliedQueries = useMemo(
    () => queries.filter((query) => query.status.toLowerCase() === "replied").length,
    [queries],
  );

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
      <p className="mt-1 text-sm text-slate-600">
        Overview of products and customer queries.
      </p>

      {loading && <p className="mt-6 text-sm text-slate-600">Loading stats...</p>}
      {error && <p className="mt-6 text-sm text-rose-700">{error}</p>}

      {!loading && !error && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Products</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{products.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">In Stock</p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">{inStock}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Out of Stock</p>
            <p className="mt-2 text-2xl font-bold text-amber-700">{outOfStock}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Queries Replied</p>
            <p className="mt-2 text-2xl font-bold text-sky-700">
              {repliedQueries}/{queries.length}
            </p>
          </article>
        </div>
      )}
    </div>
  );
}
