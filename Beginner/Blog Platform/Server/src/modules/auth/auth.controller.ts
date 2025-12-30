// src/modules/auth/auth.controller.ts

import type { IncomingMessage, ServerResponse } from "node:http";
import { AuthService } from "./auth.service.js";
import { AuthRepository } from "./auth.repository.js";
import { pgClient } from "../../../Config/Db.js";

export const authController = (
  request: IncomingMessage,
  response: ServerResponse
) => {
  const url = new URL(request.url!, `http://${request.headers.host}`);
  const path = url.pathname.split("/").filter(Boolean);
  let body = "";

  const repo = new AuthRepository(pgClient);
  const service = new AuthService(repo);

  request.on("data", (chunk) => (body += chunk.toString()));

  request.on("end", async () => {
    try {
      switch (path[1]) {
        case "login":
          if (request.method !== "POST")
            return methodNotAllowed(response, "POST");

          const loginData = JSON.parse(body),
            tokens = await service.login(loginData);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(tokens));
          break;

        case "register":
          if (request.method !== "POST")
            return methodNotAllowed(response, "POST");

          const registerData = JSON.parse(body),
            newTokens = await service.register(registerData);

          response.writeHead(201, { "Content-Type": "application/json" });
          response.end(JSON.stringify(newTokens));

          break;

        case "refresh":
          if (request.method !== "POST")
            return methodNotAllowed(response, "POST");
          const { refreshToken } = JSON.parse(body),
            refreshed = await service.refresh(refreshToken);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(refreshed));

          break;

        default:
          response.writeHead(404);
          response.end(JSON.stringify({ message: "Route not found" }));
      }
    } catch (err) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: (err as Error).message }));
    }
  });
};

function methodNotAllowed(res: ServerResponse, method: string) {
  res.writeHead(405, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: `Use ${method}` }));
}
