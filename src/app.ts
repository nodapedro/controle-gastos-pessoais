import express from "express";
import path from "node:path";
import session from "express-session";

import { env } from "./config/env.js";

import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/categories/category.routes.js";
import financialEntryRoutes from "./modules/financial-entries/financial-entry.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import { requireAuth } from "./middlewares/auth.middleware.js";

import { formatDate } from "./utils/format-date.js";
import { formatCurrency } from "./utils/format-currency.js";

const app = express();
app.locals.formatDate = formatDate;
app.locals.formatCurrency = formatCurrency;

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "..", "views"));

// Request parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static files
app.use(express.static(path.join(import.meta.dirname, "..", "public")));

// Session configuration
app.use(
  session({
    name: "sid",
    secret: env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24,
    },
  }),
);

// Authentication routes
app.use(authRoutes);

// Protected routes
app.use("/categories", requireAuth, categoryRoutes);
app.use("/entries", requireAuth, financialEntryRoutes);
app.use("/reports", requireAuth, reportRoutes);

// Protected homepage
app.get("/", requireAuth, (_req, res) => {
  res.render("home");
});

// 404 handler
app.use((_req, res) => {
  res.status(404).send("Page not found");
});

// Centralized error handler
app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Application error:", error);

    res.status(500).send("Internal server error");
  },
);

export default app;
