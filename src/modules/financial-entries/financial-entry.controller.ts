import type { RequestHandler, Response } from "express";

import { getCategories } from "../categories/category.service.js";

import {
  createFinancialEntry as createEntryService,
  deleteFinancialEntry as deleteEntryService,
  FinancialEntryError,
  getFinancialEntries,
  getFinancialEntryById,
  updateFinancialEntry as updateEntryService,
  type EntryInput,
} from "./financial-entry.service.js";

type EntryParams = {
  id: string;
};

type EntryFormValues = {
  description: string;
  amount: string;
  entryDate: string;
  entryType: string;
  categoryId: string;
};

type FormOptions = {
  editing: boolean;
  formAction?: string;
  error?: string | null;
  statusCode?: number;
};

const UUID_REGEX = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function readFormValues(body: unknown): EntryFormValues {
  const data =
    typeof body === "object" && body !== null
      ? (body as Record<string, unknown>)
      : {};

  return {
    description: getString(data.description).trim(),
    amount: getString(data.amount).trim(),
    entryDate: getString(data.entryDate),
    entryType: getString(data.entryType),
    categoryId: getString(data.categoryId),
  };
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

function validateEntry(values: EntryFormValues): string | null {
  if (!values.description || values.description.length > 160) {
    return "Description is required and must have at most 160 characters.";
  }

  // NUMERIC(12,2): up to 10 integer digits and 2 decimal digits.
  if (
    !/^\d{1,10}(?:\.\d{1,2})?$/.test(values.amount) ||
    !Number.isFinite(Number(values.amount)) ||
    Number(values.amount) <= 0
  ) {
    return "Amount must be positive and have at most 2 decimal places.";
  }

  if (!isValidDate(values.entryDate)) {
    return "Please enter a valid date.";
  }

  if (!["income", "expense"].includes(values.entryType)) {
    return "Please select a valid entry type.";
  }

  if (!UUID_REGEX.test(values.categoryId)) {
    return "Please select a valid category.";
  }

  return null;
}

function toEntryInput(values: EntryFormValues): EntryInput {
  return {
    description: values.description,
    amount: values.amount,
    entryDate: values.entryDate,
    entryType: values.entryType as EntryInput["entryType"],
    categoryId: values.categoryId,
  };
}

async function renderEntryForm(
  res: Response,
  userId: string,
  values: EntryFormValues,
  options: FormOptions,
): Promise<void> {
  const categories = await getCategories(userId);

  res.status(options.statusCode ?? 200).render("financial-entries/form", {
    ...values,
    categories,
    editing: options.editing,
    formAction: options.formAction ?? "/entries",
    error: options.error ?? null,
  });
}

// GET /entries
export const listFinancialEntries: RequestHandler = async (req, res, next) => {
  const from = getString(req.query.from);
  const to = getString(req.query.to);
  const categoryId = getString(req.query.categoryId);

  if (
    (from && !isValidDate(from)) ||
    (to && !isValidDate(to)) ||
    (categoryId && !UUID_REGEX.test(categoryId)) ||
    (from && to && from > to)
  ) {
    res.status(400).send("Invalid filters.");
    return;
  }

  try {
    const [entries, categories] = await Promise.all([
      getFinancialEntries(req.session.userId!, {
        from: from || undefined,
        to: to || undefined,
        categoryId: categoryId || undefined,
      }),
      getCategories(req.session.userId!),
    ]);

    res.render("financial-entries/index", {
      entries,
      categories,
      from,
      to,
      categoryId,
      error: getString(req.query.error) || null,
    });
  } catch (error) {
    next(error);
  }
};

// GET /entries/new
export const showCreateForm: RequestHandler = async (req, res, next) => {
  try {
    await renderEntryForm(
      res,
      req.session.userId!,
      {
        description: "",
        amount: "",
        entryDate: "",
        entryType: "expense",
        categoryId: "",
      },
      {
        editing: false,
      },
    );
  } catch (error) {
    next(error);
  }
};

// POST /entries
export const createFinancialEntry: RequestHandler = async (req, res, next) => {
  const values = readFormValues(req.body);
  const validationError = validateEntry(values);

  try {
    if (validationError) {
      await renderEntryForm(res, req.session.userId!, values, {
        editing: false,
        error: validationError,
        statusCode: 400,
      });
      return;
    }

    await createEntryService(toEntryInput(values), req.session.userId!);

    res.redirect("/entries");
  } catch (error) {
    if (error instanceof FinancialEntryError) {
      try {
        await renderEntryForm(res, req.session.userId!, values, {
          editing: false,
          error: error.message,
          statusCode: error.statusCode,
        });
      } catch (renderError) {
        next(renderError);
      }

      return;
    }

    next(error);
  }
};

// GET /entries/:id/edit
export const showEditForm: RequestHandler<EntryParams> = async (
  req,
  res,
  next,
) => {
  try {
    const entry = await getFinancialEntryById(
      req.params.id,
      req.session.userId!,
    );

    if (!entry) {
      res.status(404).send("Financial entry not found.");
      return;
    }

    await renderEntryForm(
      res,
      req.session.userId!,
      {
        description: entry.description,
        amount: entry.amount,
        entryDate: entry.entryDate,
        entryType: entry.entryType,
        categoryId: entry.categoryId,
      },
      {
        editing: true,
        formAction: `/entries/${entry.id}`,
      },
    );
  } catch (error) {
    next(error);
  }
};

// POST /entries/:id
export const updateFinancialEntry: RequestHandler<EntryParams> = async (
  req,
  res,
  next,
) => {
  const values = readFormValues(req.body);
  const validationError = validateEntry(values);

  try {
    if (validationError) {
      await renderEntryForm(res, req.session.userId!, values, {
        editing: true,
        formAction: `/entries/${req.params.id}`,
        error: validationError,
        statusCode: 400,
      });
      return;
    }

    const entry = await updateEntryService(
      req.params.id,
      toEntryInput(values),
      req.session.userId!,
    );

    if (!entry) {
      res.status(404).send("Financial entry not found.");
      return;
    }

    res.redirect("/entries");
  } catch (error) {
    if (error instanceof FinancialEntryError) {
      try {
        await renderEntryForm(res, req.session.userId!, values, {
          editing: true,
          formAction: `/entries/${req.params.id}`,
          error: error.message,
          statusCode: error.statusCode,
        });
      } catch (renderError) {
        next(renderError);
      }

      return;
    }

    next(error);
  }
};

// POST /entries/:id/delete
export const removeFinancialEntry: RequestHandler<EntryParams> = async (
  req,
  res,
  next,
) => {
  try {
    const deleted = await deleteEntryService(
      req.params.id,
      req.session.userId!,
    );

    if (!deleted) {
      res.status(404).send("Financial entry not found.");
      return;
    }

    res.redirect("/entries");
  } catch (error) {
    next(error);
  }
};
