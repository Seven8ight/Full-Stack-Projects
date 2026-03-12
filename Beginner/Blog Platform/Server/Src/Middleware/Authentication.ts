import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyAccessToken } from "../../Utils/Jwt.js";

export const verifyUser = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ): any => {
    const { authorization } = request.headers;

    if (!authorization) {
      response.writeHead(401, {
        "content-type": "application/json",
      });
      response.end(
        JSON.stringify({
          error: "Token not provided",
        }),
      );
      return;
    }

    try {
      const user = verifyAccessToken(authorization.split(" ").at(1) as string);

      return user;
    } catch (error) {
      throw error;
    }
  },
  roleChecker = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => {};
