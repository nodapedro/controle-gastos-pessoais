import "reflect-metadata";
import { DataSource } from "typeorm";

import { env } from "../config/env.js";

import { User } from "../modules/users/user.entity.js";
import { Category } from "../modules/categories/category.entity.js";
import { FinancialEntry } from "../modules/financial-entries/financial-entry.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",

  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,

  synchronize: false,
  migrationsRun: true,

  logging:
    env.NODE_ENV === "development" ? ["error", "warn", "migration"] : ["error"],

  poolSize: 10,

  entities: [User, Category, FinancialEntry],

  migrations: [import.meta.dirname + "/migrations/*.{ts,js}"],
});
