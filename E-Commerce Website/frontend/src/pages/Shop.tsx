import { useMemo, useState } from "react";
import { useAppSelector } from "../store/hooks";

export default function Shop() {
  const products = useAppSelector((state) => state.products.items);
  const status = useAppSelector((state) => state.products.status);
  const error = useAppSelector((state) => state.products.error);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.status).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        term.length === 0 ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.status.toLowerCase().includes(term);
      const matchesCategory =
        selectedCategory === "all" || product.category === selectedCategory;
      const matchesStatus =
        selectedStatus === "all" || product.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, selectedCategory, selectedStatus]);

  const isLoading = status === "idle" || status === "loading";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Shop Products</h1>
        <p className="mt-2 text-amber-50">
          Browse all products, search quickly, and filter by category or status.
        </p>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, category, or status"
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(event) => setSelectedStatus(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-900"
          >
            <option value="all">All statuses</option>
            {statuses.map((entry) => (
              <option key={entry} value={entry}>
                {entry}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading && <p className="mt-6 text-sm text-slate-500">Loading products...</p>}
      {error && !isLoading && <p className="mt-6 text-sm text-red-600">{error}</p>}

      {!isLoading && !error && (
        <section className="mt-6">
          <p className="mb-4 text-sm text-slate-600">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-600">
              No products match your search/filter.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm group"
                >
                  <div className="h-40 overflow-hidden rounded-xl group-hover:scale-110 transition-all">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900">{product.name}</h3>
                  <p className="mt-1 text-sm text-slate-600">{product.price}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                      {product.category}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800">
                      {product.status}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
