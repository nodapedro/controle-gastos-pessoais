import { AppDataSource } from "../../database/data-source.js";
import { Category } from "../categories/category.entity.js";
import { FinancialEntry, type EntryType } from "./financial-entry.entity.js";

export interface EntryFilters {
  from?: string;
  to?: string;
  categoryId?: string;
}

export interface EntryInput {
  description: string;
  amount: string;
  entryDate: string;
  entryType: EntryType;
  categoryId: string;
}

export class FinancialEntryError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "FinancialEntryError";
  }
}

async function validateCategoryOwnership(
  categoryId: string,
  userId: string,
): Promise<void> {
  const categoryRepository = AppDataSource.getRepository(Category);

  const category = await categoryRepository.findOneBy({
    id: categoryId,
    userId,
  });

  if (!category) {
    throw new FinancialEntryError(
      "Please select a valid category belonging to your account.",
      400,
    );
  }
}

export async function getFinancialEntries(
  userId: string,
  filters: EntryFilters = {},
): Promise<FinancialEntry[]> {
  const repository = AppDataSource.getRepository(FinancialEntry);

  const query = repository
    .createQueryBuilder("entry")
    .leftJoinAndSelect("entry.category", "category")
    .where("entry.userId = :userId", { userId });

  if (filters.from) {
    query.andWhere("entry.entryDate >= :from", {
      from: filters.from,
    });
  }

  if (filters.to) {
    query.andWhere("entry.entryDate <= :to", {
      to: filters.to,
    });
  }

  if (filters.categoryId) {
    query.andWhere("entry.categoryId = :categoryId", {
      categoryId: filters.categoryId,
    });
  }

  return query
    .orderBy("entry.entryDate", "DESC")
    .addOrderBy("entry.createdAt", "DESC")
    .getMany();
}

export async function getFinancialEntryById(
  id: string,
  userId: string,
): Promise<FinancialEntry | null> {
  const repository = AppDataSource.getRepository(FinancialEntry);

  return repository.findOneBy({
    id,
    userId,
  });
}

export async function createFinancialEntry(
  input: EntryInput,
  userId: string,
): Promise<FinancialEntry> {
  await validateCategoryOwnership(input.categoryId, userId);

  const repository = AppDataSource.getRepository(FinancialEntry);

  const entry = repository.create({
    ...input,
    userId,
  });

  return repository.save(entry);
}

export async function updateFinancialEntry(
  id: string,
  input: EntryInput,
  userId: string,
): Promise<FinancialEntry | null> {
  const repository = AppDataSource.getRepository(FinancialEntry);

  const entry = await repository.findOneBy({
    id,
    userId,
  });

  if (!entry) {
    return null;
  }

  await validateCategoryOwnership(input.categoryId, userId);

  entry.description = input.description;
  entry.amount = input.amount;
  entry.entryDate = input.entryDate;
  entry.entryType = input.entryType;
  entry.categoryId = input.categoryId;

  return repository.save(entry);
}

export async function deleteFinancialEntry(
  id: string,
  userId: string,
): Promise<boolean> {
  const repository = AppDataSource.getRepository(FinancialEntry);

  const result = await repository.delete({
    id,
    userId,
  });

  return (result.affected ?? 0) > 0;
}
