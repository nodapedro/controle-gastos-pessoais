import { Router } from "express";

import {
  showRegister,
  register,
  showLogin,
  login,
  logout,
} from "./auth.controller.js";

import { requireAuth } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/register", showRegister);
router.post("/register", register);

router.get("/login", showLogin);
router.post("/login", login);

router.post("/logout", requireAuth, logout);

export default router;