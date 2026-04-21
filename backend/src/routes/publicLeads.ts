import { Router } from "express";
import { z } from "zod";
import { db } from "../config/db.js";
import { leads } from "../db/schema/leads.js";

const router = Router();

const publicLeadSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname fehlt"),
  lastName: z.string().trim().min(1, "Nachname fehlt"),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined)
    .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
      message: "Ungueltige E-Mail",
    }),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  city: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
  notes: z.string().trim().min(1, "Nachricht fehlt"),
  website: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((value) => value || undefined),
});

router.post("/public/leads", async (req, res) => {
  try {
    const parsed = publicLeadSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Ungueltige Formulardaten.",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    if (data.website) {
      return res.status(200).json({
        success: true,
        message: "Anfrage erfolgreich uebermittelt.",
      });
    }

    if (!data.email && !data.phone) {
      return res.status(400).json({
        success: false,
        message: "Bitte mindestens E-Mail oder Telefonnummer angeben.",
      });
    }

    const insertPayload = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email ?? null,
      phone: data.phone ?? null,
      city: data.city ?? null,
      notes: data.notes,
      status: "new",
      source: "website",
    };

    const result = await db.insert(leads).values(insertPayload);

    return res.status(201).json({
      success: true,
      message: "Lead erfolgreich angelegt.",
      result,
    });
  } catch (error) {
    console.error("Fehler bei POST /api/public/leads:", error);

    return res.status(500).json({
      success: false,
      message: "Interner Serverfehler beim Anlegen des Leads.",
    });
  }
});

export default router;