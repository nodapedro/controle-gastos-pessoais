import { Router } from "express";

import {
  listCategories,
  showCreateForm,
  createCategory,
  showEditForm,
  updateCategory,
  removeCategory,
} from "./category.controller.js";

import { validateUuidParam } from "../../middlewares/validate-uuid-param.middleware.js";

const router = Router();

router.get("/", listCategories);

router.get("/new", showCreateForm);
router.post("/", createCategory);

router.get("/:id/edit", validateUuidParam("id"), showEditForm);
router.post("/:id", validateUuidParam("id"), updateCategory);
router.post("/:id/delete", validateUuidParam("id"), removeCategory);

export default router;
