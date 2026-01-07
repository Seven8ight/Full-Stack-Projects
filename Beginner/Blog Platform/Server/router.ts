import type { IncomingMessage, ServerResponse } from "node:http";
import { routes } from "./routes.js";

export default function Router(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathName = requestUrl.pathname.split("/").filter(Boolean);

  const matchedRoute = routes.find(
    (route) => pathName[0]?.toLowerCase() === route.pathname
  );

  // 2. Execute the controller if found, otherwise send 404 once
  if (matchedRoute) {
    matchedRoute.controller(request, response);
  } else {
    response.writeHead(404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ message: "Invalid route path" }));
  }
}
