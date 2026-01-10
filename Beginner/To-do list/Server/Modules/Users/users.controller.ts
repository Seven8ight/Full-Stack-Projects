import type { IncomingMessage, ServerResponse } from "node:http";
import type { UserRepo, Userservice } from "./users.types.js";
import { UserRepository } from "./users.repository.js";
import { pgClient } from "../../Config/Database.js";
import { UserService } from "./users.service.js";
import { generateTokens, verifyAccessToken } from "../../Utils/Jwt.js";

export const UserController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    { authorization } = request.headers;

  let unparsedRequestBody: string = "",
    userId: string = "";

  if (!pathNames.includes("create") && !authorization) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        error: "Authentication header missing",
      })
    );
    return;
  }

  if (!pathNames.includes("create")) {
    const userVerifier = verifyAccessToken(
      authorization?.split(" ")[1] as string
    );

    if (!userVerifier) {
      response.writeHead(403);
      response.end(
        JSON.stringify({
          error: "Authentication failed, re-log in",
        })
      );
      return;
    }

    userId = userVerifier.id;
  }

  const UserRepo: UserRepo = new UserRepository(pgClient),
    Userservice: Userservice = new UserService(UserRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString())
  );

  request.on("end", async () => {
    try {
      const parsedRequestBody: any = JSON.parse(unparsedRequestBody);

      switch (pathNames[2]) {
        case "create":
          if (pathNames[3] == "legacy") {
            if (request.method !== "POST") {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  error: "Use Post instead on this route",
                })
              );
              return;
            }

            const createUser = await Userservice.createUser(parsedRequestBody, {
                type: "legacy",
              }),
              newUserTokens = generateTokens(createUser);

            response.writeHead(201);
            response.end(JSON.stringify(newUserTokens));
          } else if (pathNames[3] == "google") {
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Specify path either legacy or google",
              })
            );
          }

          break;
        case "edit":
          if (request.method != "PATCH") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use Patch instead",
              })
            );
            return;
          }

          await Userservice.editUser(userId, parsedRequestBody);

          response.writeHead(204);
          response.end(
            JSON.stringify({
              message: "Edit successful",
            })
          );

          break;
        case "get":
          if (request.method != "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use GET instead",
              })
            );
            return;
          }
          const userBody = await Userservice.getUser(userId);

          response.writeHead(200);
          response.end(JSON.stringify(userBody));

          break;
        case "delete":
          if (request.method != "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use DELETE instead",
              })
            );
            return;
          }

          await Userservice.deleteUser(userId);

          response.writeHead(204);
          response.end();
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        })
      );
    }
  });
};
