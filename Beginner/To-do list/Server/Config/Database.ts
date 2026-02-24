import pg from "pg";
import { DATABASE_URL, LOCAL_DATABASE_URL } from "./Env.js";

export const pgClient = new pg.Client({
  connectionString: DATABASE_URL || LOCAL_DATABASE_URL,
  ssl:
    process.env.NODE_ENV == "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

export const connectToDatabase = async () => await pgClient.connect();
