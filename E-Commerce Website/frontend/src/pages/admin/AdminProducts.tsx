import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";

type ProductRecord = {
  id: string;
  pname: string;
  price: number;
  category: string;
  status: string;
  pimage: string;
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

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [form, setForm] = useState({
    pname: "",
    price: "",
    category: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editForm, setEditForm] = useState({
    pname: "",
    price: "",
    category: "",
    status: "In Stock",
  });

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendBaseUrl()}/api/getproducts`);
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      const rows = Array.isArray(root?.data) ? root.data : [];
      setProducts(
        rows
          .map((entry) => {
            const rec = asRecord(entry);
            if (!rec) {
              return null;
            }
            return {
              id: typeof rec._id === "string" ? rec._id : "",
              pname: typeof rec.pname === "string" ? rec.pname : "",
              price: typeof rec.price === "number" ? rec.price : 0,
              category: typeof rec.category === "string" ? rec.category : "",
              status: typeof rec.status === "string" ? rec.status : "",
              pimage: typeof rec.pimage === "string" ? rec.pimage : "",
            };
          })
          .filter((entry): entry is ProductRecord => entry !== null),
      );
    } catch (_error) {
      toast.error("Unable to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const handleAdd = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.pname.trim() || !form.price.trim() || !form.category.trim() || !file) {
      toast.error("All fields are required");
      return;
    }

    setSubmitting(true);
    try {
      const body = new FormData();
      body.append("pname", form.pname.trim());
      body.append("price", form.price.trim());
      body.append("category", form.category.trim());
      body.append("pimage", file);

      const response = await fetch(`${backendBaseUrl()}/api/addproduct`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to add product");
        return;
      }

      toast.success(typeof root.message === "string" ? root.message : "Product added");
      setForm({ pname: "", price: "", category: "" });
      setFile(null);
      await loadProducts();
    } catch (_error) {
      toast.error("Unable to add product");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (product: ProductRecord) => {
    setEditingId(product.id);
    setEditFile(null);
    setEditForm({
      pname: product.pname,
      price: String(product.price),
      category: product.category,
      status: product.status || "In Stock",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditFile(null);
    setEditForm({
      pname: "",
      price: "",
      category: "",
      status: "In Stock",
    });
  };

  const handleSaveEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingId) {
      return;
    }
    if (!editForm.pname.trim() || !editForm.price.trim() || !editForm.category.trim() || !editForm.status.trim()) {
      toast.error("All fields are required");
      return;
    }

    setSavingEdit(true);
    try {
      const body = new FormData();
      body.append("pname", editForm.pname.trim());
      body.append("price", String(Number(editForm.price)));
      body.append("category", editForm.category.trim());
      body.append("status", editForm.status);
      if (editFile) {
        body.append("pimage", editFile);
      }

      const response = await fetch(`${backendBaseUrl()}/api/editproduct/${editingId}`, {
        method: "POST",
        credentials: "include",
        body,
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to update product");
        return;
      }

      toast.success(typeof root.message === "string" ? root.message : "Updated Successfully");
      cancelEdit();
      await loadProducts();
    } catch (_error) {
      toast.error("Unable to update product");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (pid: string) => {
    try {
      const response = await fetch(`${backendBaseUrl()}/api/deleteproduct/${pid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to delete product");
        return;
      }
      toast.success("Product deleted");
      await loadProducts();
    } catch (_error) {
      toast.error("Unable to delete product");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Manage Products</h2>
      <p className="mt-1 text-sm text-slate-600">Add new items and manage current inventory.</p>

      <form onSubmit={handleAdd} className="mt-5 grid gap-3 rounded-2xl border border-slate-200 p-4 sm:grid-cols-2">
        <input
          type="text"
          placeholder="Product name"
          value={form.pname}
          onChange={(e) => setForm((prev) => ({ ...prev, pname: e.target.value }))}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <input
          type="number"
          min="1"
          step="0.01"
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <input
          type="text"
          placeholder="Category"
          value={form.category}
          onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white"
        />
        <button
          type="submit"
          disabled={submitting}
          className="sm:col-span-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Adding..." : "Add Product"}
        </button>
      </form>

      {editingId && (
        <form
          onSubmit={handleSaveEdit}
          className="mt-5 grid gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:grid-cols-2"
        >
          <input
            type="text"
            placeholder="Product name"
            value={editForm.pname}
            onChange={(e) => setEditForm((prev) => ({ ...prev, pname: e.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            type="number"
            min="1"
            step="0.01"
            placeholder="Price"
            value={editForm.price}
            onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <input
            type="text"
            placeholder="Category"
            value={editForm.category}
            onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          />
          <select
            value={editForm.status}
            onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
          >
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-white"
          />
          <div className="sm:col-span-2 flex gap-2">
            <button
              type="submit"
              disabled={savingEdit}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {savingEdit ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading products...</p>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Category</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-t border-slate-200">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="h-9 w-9 overflow-hidden rounded bg-slate-100">
                        {product.pimage ? (
                          <img src={product.pimage} alt={product.pname} className="h-full w-full object-contain" />
                        ) : null}
                      </div>
                      <span>{product.pname}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2">₹{product.price}</td>
                  <td className="px-3 py-2">{product.category}</td>
                  <td className="px-3 py-2">{product.status}</td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="mr-2 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(product.id)}
                      className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
