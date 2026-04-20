import { eq, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { tasks } from "../../db/schema/tasks.js";

type TaskInput = {
  title?: string;
  description?: string;
  dueAt?: string;
  done?: boolean;
};

export async function getTasksByLeadId(leadId: number) {
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.leadId, leadId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTaskById(taskId: number) {
  const result = await db
    .select()
    .from(tasks)
    .where(eq(tasks.id, taskId))
    .limit(1);

  return result[0] ?? null;
}

export async function createTask(leadId: number, input: TaskInput) {
  const result = await db.insert(tasks).values({
    leadId,
    title: input.title!,
    description: input.description,
    dueAt: input.dueAt ? new Date(input.dueAt) : null,
    done: false,
    doneAt: null,
  });

  const insertedId = Number(result[0].insertId);
  return getTaskById(insertedId);
}

export async function updateTask(taskId: number, input: TaskInput) {
  const existingTask = await getTaskById(taskId);

  if (!existingTask) {
    return null;
  }

  const nextDone =
    typeof input.done === "boolean" ? input.done : existingTask.done;

  await db
    .update(tasks)
    .set({
      title: input.title,
      description: input.description,
      dueAt: input.dueAt
        ? new Date(input.dueAt)
        : input.dueAt === ""
        ? null
        : undefined,
      done: nextDone,
      doneAt: nextDone ? new Date() : null,
    })
    .where(eq(tasks.id, taskId));

  return getTaskById(taskId);
}