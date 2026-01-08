import dotenv from "dotenv";
import path from "path";
import URL from "url";

const __filename = URL.fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const POSTGRES_USERNAME = process.env.PG_USERNAME,
  POSTGRES_DATABASE = process.env.PG_DATABASE,
  POSTGRES_PASSWORD = process.env.PG_PASSWORD,
  POSTGRES_PORT = process.env.PG_PORT;

export const SERVER_PORT = process.env.SERVER_PORT,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
