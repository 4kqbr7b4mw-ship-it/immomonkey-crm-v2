import { Router } from "express";
import { getStatsHandler } from "./stats.controller.js";

const router = Router();

router.get("/", getStatsHandler);

export default router;