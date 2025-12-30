import { UserService } from "./users.service.js";
import { UserRepository } from "./users.repository.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { pgClient } from "../../../Config/Db.js";

export const userController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `${request.headers.host}`),
    params = requestUrl.pathname.split("/").filter(Boolean);

  let body = "";

  const userRepo = new UserRepository(pgClient),
    userService = new UserService(userRepo);

  request.on("data", (data: Buffer) => (body += data.toString()));

  request.on("end", async () => {
    switch (params[2]) {
      case "edit":
        if (request.method == "PATCH") {
          try {
          } catch (error) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: (error as Error).message,
              })
            );
          }
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use PATCH instead",
            })
          );
        }

        break;
      case "delete":
        if (request.method == "DELETE") {
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use DELETE instead",
            })
          );
        }

        break;
      case "find":
        if (request.method == "GET") {
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use GET instead",
            })
          );
        }

        break;
      default:
        response.writeHead(200);
        response.end(JSON.stringify("User index route"));

        break;
    }
  });
};
