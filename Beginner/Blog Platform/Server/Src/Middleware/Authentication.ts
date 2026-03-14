import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyAccessToken } from "../../Utils/Jwt.js";
import type { PublicUser } from "../Modules/users/user.types.js";

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
      response.writeHead(403);
      response.end(JSON.stringify({ error: (error as Error).message }));
    }
  },
  roleChecker = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => {
    try {
      const user = verifyUser(request, response) as PublicUser;

      return user.role;
    } catch (error) {
      throw error;
    }
  };
