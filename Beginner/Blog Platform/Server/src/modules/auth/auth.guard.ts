// src/modules/auth/auth.guard.ts

import type { IncomingMessage } from "http";
import { verifyAccessToken } from "./../../utils/Jwt.js";
import type { TokenPayload } from "./auth.types.js";

export interface AuthenticatedRequest extends IncomingMessage {
  user: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) throw new Error("Unauthorized");

  const token = authHeader.split(" ")[1];
  const payload = verifyAccessToken(token!);

  req.user = payload as TokenPayload;
}
