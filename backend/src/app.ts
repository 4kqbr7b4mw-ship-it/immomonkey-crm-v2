
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import notesRoutes from "./modules/notes/notes.routes.js";
import statsRoutes from "./modules/stats/stats.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

export const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "immomonkey-crm-backend",
  });
});

app.use("/api/leads", leadsRoutes);
app.use("/api/leads", notesRoutes);
app.use("/api/leads", tasksRoutes);
app.use("/api/stats", statsRoutes);

app.use(errorMiddleware);
