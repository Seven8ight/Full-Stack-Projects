import path from "path";
import { dbClient } from "../Src/Config/Database.js";
import { fileURLToPath } from "url";
import fs from "fs/promises";
import { Error, Info } from "../Utils/Logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SQLMigrations = path.join(__dirname, "Tables");

async function createMigrationsTable() {
  const migrationFile = await fs.readFile(
    path.join(SQLMigrations, "000_create_migrations_table.sql"),
    "utf-8",
  );

  await dbClient.query(migrationFile);
  Info("Migrations table created successfully.\n\n");
}

async function runMigrations() {
  const sqlFiles = (await fs.readdir(SQLMigrations))
    .sort()
    .filter((file) => file !== "000_create_migrations_table.sql");

  for (const sqlFile of sqlFiles) {
    const tableCheck = await dbClient.query(
      "SELECT 1 FROM migrations WHERE table_name = $1",
      [sqlFile],
    );

    if (tableCheck.rowCount && tableCheck.rowCount > 0) {
      Info(`${sqlFile} already created, skipping.\n`);
      continue;
    }

    const sql = await fs.readFile(path.join(SQLMigrations, sqlFile), "utf-8");

    await dbClient.query(sql);

    await dbClient.query("INSERT INTO migrations(table_name) VALUES($1)", [
      sqlFile,
    ]);

    Info(`${sqlFile} created successfully.\n`);
  }
}

(async () => {
  try {
    await createMigrationsTable();
    await runMigrations();
  } catch (err) {
    Error(`Migration error: ${err}`, err as Error);
  } finally {
    await dbClient.close();
  }
})();
