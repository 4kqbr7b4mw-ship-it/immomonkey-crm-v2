import { sql } from "drizzle-orm";
import { db } from "../../config/db.js";
import { leads } from "../../db/schema/leads.js";

type PipelineRow = {
  pipeline_stage: string | null;
  count: number;
};

type ScoreRow = {
  score: string | null;
  count: number;
};

export async function getStats() {
  const totalResult = await db
    .select({
      count: sql<number>`count(*)`,
    })
    .from(leads);

  const pipelineResult = await db
    .select({
      pipeline_stage: leads.status,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .groupBy(leads.status);

  const scoreResult = await db
    .select({
      score: leads.score,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .groupBy(leads.score);

  return {
    total_leads: Number(totalResult[0]?.count ?? 0),
    by_pipeline: (pipelineResult as PipelineRow[]).map((row) => ({
      pipeline_stage: row.pipeline_stage ?? "unknown",
      count: Number(row.count),
    })),
    by_score: (scoreResult as ScoreRow[]).map((row) => ({
      score: row.score ?? "unrated",
      count: Number(row.count),
    })),
  };
}