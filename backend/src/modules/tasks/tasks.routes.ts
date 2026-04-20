import { Router } from "express";
import {
  listLeadTasks,
  createTaskHandler,
  updateTaskHandler,
} from "./tasks.controller.js";

const router = Router();

router.get("/:id/tasks", listLeadTasks);
router.post("/:id/tasks", createTaskHandler);
router.patch("/tasks/:taskId", updateTaskHandler);

export default router;