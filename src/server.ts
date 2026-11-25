import "dotenv/config";
import mongoose from "mongoose";
import app from "./app";
import { connectDatabase, env } from "./config/db";

async function startServer(): Promise<void> {
  await connectDatabase();

  const server = app.listen(env.port, () => {
    console.log(`API listening on port ${env.port} (${env.nodeEnv}).`);
  });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received; shutting down.`);

    const timeout = setTimeout(() => {
      console.error("Graceful shutdown timed out.");
      process.exit(1);
    }, 10_000);
    timeout.unref();

    server.close(() => {
      void mongoose.disconnect().then(() => {
        clearTimeout(timeout);
        process.exit(0);
      }).catch((error: unknown) => {
        console.error("Database shutdown failed:", error);
        process.exit(1);
      });
    });
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

startServer().catch((error: unknown) => {
  console.error("Server startup failed:", error);
  process.exit(1);
});
