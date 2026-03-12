import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { verifyUser } from "../../Middleware/Authentication.js";
import type { PublicUser } from "../users/user.types.js";
import { FeedbackRepo } from "./feedback.repository.js";
import { FeedbackServ } from "./feedback.service.js";

export const FeedbackController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => (unparsedReqBody += data.toString()));

  request.on("end", async () => {
    const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

    const feedbackRepo = new FeedbackRepo(database),
      feedbackServ = new FeedbackServ(feedbackRepo);

    try {
      const user = verifyUser(request, response) as PublicUser;

      switch (request.method) {
        case "GET":
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
