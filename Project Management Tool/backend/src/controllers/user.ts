import { Request, Response } from "express";
import bcrypt from "bcrypt";
import prisma from "../lib/prisma";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";

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

const getDashboardOverview = async (req: Request, res: Response) => {
  if (!req.user?.id || typeof req.user.id !== "string") {
    return res.status(401).json({ ok: false, message: "Unauthorized" });
  }

  const userId = req.user.id;
  const now = new Date();

  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { id: userId } } }],
      },
      select: { id: true, name: true, createdAt: true },
    });

    const projectIds = projects.map((project) => project.id);

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

    const [totalTasks, overdueTasks, upcomingDeadlines, recentTasks] =
      await Promise.all([
        prisma.task.count({
          where: { projectId: { in: projectIds } },
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
          where: { projectId: { in: projectIds } },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            title: true,
            createdAt: true,
            project: { select: { id: true, name: true } },
          },
        }),
      ]);

    const recentProjectActivities = projects
      .map((project) => ({
        id: project.id,
        type: "PROJECT_CREATED",
        title: `Project created: ${project.name}`,
        project: { id: project.id, name: project.name },
        date: project.createdAt,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    const recentTaskActivities = recentTasks.map((task) => ({
      id: task.id,
      type: "TASK_CREATED",
      title: `Task created: ${task.title}`,
      project: task.project,
      date: task.createdAt,
    }));

    const recentActivities = [
      ...recentProjectActivities,
      ...recentTaskActivities,
    ]
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
      where: { ownerId: req.user.id },
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
  getDashboardOverview,
  getUsers,
  getMyProjects,
};
export default userController;
