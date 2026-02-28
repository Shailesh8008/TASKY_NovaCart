import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { Prisma, TaskStatus } from "@prisma/client";

const checkUser = (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  return res.json({ ok: true, user: req.user });
};

const register = async (req: Request, res: Response) => {
  const { name, email, pass1 } = req.body as {
    name?: string;
    email?: string;
    pass1?: string;
  };

  if (!name || !email || !pass1) {
    return res.status(400).json({
      ok: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(409)
        .json({ ok: false, message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(pass1, 10);

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res
      .status(201)
      .json({ ok: true, message: "User registered successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ ok: false, message: "Failed to register user" });
  }
};

const login = async (req: Request, res: Response) => {
  const { email, pass } = req.body as {
    email?: string;
    pass?: string;
  };

  if (!email || !pass) {
    return res.status(400).json({
      ok: false,
      message: "Email and password are required",
    });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ ok: false, message: "Invalid email" });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ ok: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET_KEY!,
      { expiresIn: "7d" },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.ENV === "prod",
      sameSite: process.env.ENV === "prod" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      ok: true,
      message: "Login successful",
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error: unknown) {
    console.error("Login error:", error);
    const message =
      error instanceof Error ? error.message.toLowerCase() : String(error);

    if (message.includes("timed out") || message.includes("timeout expired")) {
      return res.status(503).json({
        ok: false,
        message: "Cannot reach database. Check DATABASE_URL host/port/ssl.",
      });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({
        ok: false,
        message: "Database connection timed out. Please try again.",
      });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return res.status(500).json({
        ok: false,
        message: "Database request failed",
        code: error.code,
      });
    }

    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.ENV === "prod",
      sameSite: process.env.ENV === "prod" ? "none" : "lax",
    });
    return res.json({ ok: true, message: "Successfully Logout" });
  } catch (error) {
    res.json({ ok: false, message: "Internal server error" });
  }
};

const createProject = async (req: Request, res: Response) => {
  const { name, description, deadline, teamMembers } = req.body as {
    name?: string;
    description?: string;
    deadline?: string;
    teamMembers: string[];
  };

  if (!name || !description || !deadline) {
    return res
      .status(400)
      .json({ ok: false, message: "All fields are required" });
  }

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        deadline: new Date(deadline),
        ownerId: req.user!.id,
        members: {
          connect: teamMembers.map((id) => ({ id })),
        },
      },
    });
    return res
      .status(201)
      .json({ ok: true, message: "Project created successfully", project });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

const editProject = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const { projectId, name, description, deadline, teamMembers } = req.body as {
    projectId?: string;
    name?: string;
    description?: string;
    deadline?: string;
    teamMembers?: string[];
  };

  if (!projectId || !name || !description || !deadline) {
    return res.status(400).json({
      ok: false,
      message: "projectId, name, description, and deadline are required",
    });
  }

  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    return res.status(400).json({
      ok: false,
      message: "Invalid deadline date",
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: req.user.id,
      },
      select: { id: true },
    });

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: "Project not found or you don't have permission",
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        name,
        description,
        deadline: parsedDeadline,
        members: {
          set: Array.isArray(teamMembers)
            ? teamMembers.map((id) => ({ id }))
            : [],
        },
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.json({
      ok: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Error editing project:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error",
    });
  }
};

const addTask = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const { title, description, deadline, projectId, assignedToId, assignedTo, assignee } = req.body as {
    title?: string;
    description?: string;
    deadline?: string;
    projectId?: string;
    assignedToId?: string;
    assignedTo?: string;
    assignee?: string;
  };

  const resolvedAssignedToId = [assignedToId, assignedTo, assignee].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  if (!title || !projectId) {
    return res.status(400).json({
      ok: false,
      message: "Task title and projectId are required",
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: req.user.id }, { members: { some: { id: req.user.id } } }],
      },
      select: { id: true },
    });

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: "Project not found or you don't have access",
      });
    }

    if (resolvedAssignedToId) {
      const assignee = await prisma.user.findFirst({
        where: {
          id: resolvedAssignedToId,
          OR: [
            { id: req.user.id },
            { ownedProjects: { some: { id: projectId } } },
            { memberProjects: { some: { id: projectId } } },
          ],
        },
        select: { id: true },
      });

      if (!assignee) {
        return res.status(400).json({
          ok: false,
          message: "Assigned user is not part of this project",
        });
      }
    }

    const parsedDeadline = deadline ? new Date(deadline) : undefined;
    if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({
        ok: false,
        message: "Invalid deadline date",
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        deadline: parsedDeadline,
        projectId,
        assignedToId: resolvedAssignedToId,
      },
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return res
      .status(201)
      .json({ ok: true, message: "Task added successfully", task });
  } catch (error) {
    console.error("Error adding task:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

const normalizeTaskStatus = (
  value: string | undefined,
): TaskStatus | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "todo" || normalized === "to_do") {
    return TaskStatus.TODO;
  }
  if (normalized === "in progress" || normalized === "in_progress") {
    return TaskStatus.IN_PROGRESS;
  }
  if (normalized === "completed" || normalized === "done") {
    return TaskStatus.DONE;
  }

  return undefined;
};

