import { Router } from "express";
import { z } from "zod";
import { db } from "../config/db.js";
import { leads } from "../db/schema/leads.js";
import { createSachwertPdf, type SachwertReport } from "../services/sachwertPdf.js";
import { sendLeadNotification } from "../services/email.js";
import { sendSachwertReportEmail } from "../services/sachwertEmail.js";

const router = Router();

const money = z.string().trim().min(1).max(40);
const reportSchema = z.object({
  propertyAddress: z.string().trim().min(3).max(255),
  propertyCity: z.string().trim().min(2).max(120),
  propertyType: z.string().trim().min(2).max(100),
  valuationYear: z.string().trim().regex(/^20\d{2}$/),
  landArea: money,
  landRate: money,
  landValue: money,
  bgf: money,
  yearBuilt: z.string().trim().regex(/^(18|19|20)\d{2}$/),
  nhkValue: money,
  buildingCosts: money,
  remainingLife: money,
  buildingValue: money,
  outdoorValue: money,
  provisionalValue: money,
  marketFactor: money,
  marketValue: money,
  finalValue: money,
});

const requestSchema = z.object({
  firstName: z.string().trim().max(120).optional().default("Interessent"),
  lastName: z.string().trim().max(120).optional().default(""),
  email: z.string().trim().email().max(255),
  marketingConsent: z.boolean().optional().default(false),
  website: z.string().trim().optional().default(""),
  report: reportSchema,
});

router.post("/public/sachwert-report", async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, message: "Bitte prüfen Sie Ihre Angaben." });
  }

  const data = parsed.data;
  if (data.website) {
    return res.status(202).json({ success: true, message: "Auswertung wird versendet." });
  }

  const report = data.report as SachwertReport;
  const consent = data.marketingConsent ? "JA" : "NEIN";
  const notes = [
    "Sachwert-Rechner | PDF angefordert",
    "Immobilie: " + report.propertyAddress + ", " + report.propertyCity,
    "Objekttyp: " + report.propertyType,
    "Sachwertindikation: " + report.finalValue,
    "Marketing-Einwilligung: " + consent,
    "Datenschutz: angefordert am " + new Date().toISOString(),
  ].join("\n");

  try {
    const pdf = createSachwertPdf(report);

    // Der angeforderte PDF-Versand hat Vorrang. CRM-Speicherung und interne
    // Benachrichtigung laufen danach unabhängig weiter und bremsen die Seite nicht.
    await sendSachwertReportEmail({
      to: data.email,
      firstName: data.firstName || "Interessent",
      report,
      pdf,
    });

    void db.insert(leads).values({
      firstName: data.firstName || "Interessent",
      lastName: data.lastName || null,
      email: data.email,
      city: report.propertyCity,
      street: report.propertyAddress,
      propertyType: report.propertyType,
      source: "sachwert-rechner",
      status: "new",
      message: notes,
    }).then(() => sendLeadNotification({
      firstName: data.firstName || "Interessent",
      lastName: data.lastName || "",
      email: data.email,
      city: report.propertyCity,
      notes,
    })).catch((error) => {
      console.error("CRM-Speicherung Sachwert-Rechner fehlgeschlagen:", error);
    });

    return res.status(202).json({
      success: true,
      message: "Ihre Sachwert-Kurzbewertung wird per E-Mail versendet.",
    });
  } catch (error) {
    console.error("Fehler bei POST /api/public/sachwert-report:", error);
    return res.status(500).json({
      success: false,
      message: "Die Auswertung konnte gerade nicht versendet werden. Bitte versuchen Sie es erneut.",
    });
  }
});

export default router;
