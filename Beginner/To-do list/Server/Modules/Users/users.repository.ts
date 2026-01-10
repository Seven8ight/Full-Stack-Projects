import type { Client, QueryResult } from "pg";
import type {
  createUserDTO,
  createUserType,
  loginType,
  tokens,
  updateUserDTO,
  User,
  UserRepo,
} from "./users.types.js";
import { errorMsg, warningMsg } from "../../Utils/Logger.js";
import { comparePasswordAndHash, hashPassword } from "../../Utils/Password.js";

export class UserRepository implements UserRepo {
  constructor(private pgClient: Client) {}

  async createUser(userData: createUserDTO, userType: createUserType) {
    try {
      let newUser: QueryResult<User>;

      if (userType.type == "legacy") {
        const hashedPassword = hashPassword(userData.password as string);

        newUser = await this.pgClient.query(
          `INSERT INTO users(username,email,password,profile_image,oauth) VALUES($1,$2,$3,$4,$5) RETURNING *`,
          [
            userData.username,
            userData.email,
            hashedPassword,
            userData.profileImage,
            false,
          ]
        );
      } else {
        newUser = await this.pgClient.query(
          `INSERT INTO user(username,email,profile_image,oauth,oauth_provider) RETURNING *`,
          [
            userData.username,
            userData.email,
            userData.profileImage,
            true,
            userData.oAuthProvider,
          ]
        );
      }

      if (newUser.rowCount && newUser.rowCount > 0) return newUser.rows[0]!;

      throw new Error("New user not created, try again");
    } catch (error) {
      errorMsg(`${(error as Error).message}`);
      warningMsg(`Error at creating user repo`);
      throw error;
    }
  }

  async loginUser(userData: createUserDTO, type: loginType) {
    try {
      const findUser: QueryResult<User> = await this.pgClient.query(
        "SELECT * FROM users WHERE email=$1 or username=$2",
        [userData.email, userData.username]
      );

      if (findUser.rowCount && findUser.rowCount > 0) {
        if (type == "legacy") {
          if (
            !comparePasswordAndHash(
              findUser.rows[0]?.password as string,
              userData.password as string
            )
          )
            throw new Error("Invalid password");
        }
        return findUser.rows[0] as User;
      }
      throw new Error("No user exists of such username or email");
    } catch (error) {
      warningMsg("Error at login repo");
      errorMsg(`${(error as Error).message}`);
      throw error;
    }
  }

  async editUser(userId: string, newUserData: updateUserDTO) {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newUserData)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const userUpdate: QueryResult<User> = await this.pgClient.query(
        `UPDATE users SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [userId, ...values]
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
        [userId]
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
