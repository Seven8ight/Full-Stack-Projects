import { IncomingMessage, ServerResponse } from "node:http";
import Routes from "./routes.js";

export default function Router(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) {
  response.setHeader(
    "Access-Control-Allow-Origin",
    "https://task-flow-s8.up.railway.app",
  );
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
      "Access-Control-Allow-Origin": "https://task-flow-s8.up.railway.app",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
    });
    return response.end();
  }

  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathName = requestUrl.pathname.split("/").filter(Boolean);

  const matchedRoute = Routes().find(
    (route) => pathName[1]?.toLowerCase() === route.pathname,
  );

  if (matchedRoute) {
    matchedRoute.controller(request, response);
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Invalid route path" }));
  }
}
