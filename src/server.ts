import "reflect-metadata";
import express from "express";
import path from "path";
import { env } from "./config/env.js";
import { AppDataSource } from "./database/data-source.js";

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(import.meta.dirname, "..", "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", (_req, res) => {
  res.send("Controle de Gastos no ar");
});

AppDataSource.initialize()
  .then(() => {
    const server = app.listen(env.PORT, () =>
      console.log(`Server running on PORT: http://localhost:${env.PORT}`)
    );

    const shutdown = async () => {
      server.close();
      await AppDataSource.destroy();
      process.exit(0);
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((err) => {
    console.error("Error while connecting with DB:", err);
    process.exit(1);
  });