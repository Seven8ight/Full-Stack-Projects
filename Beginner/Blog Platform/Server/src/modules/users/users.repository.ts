import type { Client, QueryResult } from "pg";
import { error as ErrorLog } from "../../utils/Logger.js";
import bcrypt from "bcryptjs";
import {
  type UserRepo,
  type User,
  type userDTO,
  type PublicUser,
} from "./users.types.js";
import { hashPassword } from "../auth/password.js";

export class UserRepository implements UserRepo {
  constructor(private db: Client) {}

  async createUser(userDetails: User): Promise<userDTO | null> {
    try {
      const { username, email, password, role } = userDetails;

      const userCreation: QueryResult<userDTO> = await this.db.query(
        `INSERT INTO users(username,email,password,role) VALUES($1,$2,$3,$4) RETURNING *`,
        [username, email, password, role]
      );

      return userCreation.rows[0] as userDTO;
    } catch (error) {
      ErrorLog(`${(error as Error).message}`);
      return null;
    }
  }

  async editUser(
    userId: string,
    newUserDetails: Partial<User>
  ): Promise<Omit<userDTO, "password" | "created_at" | "updated_at"> | null> {
    try {
      const date = new Date();

      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newUserDetails)) {
        if (key.toLowerCase() == "password") value = await hashPassword(value);

        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      keys.push(`updated_at=$${paramIndex++}`);
      values.push(date.toUTCString());

      const editQuery: QueryResult<User> = await this.db.query(
        `UPDATE users SET ${keys.join(", ")} WHERE id=$1 RETURNING *`,
        [userId, ...values]
      );

      if (editQuery.rowCount == 0) return null;

      const { id, email, username, role } = editQuery.rows[0] as userDTO;
      return { id, email, username, role };
    } catch (error) {
      ErrorLog(`Create user error: ${(error as Error).message}`);
      return null;
    }
  }

  async findById(userId: string): Promise<PublicUser | null> {
    try {
      const getUserQuery: QueryResult<PublicUser> = await this.db.query(
        `SELECT * FROM users WHERE id=$1`,
        [userId]
      );

      if (getUserQuery.rowCount && getUserQuery.rowCount > 0) {
        const { username, id, email, role } = getUserQuery
          .rows[0] as PublicUser;

        return { id, username, email, role };
      }

      return null;
    } catch (error) {
      ErrorLog(`Get user error: ${(error as Error).message}`);
      return null;
    }
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    try {
      const getUserQuery: QueryResult<userDTO> = await this.db.query(
        `SELECT * FROM users WHERE email=$1`,
        [email]
      );

      if (getUserQuery.rowCount && getUserQuery.rowCount > 0) {
        const { username, id, email, role } = getUserQuery
          .rows[0] as PublicUser;

        return { id, username, email, role };
      }

      return null;
    } catch (error) {
      ErrorLog(`Get user error: ${(error as Error).message}`);
      return null;
    }
  }

  async deleteUser(userId: string): Promise<boolean> {
    try {
      const deleteUserQuery: QueryResult<any> = await this.db.query(
        `DELETE FROM users WHERE id=$1`,
        [userId]
      );

      if (deleteUserQuery.rowCount && deleteUserQuery.rowCount > 0) return true;

      return false;
    } catch (error) {
      ErrorLog(`Get user error: ${(error as Error).message}`);
      return false;
    }
  }
}
