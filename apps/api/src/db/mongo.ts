import mongoose from "mongoose";
import { env } from "../config/env.js";

let isConnected = false;

export function getDbStatus() {
  // mongoose.connection.readyState:
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const state = mongoose.connection.readyState;
  const map: Record<number, "disconnected" | "connected" | "connecting" | "disconnecting"> = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return {
    isConnected: state === 1,
    state: map[state] ?? "disconnected",
  };
}

export async function connectMongo() {
  if (isConnected) return;

  mongoose.set("strictQuery", true);

  // Helpful logs in dev
  mongoose.connection.on("connected", () => console.log("MongoDB connected"));
  mongoose.connection.on("error", (err) => console.error("MongoDB error:", err));
  mongoose.connection.on("disconnected", () => console.log("MongoDB disconnected"));

  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.MONGODB_DB_NAME,
  });

  isConnected = true;
}

export async function disconnectMongo() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}