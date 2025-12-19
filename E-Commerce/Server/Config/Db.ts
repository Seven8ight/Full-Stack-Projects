import {
  POSTGRES_DB,
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
} from "./../Utils/Env.js";
import { Client } from "pg";

export const pgClient = new Client({
  port: 5432,
  user: POSTGRES_USERNAME,
  password: POSTGRES_PASSWORD,
  database: POSTGRES_DB,
});

export async function connectDb() {
  await pgClient.connect();
}
