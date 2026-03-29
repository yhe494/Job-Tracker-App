import express from "express";
import cors from "cors";
import {env} from './config/env';
import {errorHandler} from './middleware/errorHandler';
import { getDbStatus } from "./db/mongo";
import cookieParser from "cookie-parser";
import authRoutes from "./modules/auth/auth.routes";
import applicationsRoutes from "./modules/applications/applications.routes";
import aiRoutes from "./modules/ai/ai.routes";

const app = express();

app.use(express.json());
app.use(cookieParser());
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

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/applications", applicationsRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use(errorHandler);

export default app;