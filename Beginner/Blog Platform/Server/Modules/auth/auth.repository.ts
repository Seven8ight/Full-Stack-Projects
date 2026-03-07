import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import { refreshAccessToken, type Token } from "../../Utils/Jwt.js";
import { Warning } from "../../Utils/Logger.js";
import type { User } from "../users/user.types.js";
import type {
  AuthRepository,
  loginUserDTO,
  registerUserDTO,
  Session,
} from "./auth.types.js";
import { compareHash } from "../../Utils/Hash.js";

export class AuthRepo implements AuthRepository {
  constructor(private dbClient: Database) {}

  async registerUser(
    userData: registerUserDTO,
    type: "legacy" | "oauth",
    oauthProvider?: string,
  ): Promise<User> {
    try {
      let keys = Object.keys(userData),
        paramIndexes: string[] = [];

      for (let i = 0; i < Object.keys(userData).length; i++) {
        paramIndexes.push(`${i + 1}`);
      }

      const registerUser = await this.dbClient.transaction(
        async (client: PoolClient) =>
          await client.query(
            type == "legacy"
              ? `INSERT INTO users(${keys.join(",")}) VALUES(${paramIndexes.join(",")})`
              : `INSERT INTO users(${keys.join(",")},oauth,oauth_provider) VALUES(${paramIndexes.join(",")},$${paramIndexes.length},$${paramIndexes.length + 1})`,
            type == "legacy"
              ? [Object.values(userData)]
              : [Object.values(userData), true, oauthProvider],
          ),
      );

      return registerUser.rows[0];
    } catch (error) {
      Warning("Error occurred at auth repo register user");
      throw error;
    }
  }

  async loginUser(
    userCredentials: loginUserDTO,
    type: "legacy" | "oauth",
  ): Promise<User> {
    try {
      const loginUser: QueryResult<User> = await this.dbClient.query(
        "SELECT * FROM users WHERE email=$1 or username=$2",
        [userCredentials.email, userCredentials.username],
      );

      if (loginUser.rowCount && loginUser.rowCount <= 0)
        throw new Error("User does not exist");

      const userBody: User = loginUser.rows[0]!;

      if (type == "legacy") {
        if (
          userBody.oauth.toLowerCase() == "true" ||
          userBody.oauth.toLowerCase().includes("t")
        )
          throw new Error(
            `User is registered using oauth, try oauth authentication by ${userBody.oauth_provider}`,
          );

        let passwordValidation: boolean = compareHash(
          userCredentials.password!,
          userBody.password,
        );

        if (passwordValidation) return userBody;
        else throw new Error("Incorrect password");
      } else return userBody;
    } catch (error) {
      Warning("Error occurred at auth repo login user");
      throw error;
    }
  }

  async refreshAuthToken(userId: string, refreshToken: string): Promise<Token> {
    try {
      const sessions: QueryResult<Session> = await this.dbClient.query(
        "SELECT * FROM sessions WHERE user_id=$1",
        [userId],
      );

      let currentSession: Session | null = null;

      for (let session of sessions.rows) {
        let tokenComparison = compareHash(
          refreshToken,
          session.refresh_token_hash,
        );

        if (tokenComparison) {
          currentSession = session;
          break;
        }
      }

      if (!currentSession)
        throw new Error("Invalid session re-authenticate yourself");

      return refreshAccessToken(refreshToken);
    } catch (error) {
      Warning("Error occurred at auth repo refresh auth token");
      throw error;
    }
  }

  async logOut(userId: string, refreshToken: string): Promise<void> {
    try {
      const date = new Date();

      const sessions: QueryResult<Session> = await this.dbClient.query(
        "SELECT * FROM sessions WHERE user_id=$1",
        [userId],
      );

      let currentSession: Session | null = null;

      for (let session of sessions.rows) {
        let tokenComparison = compareHash(
          refreshToken,
          session.refresh_token_hash,
        );

        if (tokenComparison) {
          currentSession = session;
          break;
        }
      }

      if (!currentSession)
        throw new Error("Invalid session re-authenticate yourself");

      await this.dbClient.query(
        "UPDATE sessions SET revoked_at=$1 WHERE user_id=$2 AND refresh_token_hash=$3",
        [date.toUTCString(), userId, currentSession.refresh_token_hash],
      );
    } catch (error) {
      Warning("Error at logging out one device repo");
      throw error;
    }
  }

  async logOutAllDevices(userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.dbClient.query(
        "UPDATE sessions SET revoked_at=$1 WHERE user_id=$2",
        [date.toUTCString(), userId],
      );
    } catch (error) {
      Warning("Error at logging out all devices");
      throw error;
    }
  }
}
