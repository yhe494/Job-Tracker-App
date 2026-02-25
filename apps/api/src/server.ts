import express from "express";
import cors from "cors";
import { env } from "./config/env";
import { connectMongo, disconnectMongo, getDbStatus } from "./db/mongo";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);

app.get("/api/v1/health", (_req, res) => {
  res.json({
    ok: true,
    env: env.NODE_ENV,
    db: getDbStatus(),
  });
});

async function start() {
  // Fail fast: DB must connect before server listens
  await connectMongo();

  const server = app.listen(env.PORT, () => {
    console.log(`✅ API running on http://localhost:${env.PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down...`);
    server.close(async () => {
      try {
        await disconnectMongo();
        console.log("Shutdown complete");
        process.exit(0);
      } catch (err) {
        console.error("Shutdown error:", err);
        process.exit(1);
      }
    });
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start().catch((err) => {
  console.error("Startup failed:", err);
  process.exit(1);
});