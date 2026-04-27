import { Router } from "express";
import {
  listLeads,
  getLead,
  createLeadHandler,
  updateLeadHandler,
  updateLeadStatusHandler,
  deleteLeadHandler,
} from "./leads.controller.js";

const router = Router();

router.get("/", listLeads);
router.get("/:id", getLead);
router.post("/", createLeadHandler);
router.patch("/:id", updateLeadHandler);
router.patch("/:id/status", updateLeadStatusHandler);
router.delete("/:id", deleteLeadHandler);

export default router;