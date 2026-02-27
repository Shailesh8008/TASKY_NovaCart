import React, { useEffect, useMemo, useState } from "react";
import Modal from "../Modal";
import type { Project, ProjectInput } from "./types";
import toast from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface ProjectFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialProject: Project | null;
  wait: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectInput) => Promise<void> | void;
}

const emptyState: ProjectInput = {
  name: "",
  description: "",
  deadline: "",
  teamMembers: [],
};

const buildInitialForm = (
  mode: "create" | "edit",
  initialProject: Project | null,
): ProjectInput => {
  if (mode === "edit" && initialProject) {
    return {
      name: initialProject.name,
      description: initialProject.description,
      deadline: initialProject.deadline,
      teamMembers: initialProject.teamMembers,
    };
  }

  return emptyState;
};

const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  mode,
  initialProject,
  wait,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState<ProjectInput>(() => buildInitialForm(mode, initialProject));
  const [users, setUsers] = useState<UserOption[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoadError, setUsersLoadError] = useState<string | null>(null);
  const [memberQuery, setMemberQuery] = useState("");
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const minDeadline = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const fetchUsers = async () => {
      setUsersLoading(true);
      setUsersLoadError(null);

      try {
        const response = await fetch(`${backendUrl}/api/get-users`, {
          method: "GET",
          credentials: "include",
        });

        const payload = (await response.json().catch(() => null)) as
          | UserOption[]
          | { users?: UserOption[]; data?: UserOption[]; message?: string }
          | null;

        if (!response.ok) {
          const message =
            (payload && !Array.isArray(payload) ? payload.message : null) ||
            `Failed to fetch users (HTTP ${response.status})`;
          setUsersLoadError(message);
          setUsers([]);
          return;
        }

        const nextUsers = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.users)
            ? payload.users
            : Array.isArray(payload?.data)
              ? payload.data
              : [];

        setUsers(
          nextUsers.filter(
            (user) =>
              typeof user?.id === "string" &&
              typeof user?.name === "string" &&
              typeof user?.email === "string",
          ),
        );
      } catch {
        setUsersLoadError("Unable to load users");
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    };

    void fetchUsers();
  }, [isOpen]);

  const filteredUsers = useMemo(() => {
    const query = memberQuery.trim().toLowerCase();
    const selected = new Set(form.teamMembers);

    return users
      .filter((user) => !selected.has(user.id))
      .filter((user) => {
        if (!query) {
          return true;
        }

        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
        );
      })
      .slice(0, 8);
  }, [users, form.teamMembers, memberQuery]);

  const updateField = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const addTeamMember = (userId: string) => {
    if (form.teamMembers.includes(userId)) {
      return;
    }

    updateField("teamMembers", [...form.teamMembers, userId]);
    setMemberQuery("");
    setShowMemberDropdown(false);
  };

  const removeTeamMember = (userId: string) => {
    updateField(
      "teamMembers",
      form.teamMembers.filter((memberId) => memberId !== userId),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (wait) {
      return;
    }
    if (form.deadline < minDeadline) {
      toast.error("Deadline cannot be in the past");
      return;
    }

    await onSubmit(form);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} panelClassName="max-w-xl border border-gray-100">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === "create" ? "Create New Project" : "Edit Project"}
        </h2>
      </div>

      <form className="p-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            required
            disabled={wait}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            required
            rows={3}
            disabled={wait}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
          <input
            type="date"
            required
            disabled={wait}
            min={minDeadline}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.deadline}
            onChange={(event) => updateField("deadline", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Team Members</label>

          {form.teamMembers.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2">
              {form.teamMembers.map((memberId) => {
                const user = users.find((entry) => entry.id === memberId);
                return (
                  <span
                    key={memberId}
                    className="inline-flex items-center gap-2 rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-sm"
                  >
                    {user ? `${user.name} (${user.email})` : memberId}
                    <button
                      type="button"
                      disabled={wait}
                      className="text-blue-700 hover:text-blue-900 cursor-pointer"
                      onClick={() => removeTeamMember(memberId)}
                    >
                      x
                    </button>
                  </span>
                );
              })}
            </div>
          ) : null}

          <div className="relative">
            <input
              type="text"
              disabled={wait}
              placeholder="Type name or email"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={memberQuery}
              onFocus={() => setShowMemberDropdown(true)}
              onBlur={() => {
                setTimeout(() => {
                  setShowMemberDropdown(false);
                }, 120);
              }}
              onChange={(event) => {
                setMemberQuery(event.target.value);
                setShowMemberDropdown(true);
              }}
            />

            {showMemberDropdown ? (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                {usersLoading ? (
                  <div className="px-3 py-2 text-sm text-gray-500">Loading users...</div>
                ) : usersLoadError ? (
                  <div className="px-3 py-2 text-sm text-red-600">{usersLoadError}</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">No users found</div>
                ) : (
                  filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-blue-50 cursor-pointer"
                      onClick={() => addTeamMember(user.id)}
                    >
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            disabled={wait}
            className={`px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 ${
              wait ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={wait}
            className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center ${
              wait ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {wait ? (
              <svg
                className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : null}
            {wait ? "please wait..." : mode === "create" ? "Create Project" : "Save Changes"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectFormModal;