const editTask = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const { taskId, projectId, title, description, deadline, status, assignedToId, assignedTo, assignee } = req.body as {
    taskId?: string;
    projectId?: string;
    title?: string;
    description?: string;
    deadline?: string;
    status?: string;
    assignedToId?: string;
    assignedTo?: string;
    assignee?: string;
  };

  const resolvedAssignedToId = [assignedToId, assignedTo, assignee].find(
    (value): value is string =>
      typeof value === "string" && value.trim().length > 0,
  );

  if (!taskId || !projectId) {
    return res.status(400).json({
      ok: false,
      message: "taskId and projectId are required",
    });
  }

  const parsedDeadline = deadline ? new Date(deadline) : undefined;
  if (parsedDeadline && Number.isNaN(parsedDeadline.getTime())) {
    return res.status(400).json({
      ok: false,
      message: "Invalid deadline date",
    });
  }

  const normalizedStatus = normalizeTaskStatus(status);
  if (status && !normalizedStatus) {
    return res.status(400).json({
      ok: false,
      message: "Invalid task status",
    });
  }

  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [{ ownerId: req.user.id }, { members: { some: { id: req.user.id } } }],
      },
      select: { id: true, ownerId: true },
    });

    if (!project) {
      return res.status(404).json({
        ok: false,
        message: "Project not found or you don't have access",
      });
    }

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      select: { id: true, assignedToId: true },
    });

    if (!existingTask) {
      return res.status(404).json({
        ok: false,
        message: "Task not found",
      });
    }

    if (resolvedAssignedToId) {
      const taskAssignee = await prisma.user.findFirst({
        where: {
          id: resolvedAssignedToId,
          OR: [
            { id: req.user.id },
            { ownedProjects: { some: { id: projectId } } },
            { memberProjects: { some: { id: projectId } } },
          ],
        },
        select: { id: true },
      });

      if (!taskAssignee) {
        return res.status(400).json({
          ok: false,
          message: "Assigned user is not part of this project",
        });
      }
    }

    const isOwner = project.ownerId === req.user.id;
    const isTaskAssignee = existingTask.assignedToId === req.user.id;
    const requestedStatusOnlyUpdate =
      status !== undefined &&
      title === undefined &&
      description === undefined &&
      deadline === undefined &&
      resolvedAssignedToId === undefined;

    if (requestedStatusOnlyUpdate && !isOwner && !isTaskAssignee) {
      return res.status(403).json({
        ok: false,
        message: "You can only update status for tasks assigned to you",
      });
    }

    if (!requestedStatusOnlyUpdate && !isOwner) {
      return res.status(403).json({
        ok: false,
        message: "Only project owner can edit task details",
      });
    }

    const updateData: Prisma.TaskUncheckedUpdateInput = {};

    if (typeof title === "string" && title.trim().length > 0) {
      updateData.title = title;
    }
    if (description !== undefined) {
      updateData.description = description;
    }
    if (deadline !== undefined) {
      updateData.deadline = parsedDeadline ?? null;
    }
    if (resolvedAssignedToId !== undefined) {
      updateData.assignedToId = resolvedAssignedToId;
    }
    if (normalizedStatus) {
      updateData.status = normalizedStatus;
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        ok: false,
        message: "No valid fields provided to update",
      });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json({
      ok: true,
      message: "Task updated successfully",
      task,
    });
  } catch (error) {
    console.error("Error editing task:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

const getDashboardOverview = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const userId = req.user.id;
  const now = new Date();

  try {
    const accessibleProjects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        ownerId: true,
      },
    });

    const projectIds = accessibleProjects.map((project) => project.id);

    if (!projectIds.length) {
      return res.json({
        ok: true,
        overview: {
          totalProjects: 0,
          totalTasks: 0,
          overdueTasks: 0,
          upcomingDeadlines: [],
          recentActivities: [],
        },
      });
    }

    const [ownedProjectTasks, assignedTasks, overdueTasks, upcomingDeadlines, recentOwnedProjectTasks, recentAssignedTasks] =
      await Promise.all([
        prisma.task.findMany({
          where: { project: { ownerId: userId } },
          select: { id: true },
        }),
        prisma.task.findMany({
          where: { assignedToId: userId },
          select: { id: true },
        }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            status: { not: "DONE" },
            deadline: { lt: now },
          },
        }),
        prisma.project.findMany({
          where: {
            id: { in: projectIds },
            deadline: { gte: now },
          },
          orderBy: { deadline: "asc" },
          take: 5,
          select: {
            id: true,
            name: true,
            deadline: true,
          },
        }),
        prisma.task.findMany({
          where: { project: { ownerId: userId } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            project: { select: { id: true, name: true } },
          },
        }),
        prisma.task.findMany({
          where: {
            assignedToId: userId,
            projectId: { in: projectIds },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            updatedAt: true,
            project: { select: { id: true, name: true } },
          },
        }),
      ]);

    const totalTasks = new Set([
      ...ownedProjectTasks.map((task) => task.id),
      ...assignedTasks.map((task) => task.id),
    ]).size;

    const ownedProjectActivities = accessibleProjects
      .filter((project) => project.ownerId === userId)
      .flatMap((project) => {
        const activities = [
          {
            id: `project-created-${project.id}`,
            type: "PROJECT_CREATED",
            title: `Project created: ${project.name}`,
            project: { id: project.id, name: project.name },
            date: project.createdAt,
          },
        ];

        if (project.updatedAt.getTime() > project.createdAt.getTime()) {
          activities.push({
            id: `project-updated-${project.id}`,
            type: "PROJECT_UPDATED",
            title: `Project updated: ${project.name}`,
            project: { id: project.id, name: project.name },
            date: project.updatedAt,
          });
        }

        return activities;
      });

    const assignedProjectActivities = accessibleProjects
      .filter((project) => project.ownerId !== userId)
      .map((project) => ({
        id: `project-assigned-${project.id}`,
        type: "PROJECT_ASSIGNED",
        title: `Assigned to project: ${project.name}`,
        project: { id: project.id, name: project.name },
        date: project.updatedAt,
      }));

    const ownedProjectTaskActivities = recentOwnedProjectTasks.flatMap((task) => {
      const activities = [
        {
          id: `owned-task-created-${task.id}`,
          type: "TASK_CREATED",
          title: `Task created in your project: ${task.title}`,
          project: task.project,
          date: task.createdAt,
        },
      ];

      if (task.updatedAt.getTime() > task.createdAt.getTime()) {
        activities.push({
          id: `owned-task-updated-${task.id}`,
          type: "TASK_UPDATED",
          title: `Task updated in your project: ${task.title}`,
          project: task.project,
          date: task.updatedAt,
        });
      }

      return activities;
    });

    const assignedTaskActivities = recentAssignedTasks.flatMap((task) => {
      const activities = [
        {
          id: `task-assigned-${task.id}`,
          type: "TASK_ASSIGNED",
          title: `Task assigned: ${task.title}`,
          project: task.project,
          date: task.createdAt,
        },
      ];

      if (task.updatedAt.getTime() > task.createdAt.getTime()) {
        activities.push({
          id: `task-updated-${task.id}`,
          type: "TASK_UPDATED",
          title: `Task updated: ${task.title}`,
          project: task.project,
          date: task.updatedAt,
        });
      }

      return activities;
    });

    const dedupedRecentActivities = Array.from(
      new Map(
        [
          ...ownedProjectActivities,
          ...assignedProjectActivities,
          ...ownedProjectTaskActivities,
          ...assignedTaskActivities,
        ].map((activity) => [activity.id, activity]),
      ).values(),
    );

    const recentActivities = dedupedRecentActivities
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return res.json({
      ok: true,
      overview: {
        totalProjects: projectIds.length,
        totalTasks,
        overdueTasks,
        upcomingDeadlines,
        recentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    return res
      .status(500)
      .json({ ok: false, message: "Internal server error" });
  }
};

const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    return res.json({ ok: true, users });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error while fetching users",
    });
  }
};

const getMyProjects = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        tasks: {
          orderBy: { createdAt: "desc" },
          include: {
            assignedTo: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return res.json({ ok: true, projects });
  } catch (error) {
    console.error("Error fetching my projects:", error);
    return res.status(500).json({
      ok: false,
      message: "Internal server error while fetching projects",
    });
  }
};

const userController = {
  checkUser,
  register,
  login,
  logout,
  createProject,
  editProject,
  addTask,
  editTask,
  getDashboardOverview,
  getUsers,
  getMyProjects,
};
export default userController;
