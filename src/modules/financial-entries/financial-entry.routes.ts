import { Router } from "express";

import {
  listFinancialEntries,
  showCreateForm,
  createFinancialEntry,
  showEditForm,
  updateFinancialEntry,
  removeFinancialEntry,
} from "./financial-entry.controller.js";

import { validateUuidParam } from "../../middlewares/validate-uuid-param.middleware.js";

const router = Router();

router.get("/", listFinancialEntries);

router.get("/new", showCreateForm);
router.post("/", createFinancialEntry);

router.get("/:id/edit", validateUuidParam("id"), showEditForm);
router.post("/:id", validateUuidParam("id"), updateFinancialEntry);
router.post("/:id/delete", validateUuidParam("id"), removeFinancialEntry);

export default router;
