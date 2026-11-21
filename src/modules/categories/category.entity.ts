import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

import { User } from "../users/user.entity.js";
import { FinancialEntry } from "../financial-entries/financial-entry.entity.js";

@Entity({ name: "categories" })
@Index("UQ_categories_user_name", ["userId", "name"], {
  unique: true,
})
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "user_id",
    type: "uuid",
  })
  userId!: string;

  @ManyToOne(() => User, (user) => user.categories, {
    nullable: false,
    onDelete: "RESTRICT",
  })
  @JoinColumn({
    name: "user_id",
    referencedColumnName: "id",
  })
  user!: User;

  @Column({
    type: "varchar",
    length: 80,
  })
  name!: string;

  @OneToMany(() => FinancialEntry, (entry) => entry.category)
  financialEntries!: FinancialEntry[];

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
