import { Router } from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { leads } from "../db/schema/leads.js";

const router = Router();

router.delete("/leads/:id", async (req, res) => {
  try {
    const leadId = Number(req.params.id);

    if (!Number.isInteger(leadId) || leadId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Ungueltige Lead-ID.",
      });
    }

    const existingLead = await db
      .select({ id: leads.id })
      .from(leads)
      .where(eq(leads.id, leadId))
      .limit(1);

    if (existingLead.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lead nicht gefunden.",
      });
    }

    await db.delete(leads).where(eq(leads.id, leadId));

    return res.status(200).json({
      success: true,
      message: "Lead erfolgreich geloescht.",
    });
  } catch (error) {
    console.error("Fehler bei DELETE /api/leads/:id:", error);

    return res.status(500).json({
      success: false,
      message: "Interner Serverfehler beim Loeschen des Leads.",
    });
  }
});

export default router;
