import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type QueryRecord = {
  id: string;
  username: string;
  email: string;
  query: string;
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

export default function AdminQueries() {
  const [queries, setQueries] = useState<QueryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyForm, setReplyForm] = useState({
    to: "",
    sub: "",
    reply: "",
  });

  const loadQueries = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendBaseUrl()}/api/getqueries`);
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      const rows = Array.isArray(root?.data) ? root.data : [];
      setQueries(
        rows
          .map((entry) => {
            const rec = asRecord(entry);
            if (!rec) {
              return null;
            }
            return {
              id: typeof rec._id === "string" ? rec._id : "",
              username: typeof rec.username === "string" ? rec.username : "",
              email: typeof rec.email === "string" ? rec.email : "",
              query: typeof rec.query === "string" ? rec.query : "",
              status: typeof rec.status === "string" ? rec.status : "Pending",
            };
          })
          .filter((entry): entry is QueryRecord => entry !== null),
      );
    } catch (_error) {
      toast.error("Unable to fetch queries");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadQueries();
  }, []);

  const markAsSeen = async (qid: string) => {
    try {
      const response = await fetch(`${backendBaseUrl()}/api/updatestatus/${qid}`, {
        method: "GET",
        credentials: "include",
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to update status");
        return;
      }
      toast.success("Status updated");
      await loadQueries();
    } catch (_error) {
      toast.error("Unable to update status");
    }
  };

  const deleteQuery = async (qid: string) => {
    try {
      const response = await fetch(`${backendBaseUrl()}/api/deletequery/${qid}`, {
        method: "DELETE",
        credentials: "include",
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to delete query");
        return;
      }
      toast.success("Query deleted");
      await loadQueries();
    } catch (_error) {
      toast.error("Unable to delete query");
    }
  };

  const openReply = (query: QueryRecord) => {
    setReplyingId(query.id);
    setReplyForm({
      to: query.email,
      sub: "Regarding your support query",
      reply: "",
    });
  };

  const closeReply = () => {
    setReplyingId(null);
    setReplyForm({
      to: "",
      sub: "",
      reply: "",
    });
  };

  const sendReply = async (qid: string) => {
    if (isSendingReply) {
      return;
    }
    if (!replyForm.to.trim() || !replyForm.sub.trim() || !replyForm.reply.trim()) {
      toast.error("All reply fields are required");
      return;
    }

    setIsSendingReply(true);
    try {
      const response = await fetch(`${backendBaseUrl()}/api/queryreply/${qid}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: replyForm.to.trim(),
          sub: replyForm.sub.trim(),
          reply: replyForm.reply.trim(),
        }),
      });
      const payload: unknown = await response.json();
      const root = asRecord(payload);
      if (!response.ok || !root || root.ok !== true) {
        toast.error(typeof root?.message === "string" ? root.message : "Unable to send reply");
        return;
      }

      toast.success(typeof root.message === "string" ? root.message : "Reply sent");
      closeReply();
      await loadQueries();
    } catch (_error) {
      toast.error("Unable to send reply");
    } finally {
      setIsSendingReply(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">Customer Queries</h2>
      <p className="mt-1 text-sm text-slate-600">Review, update, and remove support queries.</p>

      {loading ? (
        <p className="mt-5 text-sm text-slate-600">Loading queries...</p>
      ) : queries.length === 0 ? (
        <p className="mt-5 text-sm text-slate-600">No queries found.</p>
      ) : (
        <div className="mt-5 space-y-3">
          {queries.map((query) => (
            <article key={query.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{query.username}</p>
                <span className="text-xs text-slate-500">({query.email})</span>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                  {query.status}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-700">{query.query}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => void markAsSeen(query.id)}
                  className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                >
                  Mark Seen
                </button>
                <button
                  type="button"
                  onClick={() => openReply(query)}
                  className="rounded-full bg-sky-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-sky-700"
                >
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => void deleteQuery(query.id)}
                  className="rounded-full bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                >
                  Delete
                </button>
              </div>

              {replyingId === query.id && (
                <div className="mt-4 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <input
                    type="email"
                    value={replyForm.to}
                    onChange={(e) => setReplyForm((prev) => ({ ...prev, to: e.target.value }))}
                    placeholder="To email"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <input
                    type="text"
                    value={replyForm.sub}
                    onChange={(e) => setReplyForm((prev) => ({ ...prev, sub: e.target.value }))}
                    placeholder="Subject"
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <textarea
                    value={replyForm.reply}
                    onChange={(e) => setReplyForm((prev) => ({ ...prev, reply: e.target.value }))}
                    placeholder="Write your reply..."
                    rows={5}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-900"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => void sendReply(query.id)}
                      disabled={isSendingReply}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isSendingReply ? "Sending..." : "Send Reply"}
                    </button>
                    <button
                      type="button"
                      onClick={closeReply}
                      className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
