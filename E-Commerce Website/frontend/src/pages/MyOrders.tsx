import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

type OrderRecord = {
  id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  status: string;
  createdAt: string;
  purchasedItems: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
  }[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  return value as Record<string, unknown>;
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export default function MyOrders() {
  const user = useAppSelector((state) => state.auth.user);
  const [status, setStatus] = useState<
    "idle" | "loading" | "succeeded" | "failed"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);

  const backendUrl =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)
      ?.trim()
      .replace(/\/$/, "") ?? "";

  useEffect(() => {
    const fetchOrders = async () => {
      if (!backendUrl) {
        setError("Backend URL is missing.");
        setStatus("failed");
        return;
      }
      if (!user) {
        setOrders([]);
        setStatus("succeeded");
        return;
      }

      setStatus("loading");
      setError(null);
      try {
        const response = await fetch(`${backendUrl}/api/myorders`, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch orders (${response.status})`);
        }

        const payload: unknown = await response.json();
        const root = asRecord(payload);
        if (!root || root.ok !== true) {
          throw new Error(
            typeof root?.message === "string"
              ? root.message
              : "Unable to fetch orders.",
          );
        }

        const rows = Array.isArray(root.data) ? root.data : [];
        const mapped = rows
          .map((row) => {
            const record = asRecord(row);
            if (!record) {
              return null;
            }
            return {
              id: readString(record._id) || readString(record.orderId),
              orderId: readString(record.orderId),
              paymentId: readString(record.paymentId),
              amount: readNumber(record.amount),
              status: readString(record.status) || "pending",
              createdAt: readString(record.createdAt),
              purchasedItems: Array.isArray(record.purchasedItems)
                ? record.purchasedItems
                    .map((entry) => {
                      const item = asRecord(entry);
                      if (!item) {
                        return null;
                      }
                      const productId = readString(item.productId);
                      if (!productId) {
                        return null;
                      }
                      return {
                        productId,
                        name: readString(item.name) || "Product",
                        price: readNumber(item.price),
                        quantity: Math.max(
                          1,
                          Math.floor(readNumber(item.quantity) || 1),
                        ),
                        imageUrl: readString(item.imageUrl) || null,
                      };
                    })
                    .filter(
                      (entry): entry is OrderRecord["purchasedItems"][number] =>
                        entry !== null,
                    )
                : [],
            };
          })
          .filter((entry): entry is OrderRecord => entry !== null)
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          });

        setOrders(mapped);
        setStatus("succeeded");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStatus("failed");
      }
    };

    void fetchOrders();
  }, [backendUrl, user]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);

  const totalPaid = useMemo(
    () => orders.reduce((sum, order) => sum + order.amount, 0),
    [orders],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-12 pt-8 sm:px-6 lg:px-8">
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-700 to-slate-600 px-6 py-10 text-white sm:px-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          My Orders
        </h1>
        <p className="mt-2 text-slate-200">
          Track your latest payments and purchase history.
        </p>
      </section>

      {!user ? (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">Please login to view your orders.</p>
          <Link
            to="/"
            className="mt-4 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Go to home
          </Link>
        </section>
      ) : (
        <section className="mt-8 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
            <p className="text-sm text-slate-600">
              Total orders:{" "}
              <span className="font-semibold text-slate-900">
                {orders.length}
              </span>
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Total paid:{" "}
              <span className="font-semibold text-slate-900">
                {formatCurrency(totalPaid)}
              </span>
            </p>
          </div>

          {status === "loading" && (
            <p className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
              Loading orders...
            </p>
          )}

          {status === "failed" && error && (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
              {error}
            </p>
          )}

          {status === "succeeded" && orders.length === 0 && (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
              No orders found yet.
            </p>
          )}

          {status === "succeeded" && orders.length > 0 && (
            <div className="space-y-3">
              {orders.map((order) => (
                <article
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Order ID
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-900">
                        {order.orderId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Payment ID
                      </p>
                      <p className="mt-1 break-all text-sm font-medium text-slate-900">
                        {order.paymentId || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {formatCurrency(order.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </p>
                      <p className="mt-1 text-sm font-semibold capitalize text-emerald-700">
                        {order.status}
                      </p>
                    </div>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                  </p>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Purchased Products ({order.purchasedItems.length})
                    </p>
                    {order.purchasedItems.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        Product details not available for this order.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {order.purchasedItems.map((item) => (
                          <div
                            key={`${order.id}-${item.productId}`}
                            className="flex items-center gap-3 rounded-lg bg-white p-2"
                          >
                            <div className="h-w-20 w-20 shrink-0 overflow-hidden rounded-md">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="h-full w-full object-contain"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-slate-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-slate-600">
                                Qty: {item.quantity} |{" "}
                                {formatCurrency(item.price)} each
                              </p>
                            </div>
                            <p className="text-sm font-bold text-green-600">
                              {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
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
