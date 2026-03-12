import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { verifyUser } from "../../Middleware/Authentication.js";
import { CommentRepository } from "./comment.repository.js";
import { CommentServ } from "./comment.service.js";
import type { CommentService } from "./comment.types.js";
import type { PublicUser } from "../users/user.types.js";

export const CommentController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
  const user = verifyUser(request, response) as PublicUser;

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

    const commentRepo: CommentRepository = new CommentRepository(database),
      commentService: CommentService = new CommentServ(commentRepo);

    try {
      switch (request.method) {
        case "GET":
          const blogComments = commentService.getBlogComments(
            parsedReqBody.blog_id,
          );

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(blogComments));

          break;
        case "POST":
          const newComment = commentService.createComment(
            user.id,
            parsedReqBody,
          );

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(newComment));

          break;
        case "PATCH":
          const patchedComment = commentService.editComment(
            user.id,
            parsedReqBody,
          );

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(patchedComment));

          break;
        case "DELETE":
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (type == "one") {
            await commentService.deleteComment(parsedReqBody.id, user.id);

            response.writeHead(204);
            response.end();
          } else if (type == "user") {
            await commentService.deleteUserComments(user.id);

            response.writeHead(204);
            response.end();
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "No params passed in",
              }),
            );
          }

          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use either GET,POST,PATCH,DELETE",
            }),
          );

          break;
      }
    } catch (error) {}
  });
};
