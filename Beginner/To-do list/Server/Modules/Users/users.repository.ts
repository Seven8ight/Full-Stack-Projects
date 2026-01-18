import type { Client, QueryResult } from "pg";
import type { updateUserDTO, User, UserRepo } from "./users.types.js";
import { warningMsg } from "../../Utils/Logger.js";
import { hashPassword } from "../../Utils/Password.js";

export class UserRepository implements UserRepo {
  constructor(private pgClient: Client) {}

  async editUser(userId: string, newUserData: updateUserDTO) {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newUserData)) {
        if (key == "password") value = hashPassword(value);

        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const userUpdate: QueryResult<User> = await this.pgClient.query(
        `UPDATE users SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [userId, ...values],
      );

      if (userUpdate.rowCount && userUpdate.rowCount > 0)
        return userUpdate.rows[0]!;

      throw new Error(`User does not exist of id, ${userId}`);
    } catch (error) {
      warningMsg("Edit user repo error occurred");
      throw error;
    }
  }

  async getUser(userId: string) {
    try {
      const userRetrieval: QueryResult<User> = await this.pgClient.query(
        "SELECT * FROM users WHERE id=$1",
        [userId],
      );

      if (userRetrieval.rowCount && userRetrieval.rowCount > 0)
        return userRetrieval.rows[0]!;
      throw new Error("User does not exist");
    } catch (error) {
      warningMsg("Get user repo error occurred");
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      await this.pgClient.query(`DELETE FROM users WHERE id=$1`, [userId]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
}
