import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import {
  refreshAccessToken,
  verifyRefreshToken,
  type Token,
} from "../../../Utils/Jwt.js";
import { Warning } from "../../../Utils/Logger.js";
import type { User } from "../users/user.types.js";
import type {
  AuthRepository,
  createSessionDTO,
  loginUserDTO,
  registerUserDTO,
  Session,
  VerificationCode,
} from "./auth.types.js";
import { codeHash, compareHash, passwordHash } from "../../../Utils/Hash.js";

export class AuthRepo implements AuthRepository {
  constructor(private dbClient: Database) {}

  async registerUser(
    userData: registerUserDTO,
    type: "legacy" | "oauth",
    oauthProvider?: string,
  ): Promise<User> {
    const hashPassword = passwordHash(userData.password!);

    let formattedUserData: Record<string, any> = {};

    for (let [key, value] of Object.entries(userData)) {
      if (key == "password") formattedUserData["password_hash"] = hashPassword;
      else formattedUserData[key] = value;
    }

    try {
      let keys = Object.keys(formattedUserData),
        paramIndexes: string[] = [];

      for (let i = 0; i < Object.keys(userData).length; i++) {
        paramIndexes.push(`$${i + 1}`);
      }

      const registerUser = await this.dbClient.transaction(
        async (client: PoolClient) =>
          await client.query(
            type == "legacy"
              ? `INSERT INTO users(${keys.join(",")}) VALUES(${paramIndexes.join(",")}) RETURNING *`
              : `INSERT INTO users(${keys.join(",")},oauth,oauth_provider) VALUES(${paramIndexes.join(",")},$${paramIndexes.length + 1},$${paramIndexes.length + 2}) RETURNING *`,
            type == "legacy"
              ? [...Object.values(formattedUserData)]
              : [...Object.values(formattedUserData), true, oauthProvider],
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
      const loginUser: QueryResult<User & { password_hash: string }> =
        await this.dbClient.query(
          "SELECT * FROM users WHERE email=$1 or username=$2",
          [userCredentials.email, userCredentials.username],
        );

      if (loginUser.rowCount && loginUser.rowCount <= 0)
        throw new Error("User does not exist");

      const userBody = loginUser.rows[0]!;

      if (type == "legacy") {
        if (
          userBody.oauth == true ||
          userBody.oauth.toString().toLowerCase().includes("t")
        )
          throw new Error(
            `User is registered using oauth, try oauth authentication by ${userBody.oauth_provider}`,
          );

        let passwordValidation: boolean = compareHash(
          `${userCredentials.password!}`,
          userBody.password_hash,
        );

        if (passwordValidation) return userBody;
        else throw new Error("Incorrect password");
      } else return userBody;
    } catch (error) {
      Warning("Error occurred at auth repo login user");
      throw error;
    }
  }

  async generateAuthCodeForVerification(userId: string, code: number) {
    try {
      const hashedAuthCode = codeHash(code);

      const verificationBlock: QueryResult<VerificationCode> =
        await this.dbClient.transaction(
          async (client: PoolClient) =>
            await client.query(
              "INSERT INTO verification_codes(user_id,code) VALUES($1,$2) RETURNING *",
              [userId, hashedAuthCode],
            ),
        );

      return verificationBlock.rows[0]!;
    } catch (error) {
      throw error;
    }
  }

  async verifyAuthCodeForVerification(
    verificationId: string,
    userId: string,
    code: string,
  ) {
    try {
      const verificationRecord: QueryResult<VerificationCode> =
        await this.dbClient.query(
          "SELECT * FROM verification_codes WHERE id=$1 and user_id=$2",
          [verificationId, userId],
        );

      if (verificationRecord.rowCount && verificationRecord.rowCount <= 0)
        throw new Error("Verification record not found");

      const expiryDate = new Date(verificationRecord.rows[0]!.expired_at);

      if (expiryDate > new Date()) throw new Error("Code has expired");

      const comparison = compareHash(code, verificationRecord.rows[0]!.code);

      if (comparison) {
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            "UPDATE users SET is_verified=true WHERE id=$1",
            [userId],
          );
        });

        return true;
      } else return false;
    } catch (error) {
      throw error;
    }
  }

  async createSession(sessionData: createSessionDTO): Promise<void> {
    try {
      const refreshTokenHash = passwordHash(sessionData.refreshToken);

      let newSession: Record<string, any> = {};

      let allowedFields = [
        "user_id",
        "refresh_token_hash",
        "ip_address",
        "user_agent",
      ];

      for (let [key, value] of Object.entries(sessionData)) {
        if (allowedFields.includes(key)) newSession[key] = value;
      }

      newSession.refresh_token_hash = refreshTokenHash;

      let paramIndexes: string[] = [];

      for (
        let index: number = 1;
        index <= Object.keys(newSession).length;
        index++
      ) {
        paramIndexes.push(`$${index}`);
      }

      await this.dbClient.transaction(
        async (client: PoolClient) =>
          await client.query(
            `INSERT INTO sessions(${Object.keys(newSession).join(",")}) VALUES(${paramIndexes.join(",")})`,
            [...Object.values(newSession)],
          ),
      );
    } catch (error) {
      throw error;
    }
  }

  async retrieveSessions(userId: string): Promise<Session | Session[]> {
    try {
      const userSessions: QueryResult<Session> = await this.dbClient.query(
        "SELECT * FROM sessions where user_id=$1",
        [userId],
      );

      return userSessions.rows;
    } catch (error) {
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
