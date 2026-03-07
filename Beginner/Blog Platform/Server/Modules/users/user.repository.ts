import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type { User, updateUserDTO, UserRepository } from "./user.types.js";
import { Warning } from "../../Utils/Logger.js";

export class UserRepo implements UserRepository {
  constructor(private dbClient: Database) {}

  async editUser(userId: string, newUserData: updateUserDTO): Promise<User> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newUserData)) {
        keys.push(`${key}=${paramIndex++}`);
        values.push(value);
      }

      const editUser = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `UPDATE users SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
            [userId, values.join(",")],
          );
        },
      );

      return editUser.rows[0] as User;
    } catch (error) {
      Error("Error at editing user repo");
      throw error;
    }
  }
  async getUser(userId: string): Promise<User> {
    try {
      const getUser = await this.dbClient.query(
        "SELECT * FROM users WHERE id=$1",
        [userId],
      );

      return getUser.rows[0] as User;
    } catch (error) {
      Error("Error at retrieving the user");
      throw error;
    }
  }
  async deleteUser(userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.editUser(userId, {
        deleted_at: date.toUTCString(),
      });
    } catch (error) {
      Warning("Error at deleting user repo");
      throw error;
    }
  }
}
