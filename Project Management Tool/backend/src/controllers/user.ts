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

const userController = {
  checkUser,
  register,
  login,
  logout,
};
export default userController;
