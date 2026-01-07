import type { IncomingMessage, ServerResponse } from "node:http";
import { CommentRepository } from "./comments.repository.js";
import { CommentService } from "./comments.service.js";
import { pgClient } from "../../../Config/Db.js";
import { authenticateUser } from "../../middleware/Authentication.js";

export const CommentController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    params = requestUrl.pathname.split("/").filter(Boolean);

  const commentRepo: CommentRepository = new CommentRepository(pgClient),
    commentService: CommentService = new CommentService(commentRepo);

  let unParsedRequestBody = "",
    user = authenticateUser(request);

  request.on(
    "data",
    (data: Buffer) => (unParsedRequestBody += data.toString())
  );

  request.on("end", async () => {
    const parsedRequestBody = JSON.parse(unParsedRequestBody),
      userRequestBody = {
        author_id: (user as any).sub,
        ...parsedRequestBody,
      };

    switch (params[1]) {
      case "create":
        if (request.method != "POST") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method, use POST instead",
            })
          );
        }

        try {
          const createRequest = await commentService.createComment(
            userRequestBody
          );

          response.writeHead(201);
          response.end(JSON.stringify(createRequest));
        } catch (error) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: (error as Error).message,
            })
          );
        }
        break;
      case "edit":
        if (request.method != "PATCH") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method, use PATCH instead",
            })
          );
        }

        try {
          const editRequest = await commentService.editComment(userRequestBody);

          response.writeHead(201);
          response.end(JSON.stringify(editRequest));
        } catch (error) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: (error as Error).message,
            })
          );
        }
        break;
      case "get":
        if (request.method != "GET") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method, use GET instead",
            })
          );
        }

        try {
          const allComments = await commentService.getComments(
            parsedRequestBody.postId
          );

          response.writeHead(200);
          response.end(JSON.stringify(allComments));
        } catch (error) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: (error as Error).message,
            })
          );
        }
        break;
      case "delete":
        if (request.method != "DELETE") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method, use GET instead",
            })
          );
        }

        try {
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (type == "comment")
            await commentService.deleteComment(parsedRequestBody.commentId);
          else
            await commentService.deleteUserComments(parsedRequestBody.authorId);

          response.writeHead(204);
          response.end();
        } catch (error) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: (error as Error).message,
            })
          );
        }
        break;
    }
  });
};
