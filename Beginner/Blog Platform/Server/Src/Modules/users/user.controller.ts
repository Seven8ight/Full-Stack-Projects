import type { IncomingMessage, ServerResponse } from "node:http";
import { UserRepo } from "./user.repository.js";
import { UserService } from "./user.service.js";
import type { Database } from "../../Config/Database.js";
import type { PublicUser } from "./user.types.js";
import { verifyUser } from "../../Middleware/Authentication.js";
import {
  expireResource,
  getResource,
  sanitizeForCache,
  setResource,
} from "../../Config/Cache.js";

export const UserController = async (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const user = verifyUser(request, response) as PublicUser;

  const userRepo = new UserRepo(Database),
    userService = new UserService(userRepo);

  try {
    switch (request.method) {
      case "GET":
        let userInCache = await getResource(`user:${user.id}`),
          responseData: Record<string, any>;

        if (!userInCache) {
          const userObject = await userService.getUser(user.id),
            cacheObject = sanitizeForCache(userObject);

          await setResource(`user:${user.id}`, cacheObject, "other");

          responseData = userObject;
        } else responseData = userInCache;

        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify(responseData));

        break;
      case "PATCH":
        let unparsedRequestBody: string = "";

        request.on("data", (data: Buffer) => {
          unparsedRequestBody += data.toString();
        });

        request.on("end", async () => {
          try {
            const parsedRequestBody = JSON.parse(unparsedRequestBody || "{}");

            const userUpdate = await userService.editUser(
                user.id,
                parsedRequestBody,
              ),
              cacheObject = sanitizeForCache(userUpdate);

            await setResource(`user:${user.id}`, cacheObject, "other");

            response.writeHead(200);
            response.end(JSON.stringify(userUpdate));
          } catch (error) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: `${(error as Error).message}`,
              }),
            );
          }
        });

        break;
      case "DELETE":
        await userService.deleteUser(user.id);

        await expireResource(`user:${user.id}`, 5);

        response.writeHead(204);
        response.end();

        break;
      default:
        response.writeHead(404);
        response.end(JSON.stringify({ error: "Invalid http Method" }));

        break;
    }
  } catch (error) {
    response.writeHead(400);
    response.end(
      JSON.stringify({
        error: (error as Error).message,
      }),
    );
  }
};
