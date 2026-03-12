import { DATABASE_URL } from "./Env.js";
import { Pool, type PoolClient, type QueryResult } from "pg";

export const pgPool = new Pool({
  connectionString: DATABASE_URL!,
});

export class Database {
  constructor(public pool: Pool) {}

  async query(statement: string, args: any[] = []): Promise<QueryResult<any>> {
    return this.pool.query(statement, args);
  }

  async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

export const dbClient = new Database(pgPool);
