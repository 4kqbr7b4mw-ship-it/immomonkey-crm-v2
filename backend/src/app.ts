import express from "express";
import cors from "cors";
import session from "express-session";
import { env } from "./config/env.js";
import leadsRoutes from "./modules/leads/leads.routes.js";
import notesRoutes from "./modules/notes/notes.routes.js";
import statsRoutes from "./modules/stats/stats.routes.js";
import tasksRoutes from "./modules/tasks/tasks.routes.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import { authMiddleware } from "./middlewares/auth.middleware.js";
import publicLeadsRouter from "./routes/publicLeads.js";
import authRoutes from "./routes/auth.routes.js";

export const app = express();

app.set("trust proxy", 1);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(
  session({
    name: "immomonkey_sid",
    secret: process.env.SESSION_SECRET || "fallback-session-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "immomonkey-crm-backend",
  });
});

app.use("/api", authRoutes);
app.use("/api/leads", authMiddleware, leadsRoutes);
app.use("/api/leads", authMiddleware, notesRoutes);
app.use("/api/leads", authMiddleware, tasksRoutes);
app.use("/api/stats", authMiddleware, statsRoutes);
app.use("/api", publicLeadsRouter);

app.use(errorMiddleware);
