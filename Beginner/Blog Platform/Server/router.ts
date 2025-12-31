import type { IncomingMessage, ServerResponse } from "node:http";
import { SERVER_PORT } from "./Config/Env.js";

export default function Router(
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) {
  const requestUrl = new URL(request.url!, `http://localhost:${SERVER_PORT}`);
}
