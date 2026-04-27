import { Request, Response, NextFunction } from "express";
import {
  createLead,
  getAllLeads,
  getLeadById,
  updateLead,
  updateLeadStatus,
  deleteLead,
} from "./leads.service.js";
import {
  createLeadSchema,
  updateLeadSchema,
  updateLeadStatusSchema,
} from "./leads.validation.js";

export async function listLeads(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const data = await getAllLeads();
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
}

export async function getLead(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const lead = await getLeadById(id);

    if (!lead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    res.status(200).json(lead);
  } catch (error) {
    next(error);
  }
}

export async function createLeadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = createLeadSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Eingabedaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const lead = await createLead(parsed.data);
    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
}

export async function updateLeadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const parsed = updateLeadSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Eingabedaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingLead = await getLeadById(id);

    if (!existingLead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    const updatedLead = await updateLead(id, parsed.data);
    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
}

export async function updateLeadStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const parsed = updateLeadStatusSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Ungültige Statusdaten",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const existingLead = await getLeadById(id);

    if (!existingLead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    const updatedLead = await updateLeadStatus(id, parsed.data.status);
    res.status(200).json(updatedLead);
  } catch (error) {
    next(error);
  }
}

export async function deleteLeadHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ message: "Ungültige Lead-ID" });
    }

    const existingLead = await getLeadById(id);

    if (!existingLead) {
      return res.status(404).json({ message: "Lead nicht gefunden" });
    }

    await deleteLead(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}
