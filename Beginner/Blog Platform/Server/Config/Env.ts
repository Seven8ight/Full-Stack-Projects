import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url),
  __dirname = path.dirname(__filename);

dotenv.config({
  path: path.join(__dirname, ".env"),
});

export const POSTGRES_USERNAME = process.env.POSTGRES_USERNAME,
  POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD,
  POSTGRES_DATABASE = process.env.POSTGRES_DATABASE,
  SERVER_PORT = process.env.SERVER_PORT,
  JWT_ACCESS_TOKEN = process.env.JWT_ACCESS_TOKEN,
  JWT_REFRESH_TOKEN = process.env.JWT_REFRESH_TOKEN;
