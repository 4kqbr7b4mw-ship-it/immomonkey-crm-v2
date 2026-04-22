import crmLeadsRouter from "./routes/crmLeads.js";
import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import notesRoutes from "./modules/notes/notes.routes.js";
import statsRoutes from "./modules/stats/stats.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import publicLeadsRouter from "./routes/publicLeads.js";

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

app.use("/api/leads", authMiddleware, leadsRoutes);
app.use("/api/leads", authMiddleware, notesRoutes);
app.use("/api/leads", authMiddleware, tasksRoutes);
app.use("/api/stats", authMiddleware, statsRoutes);
app.use("/api", publicLeadsRouter);


app.use(errorMiddleware);
