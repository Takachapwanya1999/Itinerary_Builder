import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";
import { env } from "../config/db";
import { User } from "../models/User";

type TokenPayload = JwtPayload & {
  id?: unknown;
};

export const authMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const authorization = req.header("authorization") ?? "";
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    const token = match?.[1];
    if (!token) {
      res.status(401).json({ error: "Bearer token is required." });
      return;
    }

    let payload: string | JwtPayload;
    try {
      payload = jwt.verify(token, env.jwtSecret, {
        algorithms: ["HS256"],
        issuer: "itinerary-api",
        audience: "itinerary-api"
      });
    } catch {
      res.status(401).json({ error: "Bearer token is invalid or expired." });
      return;
    }

    if (
      typeof payload === "string" ||
      typeof (payload as TokenPayload).id !== "string" ||
      !mongoose.isValidObjectId((payload as TokenPayload).id)
    ) {
      res.status(401).json({ error: "Bearer token is invalid or expired." });
      return;
    }

    const user = await User.findById((payload as TokenPayload).id)
      .select("_id role")
      .lean();
    if (!user) {
      res.status(401).json({ error: "User account is unavailable." });
      return;
    }

    req.user = { id: user._id.toString(), role: user.role };
    next();
  } catch (error) {
    next(error);
  }
};
