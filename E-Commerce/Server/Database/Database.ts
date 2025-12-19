import { Client } from "pg";

export abstract class Database {
  protected pgClient: Client;

  constructor(client: Client) {
    this.pgClient = client;
  }

  protected async query(sql: string, params: string[]) {
    return this.pgClient.query(sql, params);
  }

  protected async transaction<T = any>(callback: () => Promise<T>) {
    try {
      await this.pgClient.query("BEGIN");
      const result = await callback();

      await this.pgClient.query("COMMIT");
      return result;
    } catch (error) {
      await this.pgClient.query("ROLLBACK");
      throw error;
    }
  }
}
