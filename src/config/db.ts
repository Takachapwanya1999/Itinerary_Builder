import "dotenv/config";
import mongoose from "mongoose";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const port = Number(process.env.PORT ?? "4000");
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port.");
}

const jwtSecret = required("JWT_SECRET");
if (Buffer.byteLength(jwtSecret, "utf8") < 32) {
  throw new Error("JWT_SECRET must be at least 32 bytes.");
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port,
  mongoUri: required("MONGODB_URI"),
  jwtSecret,
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
};

export async function connectDatabase(): Promise<void> {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10_000,
    autoIndex: false
  });

  const { User } = await import("../models/User");
  const { Itinerary } = await import("../models/Itinerary");
  await Promise.all([User.createIndexes(), Itinerary.createIndexes()]);
}
