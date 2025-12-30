import { IncomingMessage, ServerResponse } from "http";
import { UserService } from "./user.service.js";
import { UserRepository } from "./user.repo.js";
import { pgClient } from "../../Config/Db.js";
import { verifyAccessToken } from "../../Authentication/Auth.js";
import type { User } from "./user.types.js";

const userService = new UserService(new UserRepository(pgClient));

const authentication = (request: IncomingMessage) => {
  const { authorization } = request.headers;

  if (!authorization)
    throw new Error("Authentication Error: Authenticate first");
  else return verifyAccessToken(authorization);
};

export async function UserController(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) {
  const requestUrl = new URL(request.url!, "http://localhost:3000"),
    params = requestUrl.pathname.split("/").filter(Boolean);

  let body = "";

  request.on("data", (chunk: Buffer) => (body += chunk.toString()));

  request.on("end", async () => {
    let parsedBody;

    try {
      parsedBody = JSON.parse(body);
    } catch (e) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    try {
      switch (params[1]) {
        case "getuser":
          if (request.method !== "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                Error: "HTTP Error: Use get method instead",
              })
            );
            return;
          }

          const authenticate = authentication(request);

          if (!(authenticate instanceof Error)) {
            const { id } = authenticate as User,
              getProfile = await userService.getProfile(id);

            response.writeHead(200);
            response.end(JSON.stringify(getProfile));
          }

          break;
        case "register": {
          if (request.method !== "POST") {
            response.writeHead(405, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({ error: "Method not allowed. Use POST." })
            );
            return;
          }
          const token = await userService.register(parsedBody);

          response.writeHead(201, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ token }));

          break;
        }

        case "login": {
          if (request.method !== "POST") {
            response.writeHead(405, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({ error: "Method not allowed. Use POST." })
            );
            return;
          }

          const token = await userService.login(parsedBody); // ← Fixed: was register()

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ token }));

          break;
        }
        case "edit":
          if (request.method == "PATCH") {
            const userObject = authentication(request);

            if (userObject) {
              const editUser = await userService.editProfile(
                (userObject as User).id,
                parsedBody
              );

              response.writeHead(201);
              response.end(JSON.stringify(editUser));
            }
          } else {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                Error: "Invalid http method use PATCH instead",
              })
            );
            return;
          }
          break;
        case "deleteuser":
          if (request.method !== "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                Error: "Invalid http method use DELETE instead",
              })
            );
            return;
          }

          const deleteUserObject = authentication(request);

          if (deleteUserObject) {
            const { id } = parsedBody;

            if ((deleteUserObject as User).id == id) {
              await userService.deleteProfile(id);

              response.writeHead(204);
              response.end();
            }
          }
        default:
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({
              error:
                "Route not found. Available: /users/register, /users/login",
            })
          );
      }
    } catch (error) {
      console.error("UserController error:", error);

      const message = error instanceof Error ? error.message : "Unknown error",
        status =
          message.includes("already in use") || message.includes("Incomplete")
            ? 400
            : 500;

      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: message }));
    }
  });
}
