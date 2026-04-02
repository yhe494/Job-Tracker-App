import app from "./app.js";
import { env } from "./config/env.js";
import { connectMongo, disconnectMongo} from "./db/mongo.js";



async function start() {
  // Fail fast: DB must connect before server listens
  await connectMongo();

  const server = app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
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