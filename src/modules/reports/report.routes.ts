import { Router } from "express";

import { showReport } from "./report.controller.js";

const router = Router();

router.get("/", showReport);

export default router;