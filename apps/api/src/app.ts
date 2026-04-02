import express from "express";
import cors from "cors";
import {env} from './config/env';
import {errorHandler} from './middleware/errorHandler';
import { getDbStatus } from "./db/mongo";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import applicationsRoutes from "./modules/applications/applications.routes";
import aiRoutes from "./modules/ai/ai.routes";
import resumeRoutes from "./modules/resume/resume.routes";

const app = express();

function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, "");
}

const allowedOrigins = env.CLIENT_ORIGIN.split(",")
  .map((value) => normalizeOrigin(value))
  .filter(Boolean);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const requestOrigin = normalizeOrigin(origin);
      if (allowedOrigins.includes(requestOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/applications", applicationsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/resume", resumeRoutes);
app.use(errorHandler);

export default app;