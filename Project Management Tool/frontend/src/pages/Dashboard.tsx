import React, { useEffect, useMemo, useState } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL ?? "";

type ProgressItem = {
  label: string;
  value: number;
  color: string;
};

type DeadlineItem = {
  title: string;
  date: string;
  daysLeft: number;
};

type ActivityItem = {
  message: string;
  time: string;
};

type DashboardOverview = {
  totalProjects: number;
  totalTasks: number;
  overdueTasks: number;
  upcomingDeadlines: unknown[];
  recentActivities: unknown[];
};

type DashboardResponse = {
  ok?: boolean;
  overview?: Partial<DashboardOverview>;
  message?: string;
};

const toDisplayDate = (value: string | undefined): string => {
  if (!value) {
    return "No date";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getDaysLeft = (value: string | undefined): number | null => {
  if (!value) {
    return null;
  }

  const target = new Date(value);
  if (Number.isNaN(target.getTime())) {
    return null;
  }

  target.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
};

const formatActivityTime = (value: string | undefined): string => {
  if (!value) {
    return "Unknown time";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const humanizeType = (value: string | undefined): string => {
  if (!value) {
    return "Activity";
  }

  return value
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
};

const Dashboard: React.FC = () => {
  const [overview, setOverview] = useState<DashboardOverview>({
    totalProjects: 0,
    totalTasks: 0,
    overdueTasks: 0,
    upcomingDeadlines: [],
    recentActivities: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await fetch(`${backendUrl}/api/dashboard`, {
          method: "GET",
          credentials: "include",
        });

        const data = (await response
          .json()
          .catch(() => null)) as DashboardResponse | null;
        if (!response.ok || !data?.ok || !data.overview) {
          setLoadError(
            data?.message ??
              `Failed to load dashboard (HTTP ${response.status})`,
          );
          return;
        }

        console.log(data)

        setOverview({
          totalProjects: Number(data.overview.totalProjects ?? 0),
          totalTasks: Number(data.overview.totalTasks ?? 0),
          overdueTasks: Number(data.overview.overdueTasks ?? 0),
          upcomingDeadlines: Array.isArray(data.overview.upcomingDeadlines)
            ? data.overview.upcomingDeadlines
            : [],
          recentActivities: Array.isArray(data.overview.recentActivities)
            ? data.overview.recentActivities
            : [],
        });
      } catch {
        setLoadError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboard();
  }, []);

  const stats = useMemo(
    () => ({
      totalProjects: overview.totalProjects,
      totalTasks: overview.totalTasks,
      overdueTasks: overview.overdueTasks,
    }),
    [overview],
  );

  const upcomingDeadlines: DeadlineItem[] = useMemo(
    () =>
      overview.upcomingDeadlines.map((entry, index) => {
        const item = entry as {
          title?: string;
          name?: string;
          deadline?: string;
          dueDate?: string;
          daysLeft?: number;
        };
        const dateValue = item.deadline ?? item.dueDate;
        const computedDaysLeft =
          typeof item.daysLeft === "number"
            ? item.daysLeft
            : getDaysLeft(dateValue);
        return {
          title: item.title ?? item.name ?? `Deadline ${index + 1}`,
          date: toDisplayDate(dateValue),
          daysLeft: computedDaysLeft ?? 0,
        };
      }),
    [overview.upcomingDeadlines],
  );

  const progressSummary: ProgressItem[] = [
    { label: "Project Completion", value: 68, color: "bg-blue-500" },
    { label: "Tasks Completed", value: 74, color: "bg-emerald-500" },
    { label: "Team Productivity", value: 81, color: "bg-amber-500" },
  ];

  const recentActivity: ActivityItem[] = useMemo(
    () =>
      overview.recentActivities.map((entry, index) => {
        const item = entry as {
          id?: string;
          type?: string;
          title?: string;
          message?: string;
          action?: string;
          date?: string;
          time?: string;
          createdAt?: string;
          project?: { name?: string };
        };
        const fallbackTitle = item.project?.name
          ? `${humanizeType(item.type)}: ${item.project.name}`
          : humanizeType(item.type);

        return {
          message:
            item.title ??
            item.message ??
            item.action ??
            fallbackTitle ??
            `Activity ${index + 1}`,
          time: formatActivityTime(item.date ?? item.time ?? item.createdAt),
        };
      }),
    [overview.recentActivities],
  );

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <section>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your projects, tasks, and activity.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Projects</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalProjects}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Total Tasks</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {stats.totalTasks}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Overdue Tasks</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {stats.overdueTasks}
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-sm text-gray-500">Upcoming Deadlines</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {upcomingDeadlines.length}
            </p>
          </div>
        </section>

        {loadError ? (
          <section className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3">
            {loadError}
          </section>
        ) : null}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Progress Summary
            </h2>
            <div className="space-y-5">
              {progressSummary.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{item.label}</span>
                    <span className="font-medium text-gray-800">
                      {item.value}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`${item.color} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upcoming Deadlines
            </h2>
            <ul className="space-y-3">
              {upcomingDeadlines.length === 0 && !loading ? (
                <li className="text-sm text-gray-500">
                  No upcoming deadlines.
                </li>
              ) : null}
              {upcomingDeadlines.map((deadline) => (
                <li
                  key={deadline.title}
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {deadline.title}
                    </p>
                    <p className="text-sm text-gray-500">Due {deadline.date}</p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600">
                    {deadline.daysLeft} days left
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>
          <ul className="space-y-4">
            {recentActivity.length === 0 && !loading ? (
              <li className="text-sm text-gray-500">No recent activity.</li>
            ) : null}
            {recentActivity.map((activity) => (
              <li
                key={`${activity.message}-${activity.time}`}
                className="flex items-start justify-between gap-3"
              >
                <p className="text-gray-700">{activity.message}</p>
                <span className="text-sm text-gray-500 whitespace-nowrap">
                  {activity.time}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
