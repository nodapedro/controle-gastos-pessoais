import type { RequestHandler } from "express";

import {
  getCategories,
  getCategoryById,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  CategoryError,
} from "./category.service.js";

type CategoryIdParams = {
  id: string;
};

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export const listCategories: RequestHandler = async (req, res, next) => {
  try {
    const categories = await getCategories(req.session.userId!);

    res.render("categories/index", {
      categories,
      error: typeof req.query.error === "string" ? req.query.error : null,
    });
  } catch (error) {
    next(error);
  }
};

export const showCreateForm: RequestHandler = (_req, res) => {
  res.render("categories/form", {
    categoryName: "",
    formAction: "/categories",
    pageTitle: "Nova categoria",
    submitLabel: "Cadastrar",
    error: null,
  });
};

export const createCategory: RequestHandler = async (req, res, next) => {
  const name = getString(req.body?.name).trim();

  if (!name || name.length > 80) {
    res.status(400).render("categories/form", {
      categoryName: name,
      formAction: "/categories",
      pageTitle: "Nova categoria",
      submitLabel: "Cadastrar",
      error: "Category name must contain 1 to 80 characters.",
    });
    return;
  }

  try {
    await createCategoryService(name, req.session.userId!);

    res.redirect("/categories");
  } catch (error) {
    if (error instanceof CategoryError) {
      res.status(error.statusCode).render("categories/form", {
        categoryName: name,
        formAction: "/categories",
        pageTitle: "Nova categoria",
        submitLabel: "Cadastrar",
        error: error.message,
      });
      return;
    }

    next(error);
  }
};

export const showEditForm: RequestHandler<CategoryIdParams> = async (
  req,
  res,
  next,
) => {
  try {
    const category = await getCategoryById(req.params.id, req.session.userId!);

    if (!category) {
      res.status(404).send("Category not found.");
      return;
    }

    res.render("categories/form", {
      categoryName: category.name,
      formAction: `/categories/${category.id}`,
      pageTitle: "Editar categoria",
      submitLabel: "Salvar alterações",
      error: null,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory: RequestHandler<CategoryIdParams> = async (
  req,
  res,
  next,
) => {
  const name = getString(req.body?.name).trim();

  if (!name || name.length > 80) {
    res.status(400).render("categories/form", {
      categoryName: name,
      formAction: `/categories/${req.params.id}`,
      pageTitle: "Editar categoria",
      submitLabel: "Salvar alterações",
      error: "Category name must contain 1 to 80 characters.",
    });
    return;
  }

  try {
    const category = await updateCategoryService(
      req.params.id,
      name,
      req.session.userId!,
    );

    if (!category) {
      res.status(404).send("Category not found.");
      return;
    }

    res.redirect("/categories");
  } catch (error) {
    if (error instanceof CategoryError) {
      res.status(error.statusCode).render("categories/form", {
        categoryName: name,
        formAction: `/categories/${req.params.id}`,
        pageTitle: "Editar categoria",
        submitLabel: "Salvar alterações",
        error: error.message,
      });
      return;
    }

    next(error);
  }
};

export const removeCategory: RequestHandler<CategoryIdParams> = async (
  req,
  res,
  next,
) => {
  try {
    const deleted = await deleteCategoryService(
      req.params.id,
      req.session.userId!,
    );

    if (!deleted) {
      res.redirect("/categories?error=Category%20not%20found.");
      return;
    }

    res.redirect("/categories");
  } catch (error) {
    if (error instanceof CategoryError) {
      res.redirect(`/categories?error=${encodeURIComponent(error.message)}`);
      return;
    }

    next(error);
  }
};
