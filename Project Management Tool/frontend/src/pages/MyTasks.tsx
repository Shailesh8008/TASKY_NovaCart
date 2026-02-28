import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { formatDeadline } from "../components/projects/projectUtils";
import type { ProjectTask, TaskStatus } from "../components/projects/types";
import { useAuth } from "../context/AuthContext";
import { useProjects } from "../hooks/useProjects";

type FlattenedTask = {
  projectId: string;
  projectName: string;
  task: ProjectTask;
};

const statusClasses: Record<TaskStatus, string> = {
  Todo: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const normalizeText = (value: string) => value.trim().toLowerCase();

const parseUserIdentity = (user: Record<string, unknown> | null): Set<string> => {
  if (!user) {
    return new Set();
  }

  const keys = ["id", "_id", "email", "name", "username"];
  const identities = keys
    .map((key) => user[key])
    .filter((value): value is string => typeof value === "string")
    .map(normalizeText)
    .filter(Boolean);

  return new Set(identities);
};

const toTimeValue = (value: string): number => {
  if (!value) {
    return Number.POSITIVE_INFINITY;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? Number.POSITIVE_INFINITY : parsed;
};

const MyTasks: React.FC = () => {
  const { projects } = useProjects();
  const { user } = useAuth();

  const myTaskList = useMemo(() => {
    const identitySet = parseUserIdentity(user);

    if (identitySet.size === 0) {
      return [] as FlattenedTask[];
    }

    const tasks = projects.flatMap((project) =>
      project.tasks
        .filter((task) => identitySet.has(normalizeText(task.assignee)))
        .map((task) => ({
          projectId: project.id,
          projectName: project.name,
          task,
        })),
    );

    tasks.sort((left, right) => toTimeValue(left.task.deadline) - toTimeValue(right.task.deadline));
    return tasks;
  }, [projects, user]);

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <section>
          <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-gray-600 mt-2">
            View all tasks currently assigned to you across projects.
          </p>
        </section>

        <section className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-sm text-gray-500">Assigned Tasks</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{myTaskList.length}</p>
        </section>

        <section className="space-y-4">
          {myTaskList.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-600">
              No tasks are assigned to you yet.
            </div>
          ) : (
            myTaskList.map(({ projectId, projectName, task }) => (
              <article key={`${projectId}-${task.id}`} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      {projectName}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-900 mt-1">{task.title}</h2>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <p className="text-sm text-gray-700 mt-2">
                      <span className="font-medium">Deadline:</span>{" "}
                      {task.deadline ? formatDeadline(task.deadline) : "N/A"}
                    </p>
                  </div>

                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full h-fit ${statusClasses[task.status]}`}>
                    {task.status}
                  </span>
                </div>

                <div className="mt-4">
                  <Link
                    to={`/projects/${projectId}`}
                    className="inline-flex px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Open Project
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
};

export default MyTasks;
