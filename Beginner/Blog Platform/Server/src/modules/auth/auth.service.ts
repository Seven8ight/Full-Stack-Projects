import { AuthRepository } from "./auth.repository.js";
import {
  generateTokens,
  refreshToken as rfToken,
  verifyRefreshToken,
} from "../../utils/Jwt.js";
import { comparePassword, hashPassword } from "./password.js";
import type { RegisterDTO, LoginDTO, AuthTokens } from "./auth.types.js";

export class AuthService {
  constructor(private authRepo: AuthRepository) {}

  async register(data: RegisterDTO): Promise<AuthTokens> {
    const hashedPassword = await hashPassword(data.password);

    const user = await this.authRepo.findUserByEmail(data.email);
    if (user) throw new Error(`User of email ${data.email} already exists`);

    const userCreation = await this.authRepo.userRepo.createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: "user",
    });

    if (userCreation) return generateTokens(userCreation);
    throw new Error("The user has not been created");
  }

  async login(data: LoginDTO): Promise<AuthTokens> {
    const user = await this.authRepo.findUserByEmail(data.email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await comparePassword(data.password, user.password);
    if (!valid) throw new Error("Invalid credentials");

    const date = new Date();
    date.setDate(date.getDate() + 7);

    const tokens = generateTokens({ sub: user.id, role: user.role });
    await this.authRepo.storeRefreshToken(
      user.id,
      tokens.refreshToken,
      date.toUTCString()
    );

    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const stored = await this.authRepo.findRefreshToken(refreshToken);

    if (!stored) throw new Error("Invalid refresh token");

    const userObject = verifyRefreshToken(refreshToken);

    if (userObject == null) {
      await this.authRepo.revokeRefreshToken(refreshToken);
      throw new Error("Invalid refresh Token passed in");
    }

    const payload = rfToken(refreshToken);
    const newTokens = generateTokens(payload as Object);

    const date = new Date();
    date.setDate(date.getDate() + 7);

    await this.authRepo.revokeRefreshToken(refreshToken);

    await this.authRepo.storeRefreshToken(
      (userObject as any).sub,
      newTokens.refreshToken,
      date.toUTCString()
    );

    return newTokens;
  }
}
