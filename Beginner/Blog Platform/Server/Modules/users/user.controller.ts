import type { IncomingMessage, ServerResponse } from "node:http";
import { UserRepo } from "./user.repository.js";
import { UserService } from "./user.service.js";
import type { Database } from "../../Config/Database.js";
import { verifyAccessToken } from "../../Utils/Jwt.js";
import type { PublicUser } from "./user.types.js";

export const UserController = async (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const { authorization } = request.headers;

  if (!authorization) {
    response.writeHead(401);
    response.end(JSON.stringify({ error: "Authorization token not provided" }));
    return;
  }

  const userObject = verifyAccessToken(authorization),
    userId = (userObject as PublicUser).id;

  const userRepo = new UserRepo(Database),
    userService = new UserService(userRepo);

  try {
    switch (request.method) {
      case "GET":
        const user = await userService.getUser(userId);

        response.writeHead(200);
        response.end(JSON.stringify(user));
        break;
      case "PATCH":
        let unparsedRequestBody: string = "";

        request.on("data", (data: Buffer) => {
          unparsedRequestBody += data.toString();
        });

        request.on("end", async () => {
          const parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

          const userUpdate = await userService.editUser(
            userId,
            parsedRequestBody,
          );

          response.writeHead(200);
          response.end(JSON.stringify(userUpdate));
        });

        break;
      case "DELETE":
        await userService.deleteUser(userId);

        response.writeHead(204);
        response.end(JSON.stringify("Delete user"));
        break;
      default:
        response.writeHead(404);
        response.end(JSON.stringify({ error: "Invalid http Method" }));

        break;
    }
  } catch (error) {
    response.writeHead(400);
    response.end({
      error: (error as Error).message,
    });
  }
};
