import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { logError } from "../lib/logger";

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, examType, examDate } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        examType,
        examDate: new Date(examDate),
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d" as const,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          examType: user.examType,
          examDate: user.examDate,
        },
      });
  } catch (error) {
    logError("register", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "7d" as const,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          examType: user.examType,
          examDate: user.examDate,
        },
      });
  } catch (error) {
    logError("login", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  res
    .clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    })
    .json({ message: "Logged out" });
}

export async function me(req: AuthRequest, res: Response): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        name: true,
        email: true,
        examType: true,
        examDate: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json({ user });
  } catch (error) {
    logError("me", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProfile(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { examType, examDate, name } = req.body;

    const data: Record<string, unknown> = {};
    if (examType) data.examType = examType;
    if (examDate) data.examDate = new Date(examDate);
    if (name) data.name = name;

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        examType: true,
        examDate: true,
      },
    });

    res.json({ user });
  } catch (error) {
    logError("updateProfile", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
}
