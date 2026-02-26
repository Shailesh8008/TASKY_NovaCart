import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../components/ConfirmModal";
import ProjectCard from "../components/projects/ProjectCard";
import ProjectFilters from "../components/projects/ProjectFilters";
import ProjectFormModal from "../components/projects/ProjectFormModal";
import { calculateProjectStatus } from "../components/projects/projectUtils";
import type {
  Project,
  ProjectInput,
  ProjectStatus,
} from "../components/projects/types";
import { useProjects } from "../hooks/useProjects";
import toast from "react-hot-toast";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";

const ProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { projects, createProject, updateProject, deleteProject } =
    useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ProjectStatus>(
    "All",
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [wait, setWait] = useState(false);

  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !normalizedSearch ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch);

      const derivedStatus = calculateProjectStatus(project.tasks);
      const matchesStatus =
        statusFilter === "All" || derivedStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchTerm, statusFilter]);

  const openCreateModal = () => {
    setFormMode("create");
    setEditingProject(null);
    setIsFormOpen(true);
  };

  const openEditModal = (project: Project) => {
    setFormMode("edit");
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleSubmitProject = async (values: ProjectInput) => {
    if (wait) {
      return;
    }

    if (formMode === "create") {
      setWait(true);
      try {
        const response = await fetch(`${backendUrl}/api/create-project`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(values),
        });

        const data = (await response.json().catch(() => null)) as {
          ok?: boolean;
          message?: string;
        } | null;

        if (!response.ok || data?.ok === false) {
          const message =
            data?.message ||
            `Failed to create project (HTTP ${response.status})`;
          toast.error(message);
          return;
        }

        createProject(values);
        setIsFormOpen(false);
        toast.success("Project created successfully");
      } catch {
        toast.error("Unable to connect to server");
      } finally {
        setWait(false);
      }
      return;
    }

    if (!editingProject) {
      return;
    }

    setWait(true);
    try {
      updateProject(editingProject.id, values);
      setIsFormOpen(false);
    } finally {
      setWait(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600 mt-1">
              Manage all projects, deadlines, and team assignments.
            </p>
          </div>
          <button
            type="button"
            className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 cursor-pointer"
            onClick={openCreateModal}
          >
            Create New Project
          </button>
        </section>

        <ProjectFilters
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
        />

        <section className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-600">
              No projects match your current search/filter.
            </div>
          ) : (
            filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onView={(projectId) => navigate(`/projects/${projectId}`)}
                onEdit={openEditModal}
                onDelete={setDeletingProject}
              />
            ))
          )}
        </section>
      </div>

      <ProjectFormModal
        key={`${isFormOpen}-${formMode}-${editingProject?.id ?? "new"}`}
        isOpen={isFormOpen}
        mode={formMode}
        wait={wait}
        initialProject={editingProject}
        onClose={() => {
          if (wait) {
            return;
          }
          setIsFormOpen(false);
        }}
        onSubmit={handleSubmitProject}
      />

      <ConfirmModal
        isOpen={Boolean(deletingProject)}
        title="Delete Project"
        description={`Are you sure you want to delete "${deletingProject?.name ?? ""}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onClose={() => setDeletingProject(null)}
        onConfirm={() => {
          if (!deletingProject) {
            return;
          }

          deleteProject(deletingProject.id);
          setDeletingProject(null);
        }}
      />
    </main>
  );
};

export default ProjectPage;
