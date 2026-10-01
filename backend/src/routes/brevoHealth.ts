import { Router } from "express";

type BrevoAggregatedReport = {
  range?: string;
  requests?: number;
  delivered?: number;
  hardBounces?: number;
  softBounces?: number;
};

const router = Router();

router.post("/internal/brevo-health", async (req, res) => {
  const expectedToken = process.env.BREVO_HEALTH_TOKEN?.trim();
  const providedToken = req.get("authorization");

  if (!expectedToken) {
    return res.status(503).json({
      status: "error",
      reason: "health-token-not-configured",
    });
  }

  if (providedToken !== `Bearer ${expectedToken}`) {
    return res.status(401).json({ status: "unauthorized" });
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
    const requests30d = Number(report.requests ?? 0);
    const delivered30d = Number(report.delivered ?? 0);

    console.log(
      `[Brevo Health] OK; requests30d=${requests30d}; delivered30d=${delivered30d}`
    );

    return res.status(200).json({
      status: "ok",
      brevo: "reachable",
      range: report.range ?? null,
      requests30d,
      delivered30d,
      checkedAt: new Date().toISOString(),
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
