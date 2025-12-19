import JWT from "jsonwebtoken";
import { JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } from "../Utils/Env.js";
import type { IncomingMessage } from "http";

export type tokens = {
  accessToken: string;
  refreshToken: string;
};

const accessSignature = JWT_ACCESS_TOKEN,
  refreshSignature = JWT_REFRESH_TOKEN;

export const generateToken = (payload: Object): tokens | Error => {
    try {
      return {
        accessToken: JWT.sign(payload, accessSignature as string),
        refreshToken: JWT.sign(payload, refreshSignature as string),
      };
    } catch (error) {
      return error as Error;
    }
  },
  verifyAccessToken = (token: string): Object | Error => {
    try {
      const decryption = JWT.verify(token, accessSignature as string);

      if (decryption) return decryption;

      return "Invalid Access Token";
    } catch (error) {
      return error as Error;
    }
  },
  refreshAccessToken = (
    refreshToken: string
  ): string | Omit<tokens, "refreshToken"> | Error => {
    try {
      const verifyToken = JWT.verify(refreshToken, refreshSignature as string);

      if (verifyToken)
        return {
          accessToken: JWT.sign(verifyToken, accessSignature as string),
        };

      return "Refresh Token invalid, refresh failed";
    } catch (error) {
      return error as Error;
    }
  },
  userAuthenticate = (request: IncomingMessage) => {
    const { authorization } = request.headers;

    if (!authorization) throw new Error("User not found");

    const userObject = verifyAccessToken(authorization);

    if (!(userObject instanceof Error)) {
      return userObject;
    }
    throw new Error("Authentication failed due to token expiry");
  };
