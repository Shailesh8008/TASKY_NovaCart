import React, { useState } from "react";
import Modal from "../Modal";
import type { Project, ProjectInput } from "./types";

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
  const [teamMemberText, setTeamMemberText] = useState(() =>
    mode === "edit" && initialProject ? initialProject.teamMembers.join(", ") : "",
  );

  const updateField = <K extends keyof ProjectInput>(field: K, value: ProjectInput[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (wait) {
      return;
    }

    const teamMembers = teamMemberText
      .split(",")
      .map((member) => member.trim())
      .filter(Boolean);

    await onSubmit({ ...form, teamMembers });
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
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.deadline}
            onChange={(event) => updateField("deadline", event.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Team Members (comma separated)
          </label>
          <input
            type="text"
            disabled={wait}
            placeholder="Alex, Priya, Jamal"
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={teamMemberText}
            onChange={(event) => setTeamMemberText(event.target.value)}
          />
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
