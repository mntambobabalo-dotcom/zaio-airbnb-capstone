import cors from "cors";
import express from "express";
import helmet from "helmet";
import mongoose from "mongoose";
import morgan from "morgan";
import path from "node:path";
import { fileURLToPath } from "node:url";
import accommodationRoutes from "./routes/accommodationRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const clientBuildPath = path.resolve(currentDirectory, "../../client/dist");
const allowedOrigins = (process.env.CLIENT_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set("trust proxy", 1);
app.disable("x-powered-by");
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(Object.assign(new Error("Origin is not allowed by CORS."), { statusCode: 403 }));
  },
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  const databaseStates = ["disconnected", "connected", "connecting", "disconnecting"];
  res.json({
    status: "ok",
    database: databaseStates[mongoose.connection.readyState] ?? "unknown",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/users", userRoutes);
app.use("/api/accommodations", accommodationRoutes);
app.use("/api/reservations", reservationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientBuildPath, "index.html")));
}

app.use(notFound);
app.use(errorHandler);

export { app };
