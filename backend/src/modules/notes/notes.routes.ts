import { Router } from "express";
import {
  listLeadNotes,
  createLeadNoteHandler,
} from "./notes.controller.js";

const router = Router();

router.get("/:id/notes", listLeadNotes);
router.post("/:id/notes", createLeadNoteHandler);

export default router;