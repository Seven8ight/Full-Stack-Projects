import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { verifyUser } from "../../Middleware/Authentication.js";
import type { PublicUser } from "../users/user.types.js";
import { FeedbackRepo } from "./feedback.repository.js";
import { FeedbackServ } from "./feedback.service.js";
import { BlogServ } from "../blogs/blog.service.js";
import {
  expireResource,
  getResource,
  setResource,
} from "../../Config/Cache.js";

export const FeedbackController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  let requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => (unparsedReqBody += data.toString()));

  request.on("end", async () => {
    const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

    const feedbackRepo = new FeedbackRepo(database),
      feedbackServ = new FeedbackServ(feedbackRepo);

    try {
      const user = verifyUser(request, response) as PublicUser;

      switch (request.method) {
        case "GET":
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (type == "blog") {
            const blogId = parsedReqBody.blog_id;

            if (!blogId) {
              response.writeHead(404, {
                "content-type": "application/json",
              });
              response.end(
                JSON.stringify({
                  error: "Blog id not provided",
                }),
              );

              return;
            }

            const blogFeedbackInCache = await getResource(`feedback:${blogId}`);
            let responseBody;

            if (!blogFeedbackInCache) {
              const blogFeedback = await feedbackServ.getBlogFeedback(blogId);

              await setResource(`feedback:${blogId}`, blogFeedback, "other");

              responseBody = blogFeedback;
            } else responseBody = blogFeedbackInCache;

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(responseBody));
          } else if (type == "user") {
            const userId = user.id;
            let responseBody: any;

            const userFeedbackInCache = await getResource(
              `user_feedback:${userId}`,
            );

            if (!userFeedbackInCache) {
              const userFeedback =
                await feedbackServ.getFeedbackByUserId(userId);

              await setResource(
                `user_feedback:${userId}`,
                userFeedback,
                "other",
              );

              responseBody = userFeedback;
            } else responseBody = userFeedbackInCache;

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(responseBody));
          }

          const retrieveComment = await feedbackServ.getFeedbackByUserId(
            user.id,
          );

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(retrieveComment));

          break;
        case "POST":
          const newComment = await feedbackServ.createFeedback(
            user.id,
            parsedReqBody,
          );

          response.writeHead(201, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(newComment));

          break;
        case "PATCH":
          const patchedComment = await feedbackServ.editFeedback(
            user.id,
            parsedReqBody,
          );

          await expireResource(`user_feedback:${user.id}`, 1);
          await expireResource(`feedback:${parsedReqBody.blog_id}`, 1);

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(patchedComment));

          break;
        case "DELETE":
          await feedbackServ.deleteFeedback(parsedReqBody.id);

          response.writeHead(204);
          response.end();

          break;
        default:
          response.writeHead(404, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify({ error: "Unknown API route" }));

          break;
      }
    } catch (error) {
      response.writeHead(400, {
        "content-type": "application/json",
      });
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
