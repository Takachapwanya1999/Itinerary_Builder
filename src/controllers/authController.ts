import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../config/db";
import { User } from "../models/User";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(72).refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    "Password must not exceed 72 UTF-8 bytes."
  ),
  agencyName: z.string().trim().max(150).optional()
}).strict();

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(72)
}).strict();

function issueToken(user: { id: string; role: string }): string {
  return jwt.sign(
    { id: user.id, role: user.role },
    env.jwtSecret,
    {
      algorithm: "HS256",
      expiresIn: "8h",
      issuer: "itinerary-api",
      audience: "itinerary-api"
    }
  );
}

export const register: RequestHandler = async (req, res, next) => {
  try {
    const input = registerSchema.parse(req.body);
    const user = await User.create({
      name: input.name,
      email: input.email,
      password: input.password,
      agencyName: input.agencyName,
      role: "agent"
    });

    res.status(201).json({
      token: issueToken({ id: user.id, role: user.role }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        agencyName: user.agencyName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const user = await User.findOne({ email: input.email }).select("+password");
    const passwordMatches = user
      ? await user.comparePassword(input.password)
      : await bcrypt.hash(input.password, 12).then(() => false);

    if (!user || !passwordMatches) {
      res.status(401).json({ error: "Email or password is incorrect." });
      return;
    }

    res.setHeader("Cache-Control", "no-store");
    res.json({
      token: issueToken({ id: user.id, role: user.role }),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        agencyName: user.agencyName,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};
