import fs from "fs/promises";
import path from "path";
import URL from "url";
import { pgClient } from "../Config/Database.js";
import { errorMsg, info } from "../Utils/Logger.js";

const __filename = URL.fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  migrationsDir = path.join(__dirname, "SQL Tables");

(async () => {
  try {
    const sqlFiles = (await fs.readdir(migrationsDir))
      .sort()
      .filter((file) => file.endsWith(".sql"));

    for (let sqlFile of sqlFiles) {
      const sqlFileCommands = await fs.readFile(
        path.join(migrationsDir, sqlFile),
        {
          encoding: "utf-8",
        }
      );

      await pgClient.query(sqlFileCommands);

      await pgClient.query("INSERT INTO migrations(table_name) VALUES($1)", [
        sqlFile,
      ]);

      info(`${sqlFile} created successfully`);
    }

    info("Migrations complete");
  } catch (error) {
    errorMsg((error as Error).message);
    await pgClient.query("ROLLBACK");
  }
})();
