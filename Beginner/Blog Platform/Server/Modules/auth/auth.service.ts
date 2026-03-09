import { generateToken, type Token, type Tokens } from "../../Utils/Jwt.js";
import { Warning } from "../../Utils/Logger.js";
import type { PublicUser, User } from "../users/user.types.js";
import type { AuthRepo } from "./auth.repository.js";
import type {
  AuthServ,
  loginUserDTO,
  registerUserDTO,
  Session,
} from "./auth.types.js";

export class AuthService implements AuthServ {
  constructor(private authRepo: AuthRepo) {}

  protected createPublicUser(userData: User): PublicUser {
    const forbidden = new Set(["password", "oauth"]),
      filterUserData = Object.fromEntries(
        Object.entries(userData).filter(([key]) => !forbidden.has(key)),
      );

    return filterUserData as PublicUser;
  }

  async registerUser(
    userData: registerUserDTO,
    type: "legacy" | "oauth",
    oauthProvider?: string,
  ): Promise<Tokens> {
    try {
      if (!userData.email || !userData.username || !userData.password)
        throw new Error("Email, username and password should be provided");

      if (type == "legacy") {
        const allowedFields: Set<string> = new Set([
          "username",
          "email",
          "password",
        ]);

        let newUserData: Record<string, any> = {};

        for (let [key, value] of Object.entries(userData)) {
          if (allowedFields.has(key)) newUserData[key] = value;
        }

        const newUser = await this.authRepo.registerUser(
            newUserData as registerUserDTO,
            "legacy",
          ),
          newUserTokens = generateToken(this.createPublicUser(newUser));

        await this.authRepo.createSession({
          ...userData,
          refreshToken: newUserTokens.refreshToken,
        });

        return newUserTokens;
      } else {
        let newUserData = {
          ...userData,
          oauth: "true",
          oauth_provider: oauthProvider,
        };

        const newUser = await this.authRepo.registerUser(
            newUserData as registerUserDTO,
            "oauth",
          ),
          newUserTokens = generateToken(this.createPublicUser(newUser));

        return newUserTokens;
      }
    } catch (error) {
      throw error;
    }
  }

  async loginUser(
    userCredentials: loginUserDTO,
    type: "legacy" | "oauth",
  ): Promise<Tokens> {
    if (!userCredentials.email && !userCredentials.username)
      throw new Error("Email or username must be provided");

    try {
      const loginProcess = await this.authRepo.loginUser(userCredentials, type),
        userLogged = generateToken(loginProcess);

      await this.authRepo.createSession({
        user_id: loginProcess.id,
        refreshToken: userLogged.refreshToken,
        ip_address: userCredentials.ip_address, // Pull from input
        user_agent: userCredentials.user_agent, // Pull from input
      });

      return userLogged;
    } catch (error) {
      Warning("Error at auth service, logging user in");
      throw error;
    }
  }

  async refreshAuthToken(userId: string, refreshToken: string): Promise<Token> {
    if (!userId || !refreshToken)
      throw new Error("User id and refreshToken must be provided");

    try {
      const refresh = await this.authRepo.refreshAuthToken(
        userId,
        refreshToken,
      );

      return refresh;
    } catch (error) {
      throw error;
    }
  }

  async logOut(userId: string, refreshToken: string): Promise<void> {
    if (!userId || !refreshToken)
      throw new Error("User id and refreshToken must be provided");

    try {
      await this.authRepo.logOut(userId, refreshToken);
    } catch (error) {
      Warning("Error at logging user out");
      throw error;
    }
  }

  async logOutAllDevices(userId: string): Promise<void> {
    if (!userId) throw new Error("User id must be provided");

    try {
      await this.authRepo.logOutAllDevices(userId);
    } catch (error) {
      Warning("Error at logging user out of all devices");
      throw error;
    }
  }

  async retrieveSessions(userId: string): Promise<Session | Session[]> {
    if (!userId) throw new Error("User id must be provided");

    try {
      const userSessions = await this.authRepo.retrieveSessions(userId);

      return userSessions;
    } catch (error) {
      throw error;
    }
  }

  async verifyUser(userId: string, status: boolean): Promise<void> {
    if (!userId || !status)
      throw new Error("User id and status must be provided");

    try {
      await this.authRepo.verifyUser(userId, status);
    } catch (error) {
      Warning("Error at verification step service");
      throw error;
    }
  }
}
