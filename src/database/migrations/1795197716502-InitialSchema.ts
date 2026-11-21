import { type MigrationInterface, type QueryRunner } from "typeorm";

export class InitialSchema1795197716502 implements MigrationInterface {
    name = 'InitialSchema1795197716502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`); // DEFAULT uuid_generate_v4() depends on extension uuid-ossp from PostgreSQL. 
        await queryRunner.query(`CREATE TABLE "financial_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "category_id" uuid NOT NULL, "description" character varying(160) NOT NULL, "amount" numeric(12,2) NOT NULL, "entry_type" character varying(10) NOT NULL, "entry_date" date NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_financial_entries_entry_type" CHECK ("entry_type" IN ('income', 'expense')), CONSTRAINT "CHK_financial_entries_amount_positive" CHECK ("amount" > 0), CONSTRAINT "PK_61883ae069a9a2c228e3ecb0b6d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_financial_entries_user_category_date" ON "financial_entries"  ("user_id", "category_id", "entry_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_financial_entries_user_date" ON "financial_entries"  ("user_id", "entry_date") `);
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "name" character varying(80) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_categories_user_name" ON "categories"  ("user_id", "name") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying(254) NOT NULL, "password_hash" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "financial_entries" ADD CONSTRAINT "FK_d781dcfff43d07a93e93c5d82eb" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "financial_entries" ADD CONSTRAINT "FK_7b51e12217e6164e6481f247464" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_2296b7fe012d95646fa41921c8b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_2296b7fe012d95646fa41921c8b"`);
        await queryRunner.query(`ALTER TABLE "financial_entries" DROP CONSTRAINT "FK_7b51e12217e6164e6481f247464"`);
        await queryRunner.query(`ALTER TABLE "financial_entries" DROP CONSTRAINT "FK_d781dcfff43d07a93e93c5d82eb"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_categories_user_name"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_financial_entries_user_date"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_financial_entries_user_category_date"`);
        await queryRunner.query(`DROP TABLE "financial_entries"`);
    }

}
