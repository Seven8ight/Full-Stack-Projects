// src/modules/auth/auth.types.ts
import { type IncomingMessage } from "node:http";

export interface AuthenticatedRequest extends IncomingMessage {
  user: TokenPayload;
}

export type RegisterDTO = {
  username: string;
  email: string;
  password: string;
};

export type LoginDTO = {
  email: string;
  password: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type TokenPayload = {
  userId: string; // user id
  role: "user" | "admin";
};
