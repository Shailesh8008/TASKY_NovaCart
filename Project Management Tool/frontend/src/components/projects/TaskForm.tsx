import React, { useMemo, useState } from "react";
import CustomSelect from "../CustomSelect";
import type { ProjectTask, TaskInput, TaskStatus } from "./types";

interface TaskFormProps {
  mode: "create" | "edit";
  teamMembers: string[];
  teamMemberLabels?: Record<string, string>;
  initialTask?: ProjectTask | null;
  onSubmit: (values: TaskInput) => void;
  onCancel?: () => void;
}

const emptyState: TaskInput = {
  title: "",
  description: "",
  assignee: "",
  status: "Todo",
};

const buildInitialForm = (
  mode: "create" | "edit",
  initialTask: ProjectTask | null,
  teamMembers: string[],
): TaskInput => {
  if (mode === "edit" && initialTask) {
    return {
      title: initialTask.title,
      description: initialTask.description,
      assignee: initialTask.assignee,
      status: initialTask.status,
    };
  }

  return {
    ...emptyState,
    assignee: teamMembers[0] ?? "",
  };
};

const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  teamMembers,
  teamMemberLabels,
  initialTask = null,
  onSubmit,
  onCancel,
}) => {
  const [form, setForm] = useState<TaskInput>(() => buildInitialForm(mode, initialTask, teamMembers));
  const fallbackAssignee = teamMembers[0] ?? "";
  const safeAssignee = teamMembers.includes(form.assignee)
    ? form.assignee
    : form.assignee || fallbackAssignee;
  const assigneeOptions = useMemo(() => {
    const baseOptions = teamMembers.map((memberId) => ({
      value: memberId,
      label: teamMemberLabels?.[memberId] ?? memberId,
    }));

    if (safeAssignee && !teamMembers.includes(safeAssignee)) {
      return [{ value: safeAssignee, label: safeAssignee }, ...baseOptions];
    }

    return baseOptions;
  }, [teamMembers, teamMemberLabels, safeAssignee]);

  const updateField = <K extends keyof TaskInput>(field: K, value: TaskInput[K]) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ ...form, assignee: safeAssignee });

    if (mode === "create") {
      setForm({
        ...emptyState,
        assignee: fallbackAssignee,
      });
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          type="text"
          required
          placeholder="Task title"
          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
        />

        <CustomSelect
          value={safeAssignee}
          onChange={(value) => updateField("assignee", value)}
          disabled={teamMembers.length === 0}
          placeholder="No team members"
          options={assigneeOptions}
        />
      </div>

      <textarea
        rows={2}
        required
        placeholder="Task description"
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={form.description}
        onChange={(event) => updateField("description", event.target.value)}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-44">
          <CustomSelect
            value={form.status}
            onChange={(value) => updateField("status", value as TaskStatus)}
            options={[
              { value: "Todo", label: "Todo" },
              { value: "In Progress", label: "In Progress" },
              { value: "Completed", label: "Completed" },
            ]}
            buttonClassName="py-2"
          />
        </div>

        <div className="flex gap-2">
          {onCancel ? (
            <button
              type="button"
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer"
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            disabled={teamMembers.length === 0}
          >
            {mode === "create" ? "Add Task" : "Save Task"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default TaskForm;
