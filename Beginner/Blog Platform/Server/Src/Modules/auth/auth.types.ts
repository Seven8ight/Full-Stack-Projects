import type { Token, Tokens } from "../../../Utils/Jwt.js";
import type { User } from "../users/user.types.js";

export type VerificationCode = {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  expired_at: string;
};
export type PublicVerificationCode = Omit<VerificationCode, "code">;

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
  logOut: (userId: string, refreshToken: string) => Promise<void>;
  logOutAllDevices: (userId: string) => Promise<void>;
  generateAuthCodeForVerification: (
    userId: string,
    code: number,
  ) => Promise<PublicVerificationCode>;
  verifyAuthCodeForVerification: (
    verificationId: string,
    userId: string,
    code: string,
  ) => Promise<boolean>;
}

export interface AuthServ {
  registerUser: (
    userData: registerUserDTO,
    type: "legacy" | "oauth",
    oauthProvider?: string,
  ) => Promise<{
    userTokens: Tokens;
    verificationBlock?: PublicVerificationCode;
  }>;
  loginUser: (
    userCredentials: loginUserDTO,
    type: "legacy" | "oauth",
  ) => Promise<Tokens>;
  refreshAuthToken: (userId: string, refreshToken: string) => Promise<Token>;
  logOut: (userId: string, refreshToken: string) => Promise<void>;
  logOutAllDevices: (userId: string) => Promise<void>;
  generateAuthCodeForVerification: (
    userId: string,
    code: number,
  ) => Promise<PublicVerificationCode>;
  verifyAuthCodeForVerification: (
    verificationId: string,
    userId: string,
    code: string,
  ) => Promise<boolean>;
}
