// src/modules/auth/auth.types.ts

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
  sub: string; // user id
  role: "user" | "admin";
};
