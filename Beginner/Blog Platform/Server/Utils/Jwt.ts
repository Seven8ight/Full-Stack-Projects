import JWT from "jsonwebtoken";
import { JWT_ACCESS_TOKEN, JWT_REFRESH_TOKEN } from "../Config/Env.js";

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

export type Token = {
  accessToken: string;
};

export const generateToken = (payload: Record<string, any>): Tokens => {
    const accessToken = JWT.sign(payload, JWT_ACCESS_TOKEN!, {
        expiresIn: "5min",
      }),
      refreshToken = JWT.sign(payload, JWT_REFRESH_TOKEN!, {
        expiresIn: "7d",
      });

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  },
  verifyAccessToken = (accessToken: string) => {
    try {
      return JWT.verify(accessToken, JWT_ACCESS_TOKEN!);
    } catch (error) {
      throw error;
    }
  },
  verifyRefreshToken = (refreshToken: string) => {
    try {
      return JWT.verify(refreshToken, JWT_REFRESH_TOKEN!);
    } catch (error) {
      throw error;
    }
  },
  refreshAccessToken = (refreshToken: string) => {
    try {
      const payload = verifyRefreshToken(refreshToken),
        newAccessToken = JWT.sign(payload, JWT_ACCESS_TOKEN!);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      throw error;
    }
  };
