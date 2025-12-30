import type { Client } from "pg";
import type { UserRepo } from "../users/users.types.js";
import { UserRepository } from "../users/users.repository.js";
import { pgClient } from "../../../Config/Db.js";

export class AuthRepository {
  public userRepo: UserRepo = new UserRepository(pgClient);

  constructor(private db: Client) {}

  async findUserByEmail(email: string) {
    const result = await this.db.query(
      "SELECT id, password, role FROM users WHERE email=$1",
      [email]
    );
    return result.rows[0] || null;
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    await this.db.query(
      "INSERT INTO refresh_tokens(user_id, token) VALUES($1, $2)",
      [userId, refreshToken]
    );
  }

  async revokeRefreshToken(token: string) {
    await this.db.query("DELETE FROM refresh_tokens WHERE token=$1", [token]);
  }

  async findRefreshToken(token: string) {
    const result = await this.db.query(
      "SELECT user_id FROM refresh_tokens WHERE token=$1",
      [token]
    );
    return result.rows[0] || null;
  }
}
