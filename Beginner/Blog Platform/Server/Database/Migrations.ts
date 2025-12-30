import * as fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pgClient, connectDb } from "../Config/Db.js";
import { warning, info, error as Error } from "../src/utils/logger.js";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  MIGRATIONS_DIR = path.join(__dirname, "Migrations");

const runMigrations = async () => {
  try {
    const sqlMigrations = (await fs.readdir(MIGRATIONS_DIR))
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const sqlFile of sqlMigrations) {
      const existsCheck = await pgClient.query(
        "SELECT 1 FROM migrations WHERE name=$1",
        [sqlFile]
      );

      if (existsCheck.rowCount && existsCheck.rowCount > 0) {
        warning(`Skipping ${sqlFile}\n`);

        continue;
      }

      const sql = await fs.readFile(path.join(MIGRATIONS_DIR, sqlFile), {
        encoding: "utf-8",
      });

      info(`Running ${sqlFile}\n`);

      try {
        await pgClient.query("BEGIN");
        await pgClient.query(sql);
        await pgClient.query("INSERT INTO migrations(name) VALUES($1)", [
          sqlFile,
        ]);
        await pgClient.query("COMMIT");
      } catch (error) {
        Error((error as Error).message);
        await pgClient.query("ROLLBACK");
      }

      info(`Completed ${sqlFile}`);
    }

    info("Migrations created successfully");
  } catch (error) {
    Error((error as Error).message);
    await pgClient.query("ROLLBACK");
  }
};

(async () => {
  await connectDb();
  await runMigrations();
  process.exit(0);
})();
