import { AppDataSource } from "../../database/data-source.js";
import { Category } from "./category.entity.js";

export class CategoryError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "CategoryError";
  }
}

function getPostgresErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  const driverError = (
    error as {
      driverError?: { code?: string };
    }
  ).driverError;

  return driverError?.code;
}

export async function getCategories(userId: string): Promise<Category[]> {
  const categoryRepository = AppDataSource.getRepository(Category);

  return categoryRepository.find({
    where: { userId },
    order: { name: "ASC" },
  });
}

export async function getCategoryById(
  id: string,
  userId: string,
): Promise<Category | null> {
  const categoryRepository = AppDataSource.getRepository(Category);

  return categoryRepository.findOneBy({
    id,
    userId,
  });
}

export async function createCategory(
  name: string,
  userId: string,
): Promise<Category> {
  const categoryRepository = AppDataSource.getRepository(Category);

  const normalizedName = name.trim();

  if (!normalizedName || normalizedName.length > 80) {
    throw new CategoryError(
      "Category name must contain 1 to 80 characters.",
      400,
    );
  }

  const category = categoryRepository.create({
    name: normalizedName,
    userId,
  });

  try {
    return await categoryRepository.save(category);
  } catch (error) {
    if (getPostgresErrorCode(error) === "23505") {
      throw new CategoryError(
        "You already have a category with this name.",
        409,
      );
    }

    throw error;
  }
}

export async function updateCategory(
  id: string,
  name: string,
  userId: string,
): Promise<Category | null> {
  const categoryRepository = AppDataSource.getRepository(Category);

  const category = await categoryRepository.findOneBy({
    id,
    userId,
  });

  if (!category) {
    return null;
  }

  const normalizedName = name.trim();

  if (!normalizedName || normalizedName.length > 80) {
    throw new CategoryError(
      "Category name must contain 1 to 80 characters.",
      400,
    );
  }

  category.name = normalizedName;

  try {
    return await categoryRepository.save(category);
  } catch (error) {
    if (getPostgresErrorCode(error) === "23505") {
      throw new CategoryError(
        "You already have a category with this name.",
        409,
      );
    }

    throw error;
  }
}

export async function deleteCategory(
  id: string,
  userId: string,
): Promise<boolean> {
  const categoryRepository = AppDataSource.getRepository(Category);

  const category = await categoryRepository.findOneBy({
    id,
    userId,
  });

  if (!category) {
    return false;
  }

  try {
    await categoryRepository.remove(category);
    return true;
  } catch (error) {
    if (getPostgresErrorCode(error) === "23503") {
      throw new CategoryError(
        "Cannot delete this category because it has financial entries.",
        409,
      );
    }

    throw error;
  }
}
