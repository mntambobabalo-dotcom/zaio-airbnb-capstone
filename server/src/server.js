import "dotenv/config";
import { app } from "./app.js";
import { connectDatabase, disconnectDatabase } from "./config/db.js";

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDatabase();
  const server = app.listen(port, () => {
    console.log(`Zaio Airbnb API listening on port ${port}`);
  });

  async function shutdown(signal) {
    console.log(`${signal} received. Closing the server...`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  }

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

startServer().catch((error) => {
  console.error("Unable to start the API:", error.message);
  process.exit(1);
});
