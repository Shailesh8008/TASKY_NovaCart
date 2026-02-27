import React, { useState } from "react";
import { calculateProjectProgress, calculateProjectStatus, formatDeadline } from "./projectUtils";
import type { Project } from "./types";

interface ProjectCardProps {
  project: Project;
  teamMemberLabels?: Record<string, string>;
  onView: (projectId: string) => Promise<void> | void;
  onEdit: (project: Project) => Promise<void> | void;
  onDelete: (project: Project) => Promise<void> | void;
}

const statusStyles: Record<"Not Started" | "In Progress" | "Completed", string> = {
  "Not Started": "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  teamMemberLabels,
  onView,
  onEdit,
  onDelete,
}) => {
  const progress = calculateProjectProgress(project.tasks);
  const status = calculateProjectStatus(project.tasks);
  const [wait, setWait] = useState<"view" | "edit" | "delete" | null>(null);
  const isWaiting = wait !== null;
  const teamText =
    project.teamMembers
      .map((memberId) => teamMemberLabels?.[memberId] ?? memberId)
      .join(", ") || "No members";

  const handleAction = async (action: "view" | "edit" | "delete") => {
    if (isWaiting) {
      return;
    }

    setWait(action);
    try {
      if (action === "view") {
        await onView(project.id);
        return;
      }

      if (action === "edit") {
        await onEdit(project);
        return;
      }

      await onDelete(project);
    } finally {
      setWait(null);
    }
  };

  return (
    <article className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusStyles[status]}`}>{status}</span>
      </div>

      <p className="text-sm text-gray-600 mt-3 line-clamp-2">{project.description}</p>

      <div className="mt-4 space-y-2 text-sm">
        <p className="text-gray-700">
          <span className="font-medium">Deadline:</span> {formatDeadline(project.deadline)}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Team:</span> {teamText}
        </p>
        <p className="text-gray-700">
          <span className="font-medium">Tasks:</span> {project.tasks.length}
        </p>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-700">Progress</span>
          <span className="font-medium text-gray-800">{progress}%</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isWaiting}
          className={`px-3 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center ${
            isWaiting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => handleAction("view")}
        >
          {wait === "view" ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-1 h-5 w-5 text-gray-700"
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
              please wait...
            </>
          ) : (
            "View Details"
          )}
        </button>
        <button
          type="button"
          disabled={isWaiting}
          className={`px-3 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center ${
            isWaiting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => handleAction("edit")}
        >
          {wait === "edit" ? (
            <>
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
              please wait...
            </>
          ) : (
            "Edit"
          )}
        </button>
        <button
          type="button"
          disabled={isWaiting}
          className={`px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 flex items-center justify-center ${
            isWaiting ? "opacity-75 cursor-not-allowed" : "cursor-pointer"
          }`}
          onClick={() => handleAction("delete")}
        >
          {wait === "delete" ? (
            <>
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
              please wait...
            </>
          ) : (
            "Delete"
          )}
        </button>
      </div>
    </article>
  );
};

export default ProjectCard;
