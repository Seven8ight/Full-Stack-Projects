import type { IncomingMessage, ServerResponse } from "node:http";
import { UserRepo } from "./user.repository.js";
import { UserService } from "./user.service.js";
import type { Database } from "../../Config/Database.js";
import type { PublicUser } from "./user.types.js";
import { verifyUser } from "../../Middleware/Authentication.js";

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
        const userObject = await userService.getUser(user.id);

        response.writeHead(200);
        response.end(JSON.stringify(userObject));

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
            );

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
