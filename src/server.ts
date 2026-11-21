import "reflect-metadata";

import { env } from "./config/env.js";
import { AppDataSource } from "./database/data-source.js";
import app from "./app.js";

AppDataSource.initialize()
  .then(() => {
    const server = app.listen(env.PORT, () => {
      console.log(`Server running at http://localhost:${env.PORT}`);
    });

    const shutdown = async () => {
      server.close(async () => {
        if (AppDataSource.isInitialized) {
          await AppDataSource.destroy();
        }

        process.exit(0);
      });
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  })
  .catch((error) => {
    console.error("Error while connecting with DB:", error);
    process.exit(1);
  });