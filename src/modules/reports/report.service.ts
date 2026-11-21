import { AppDataSource } from "../../database/data-source.js";
import { FinancialEntry } from "../financial-entries/financial-entry.entity.js";

type RawTotals = {
  totalIncome: string | null;
  totalExpenses: string | null;
  balance: string | null;
};

type RawCategoryExpense = {
  categoryId: string;
  categoryName: string;
  total: string;
};

export interface FinancialReport {
  totals: {
    totalIncome: string;
    totalExpenses: string;
    balance: string;
  };
  categoryExpenses: RawCategoryExpense[];
}

export async function getFinancialReport(
  userId: string,
  from: string,
  to: string,
): Promise<FinancialReport> {
  const repository = AppDataSource.getRepository(FinancialEntry);

  const totals = await repository
    .createQueryBuilder("entry")
    .select(
      `COALESCE(
        SUM(CASE WHEN entry.entryType = :income THEN entry.amount ELSE 0 END),
        0
      )`,
      "totalIncome",
    )
    .addSelect(
      `COALESCE(
        SUM(CASE WHEN entry.entryType = :expense THEN entry.amount ELSE 0 END),
        0
      )`,
      "totalExpenses",
    )
    .addSelect(
      `COALESCE(
        SUM(
          CASE
            WHEN entry.entryType = :income THEN entry.amount
            WHEN entry.entryType = :expense THEN -entry.amount
            ELSE 0
          END
        ),
        0
      )`,
      "balance",
    )
    .where("entry.userId = :userId", { userId })
    .andWhere("entry.entryDate >= :from", { from })
    .andWhere("entry.entryDate <= :to", { to })
    .setParameters({
      income: "income",
      expense: "expense",
    })
    .getRawOne<RawTotals>();

  const categoryExpenses = await repository
    .createQueryBuilder("entry")
    .innerJoin("entry.category", "category")
    .select("category.id", "categoryId")
    .addSelect("category.name", "categoryName")
    .addSelect("SUM(entry.amount)", "total")
    .where("entry.userId = :userId", { userId })
    .andWhere("entry.entryType = :expense", { expense: "expense" })
    .andWhere("entry.entryDate >= :from", { from })
    .andWhere("entry.entryDate <= :to", { to })
    .groupBy("category.id")
    .addGroupBy("category.name")
    .orderBy("SUM(entry.amount)", "DESC")
    .getRawMany<RawCategoryExpense>();

  return {
    totals: {
      totalIncome: totals?.totalIncome ?? "0.00",
      totalExpenses: totals?.totalExpenses ?? "0.00",
      balance: totals?.balance ?? "0.00",
    },
    categoryExpenses,
  };
}
