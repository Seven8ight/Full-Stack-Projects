import JWT from "jsonwebtoken";
import {
  JWT_ACCESS_TOKEN as jwtPrivateAccessSignature,
  JWT_REFRESH_TOKEN as jwtPrivateRefreshSignature,
} from "../../Config/Env.js";

export const generateTokens = (payload: Object) => {
    const accessToken = JWT.sign(payload, jwtPrivateAccessSignature!, {
        expiresIn: "15m",
      }),
      refreshToken = JWT.sign(payload, jwtPrivateRefreshSignature!, {
        expiresIn: "7d",
      });

    return {
      accessToken,
      refreshToken,
    };
  },
  verifyAccessToken = (accessToken: string): Object | null => {
    try {
      const verifier = JWT.verify(accessToken, jwtPrivateAccessSignature!);

      return verifier;
    } catch (error) {
      process.stdout.write(
        `JWT access token verification error: ${(error as Error).message}`
      );
      return null;
    }
  },
  refreshToken = (refreshToken: string): Object | null => {
    try {
      const verifier = JWT.verify(refreshToken, jwtPrivateRefreshSignature!);

      return generateTokens(verifier);
    } catch (error) {
      process.stdout.write(
        `JWT access token verification error: ${(error as Error).message}`
      );
      return null;
    }
  };
