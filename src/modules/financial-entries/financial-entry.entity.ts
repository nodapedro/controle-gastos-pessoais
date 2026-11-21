import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../users/user.entity.js";
import { Category } from "../categories/category.entity.js";

export type EntryType = "income" | "expense";

@Entity({ name: "financial_entries" })
@Check("CHK_financial_entries_amount_positive", '"amount" > 0')
@Check(
  "CHK_financial_entries_entry_type",
  `"entry_type" IN ('income', 'expense')`,
)
@Index("IDX_financial_entries_user_date", ["userId", "entryDate"])
@Index("IDX_financial_entries_user_category_date", [
  "userId",
  "categoryId",
  "entryDate",
])
export class FinancialEntry {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "user_id",
    type: "uuid",
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.financialEntries, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
  })
  user!: User;

  @Column({
    name: "category_id",
    type: "uuid",
  })
  categoryId!: string;

  @ManyToOne(() => Category, (category) => category.financialEntries, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "category_id",
    referencedColumnName: "id",
  })
  category!: Category;

  @Column({
    type: "varchar",
    length: 160,
  })
  description!: string;

  @Column({
    type: "numeric",
    precision: 12,
    scale: 2,
  })
  amount!: string;

  @Column({
    name: "entry_type",
    type: "varchar",
    length: 10,
  })
  entryType!: EntryType;

  @Column({
    name: "entry_date",
    type: "date",
  })
  entryDate!: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
  })
  updatedAt!: Date;
}
