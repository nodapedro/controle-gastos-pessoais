import type { RequestHandler } from "express";

import { getFinancialReport } from "./report.service.js";

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  return {
    from: `${year}-${month}-01`,
    to: `${year}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

export const showReport: RequestHandler = async (req, res, next) => {
  const defaults = getCurrentMonthRange();

  const requestedFrom = getString(req.query.from);
  const requestedTo = getString(req.query.to);

  const from = requestedFrom || defaults.from;
  const to = requestedTo || defaults.to;

  // Validate the selected date range.
  let error: string | null = null;

  if (!isValidDate(from) || !isValidDate(to)) {
    error = "Por favor insira umda data válida.";
  } else if (from > to) {
    error = "A data de início não pode ser menor que a data final.";
  }

  // Render the same page with the validation message.
  // Do not generate the report when the date range is invalid.
  if (error) {
    res.status(400).render("reports/index", {
      from,
      to,
      totals: null,
      categoryExpenses: [],
      error,
    });

    return;
  }

  try {
    const report = await getFinancialReport(req.session.userId!, from, to);

    res.render("reports/index", {
      from,
      to,
      totals: report.totals,
      categoryExpenses: report.categoryExpenses,
      error: null,
    });
  } catch (error) {
    next(error);
  }
};
