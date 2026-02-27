import React from "react";
import CustomSelect from "../CustomSelect";
import type { ProjectTask, TaskStatus } from "./types";

interface TaskListProps {
  tasks: ProjectTask[];
  assigneeLabels?: Record<string, string>;
  onEdit: (task: ProjectTask) => void;
  onDelete: (task: ProjectTask) => void;
  onStatusChange: (taskId: string, nextStatus: TaskStatus) => void;
}

const statusClasses: Record<TaskStatus, string> = {
  Todo: "bg-gray-100 text-gray-700",
  "In Progress": "bg-blue-100 text-blue-700",
  Completed: "bg-emerald-100 text-emerald-700",
};

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  assigneeLabels,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (tasks.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-sm text-gray-600">
        No tasks yet. Add your first task to start tracking progress.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <article key={task.id} className="bg-gray-50 border border-gray-100 rounded-xl p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <h3 className="font-semibold text-gray-900">{task.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{task.description}</p>
              <p className="text-sm text-gray-700 mt-2">
                <span className="font-medium">Assigned to:</span> {assigneeLabels?.[task.assignee] ?? task.assignee}
              </p>
            </div>

            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full h-fit ${statusClasses[task.status]}`}>
              {task.status}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="min-w-40">
              <CustomSelect
                value={task.status}
                onChange={(value) => onStatusChange(task.id, value as TaskStatus)}
                options={[
                  { value: "Todo", label: "Todo" },
                  { value: "In Progress", label: "In Progress" },
                  { value: "Completed", label: "Completed" },
                ]}
                buttonClassName="bg-white py-2 text-sm"
                menuClassName="min-w-40"
              />
            </div>

            <button
              type="button"
              className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
              onClick={() => onEdit(task)}
            >
              Edit
            </button>

            <button
              type="button"
              className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 cursor-pointer"
              onClick={() => onDelete(task)}
            >
              Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
};

export default TaskList;
