import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { pgClient, connectDb } from "../Config/Db.js";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename),
  MIGRATIONS_DIR = path.join(__dirname, "Migrations");

const runMigrations = async () => {
  try {
    await pgClient.query(`
      CREATE TABLE IF NOT EXISTS migrations(
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT now()
      );
    `);

    const sqlMigrations = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const migration of sqlMigrations) {
      const existsCheck = await pgClient.query(
        "SELECT 1 FROM migrations WHERE name=$1",
        [migration]
      );

      if (existsCheck.rowCount) {
        process.stdout.write(`⏭ Skipping ${migration}`);
        continue;
      }

      const sql = fs.readFileSync(
        path.join(MIGRATIONS_DIR, migration),
        "utf-8"
      );

      process.stdout.write(`▶ Running ${migration}`);

      await pgClient.query("BEGIN");
      await pgClient.query(sql);
      await pgClient.query("INSERT INTO migrations(name) VALUES ($1)", [
        migration,
      ]);
      await pgClient.query("COMMIT");

      process.stdout.write(`✔ Completed ${migration}`);
    }
  } catch (error) {
    await pgClient.query("ROLLBACK");

    if (error instanceof Error)
      process.stdout.write(`Migration failed: ${error.message}`);
  }
};

(async () => {
  await connectDb();
  await runMigrations();
})();
