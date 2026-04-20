import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).optional(),
  dueAt: z.string().datetime().optional().or(z.literal("")),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(255).optional(),
  description: z.string().trim().max(5000).optional(),
  dueAt: z.string().datetime().optional().or(z.literal("")),
  done: z.boolean().optional(),
});