import { Router } from "express";

type BrevoAggregatedReport = {
  range?: string;
  requests?: number;
  delivered?: number;
};

const router = Router();
const MIN_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
let lastSuccessfulCheckAt = 0;

router.post("/internal/brevo-health", async (_req, res) => {
  const now = Date.now();

  if (
    lastSuccessfulCheckAt > 0 &&
    now - lastSuccessfulCheckAt < MIN_CHECK_INTERVAL_MS
  ) {
    return res.status(200).json({
      status: "ok",
      brevo: "recently-checked",
      checkedAt: new Date(lastSuccessfulCheckAt).toISOString(),
    });
  }

  const apiKey = process.env.BREVO_API_KEY?.trim();

  if (!apiKey) {
    return res.status(503).json({
      status: "error",
      reason: "brevo-not-configured",
    });
  }

  try {
    const response = await fetch(
      "https://api.brevo.com/v3/smtp/statistics/aggregatedReport?days=30",
      {
        headers: {
          Accept: "application/json",
          "api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const body = (await response.text()).slice(0, 500);
      console.error(
        `[Brevo Health] API check failed: HTTP ${response.status} ${body}`
      );

      return res.status(502).json({
        status: "error",
        brevo: "unreachable",
        httpStatus: response.status,
      });
    }

    const report = (await response.json()) as BrevoAggregatedReport;
    lastSuccessfulCheckAt = now;

    console.log(
      `[Brevo Health] OK; range=${report.range ?? "n/a"}; requests30d=${Number(
        report.requests ?? 0
      )}; delivered30d=${Number(report.delivered ?? 0)}`
    );

    return res.status(200).json({
      status: "ok",
      brevo: "reachable",
      checkedAt: new Date(lastSuccessfulCheckAt).toISOString(),
    });
  } catch (error) {
    console.error("[Brevo Health] request failed:", error);

    return res.status(502).json({
      status: "error",
      brevo: "unreachable",
    });
  }
});

export default router;
