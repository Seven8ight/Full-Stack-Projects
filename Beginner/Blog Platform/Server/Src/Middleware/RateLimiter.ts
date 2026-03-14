import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyUser } from "./Authentication.js";
import type { PublicUser } from "../Modules/users/user.types.js";
import {
  getResource,
  incrementResource,
  expireResource,
  setResource,
} from "../Config/Cache.js";

const MAX_API_REQUESTS_PER_DAY = 100,
  WINDOW_SECONDS = 86400;

function rateKey(date: Date, userId: string): string {
  const day = date.getDate(),
    month = date.getMonth() + 1,
    year = date.getFullYear();

  return `rate:${day}-${month}-${year}:${userId}`;
}

export const RateLimiter = async (
  request: IncomingMessage,
  response: ServerResponse,
) => {
  try {
    const user = verifyUser(request, response) as PublicUser;
    const key = rateKey(new Date(), user.id);

    let requestCount = await getResource(key);

    if (!requestCount) {
      await setResource(key, 1, "rate");
      await expireResource(key, WINDOW_SECONDS);
      return;
    }

    const updatedCount = await incrementResource(key);

    if (updatedCount >= MAX_API_REQUESTS_PER_DAY) {
      response.writeHead(429, {
        "content-type": "application/json",
        "Retry-After": WINDOW_SECONDS.toString(),
      });

      response.end(
        JSON.stringify({
          error: "Max API calls exceeded. Try again tomorrow.",
        }),
      );

      return;
    }
  } catch (error) {
    throw error;
  }
};
