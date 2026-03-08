import type { IncomingMessage, ServerResponse } from "node:http";
import { RouteControllers } from "./Routes.js";
import { Database, pgPool } from "./Config/Database.js";

export default function Router(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS",
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.setHeader("Access-Control-Max-Age", "86400");

  if (request.method == "OPTIONS") {
    response.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    });
    return response.end();
  }

  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    apiRoute = pathNames[1];

  const database = new Database(pgPool);

  if (!apiRoute) {
    response.writeHead(404);
    response.end(
      JSON.stringify({
        error: "Not a valid route path",
      }),
    );
    return;
  }

  const matchedRoute = RouteControllers.find(
    (route) => route.name.toLowerCase() == apiRoute.toLowerCase(),
  );

  if (matchedRoute) return matchedRoute.controller(database, request, response);
  else {
    response.writeHead(404);
    response.end(JSON.stringify({ error: "Route does not exist" }));
    return;
  }
}
