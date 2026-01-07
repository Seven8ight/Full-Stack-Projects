import type { IncomingMessage, Server, ServerResponse } from "node:http";
import { verifyAccessToken } from "../utils/Jwt.js";

export const authenticateUser = (request: IncomingMessage) => {
    const { authorization } = request.headers;

    if (!authorization) return null;

    return verifyAccessToken(authorization);
  },
  adminCheck = (request: IncomingMessage) => {};
