import { Request, Response, NextFunction } from "express";
import { getLeadById } from "../leads/leads.service.js";
import {
  createTask,
  getTaskById,
  getTasksByLeadId,
  updateTask,
} from "./tasks.service.js";
import { createTaskSchema, updateTaskSchema } from "./tasks.validation.js";

export async function listLeadTasks(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = Number(req.params.id);

    if (Number.isNaN(leadId)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const lead = await getLeadById(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    const tasks = await getTasksByLeadId(leadId);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
}

export async function createTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const leadId = Number(req.params.id);

    if (Number.isNaN(leadId)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const lead = await getLeadById(leadId);

    if (!lead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Aufgabendaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const task = await createTask(leadId, parsed.data);
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const taskId = Number(req.params.taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({ message: "Ungültige Task-ID" });
    }

    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Aufgabendaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingTask = await getTaskById(taskId);

    if (!existingTask) {
      return res.status(404).json({ message: "Aufgabe nicht gefunden" });
    }

    const updatedTask = await updateTask(taskId, parsed.data);
    res.status(200).json(updatedTask);
  } catch (error) {
    next(error);
  }
}