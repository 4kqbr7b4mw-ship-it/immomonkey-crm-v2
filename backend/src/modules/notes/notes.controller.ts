import { Request, Response, NextFunction } from "express";
import { getLeadById } from "../leads/leads.service.js";
import { createLeadNote, getNotesByLeadId } from "./notes.service.js";
import { createLeadNoteSchema } from "./notes.validation.js";

export async function listLeadNotes(
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

    const notes = await getNotesByLeadId(leadId);
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}

export async function createLeadNoteHandler(
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

    const parsed = createLeadNoteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Notizdaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const note = await createLeadNote(leadId, parsed.data.content);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
}