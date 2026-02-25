import express from "express";
import cors from "cors";
import { env } from "./config/env";

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
  });
});

app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});