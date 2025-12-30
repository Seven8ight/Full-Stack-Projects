import {
  POSTGRES_USERNAME,
  POSTGRES_PASSWORD,
  POSTGRES_DATABASE,
} from "./Env.js";
import { Client } from "pg";

export const pgClient = new Client({
    port: 5432,
    user: POSTGRES_USERNAME,
    password: POSTGRES_PASSWORD,
    database: POSTGRES_DATABASE,
  }),
  connectDb = async () => {
    await pgClient.connect();
  };
