// src/modules/auth/auth.guard.ts

import { verifyAccessToken } from "./../../utils/Jwt.js";
import type { TokenPayload, AuthenticatedRequest } from "./auth.types.js";

export function authenticate(req: AuthenticatedRequest) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token!);

  req.user = payload as TokenPayload;
}
