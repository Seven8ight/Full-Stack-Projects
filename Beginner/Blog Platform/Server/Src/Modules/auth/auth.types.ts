import type { Token, Tokens } from "../../../Utils/Jwt.js";
import type { User } from "../users/user.types.js";

export type Session = {
  id: string;
  user_id: string;
  refresh_token_hash: string;
  ip_address: string;
  user_agent: string;
  expires_at: string;
  created_at: string;
  revoked_at: string;
};

export type createSessionDTO = Omit<
  Session,
  "expires_at" | "created_at" | "revoked_at" | "id" | "refresh_token_hash"
> & { refreshToken: string };

export type registerUserDTO = Pick<
  User,
  "username" | "email" | "profile_image_url"
> &
  Partial<User> &
  createSessionDTO;

export type loginUserDTO = (Pick<User, "username" | "email"> & Partial<User>) &
  createSessionDTO;

export type userType = "legacy" | "oauth";

export interface AuthRepository {
  registerUser: (
    userData: registerUserDTO,
    type: "legacy" | "oauth",
  ) => Promise<User>;
  loginUser: (
    userCredentials: loginUserDTO,
    type: "legacy" | "oauth",
  ) => Promise<User>;
  createSession: (session: createSessionDTO) => Promise<void>;
  retrieveSessions: (userId: string) => Promise<Session | Session[]>;
  refreshAuthToken: (userId: string, refreshToken: string) => Promise<Token>;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  logOut: (userId: string, refreshToken: string) => Promise<void>;
  logOutAllDevices: (userId: string) => Promise<void>;
}

export interface AuthServ {
  registerUser: (
    userData: registerUserDTO,
    type: "legacy" | "oauth",
    oauthProvider?: string,
  ) => Promise<Tokens>;
  loginUser: (
    userCredentials: loginUserDTO,
    type: "legacy" | "oauth",
  ) => Promise<Tokens>;
  refreshAuthToken: (userId: string, refreshToken: string) => Promise<Token>;
  verifyUser: (userId: string, status: boolean) => Promise<void>;
  logOut: (userId: string, refreshToken: string) => Promise<void>;
  logOutAllDevices: (userId: string) => Promise<void>;
}
