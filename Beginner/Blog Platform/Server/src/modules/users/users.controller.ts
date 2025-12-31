import { UserService } from "./users.service.js";
import { UserRepository } from "./users.repository.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { pgClient } from "../../../Config/Db.js";
import type { AuthenticatedRequest } from "../auth/auth.types.js";
import { PostRepository } from "../posts/posts.repository.js";
import { PostService } from "../posts/posts.service.js";
import { CommentRepository } from "../comments/comments.repository.js";
import { CommentService } from "../comments/comments.service.js";

export const userController = (
  request: AuthenticatedRequest,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `${request.headers.host}`),
    params = requestUrl.pathname.split("/").filter(Boolean);

  let body = "";

  const user = request.user,
    userRepo = new UserRepository(pgClient),
    userService = new UserService(userRepo);

  request.on("data", (data: Buffer) => (body += data.toString()));

  request.on("end", async () => {
    const parsedBody = JSON.parse(body);

    switch (params[2]) {
      case "edit":
        if (request.method == "PATCH") {
          try {
            const editRequest = await userService.editUser(
              user.userId,
              parsedBody
            );

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
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use PATCH instead",
            })
          );
        }

        break;
      case "delete":
        if (request.method == "DELETE") {
          const postRepo: PostRepository = new PostRepository(pgClient),
            postService: PostService = new PostService(postRepo),
            commentRepo: CommentRepository = new CommentRepository(pgClient),
            commentService: CommentService = new CommentService(commentRepo);

          await Promise.all([
            commentService.deleteUserComments(user.userId),
            postService.deleteAllAuthorPost(user.userId),
          ]);

          await userService.deleteUser(user.userId);

          response.writeHead(204);
          response.end();
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use DELETE instead",
            })
          );
        }

        break;
      case "find":
        if (request.method == "GET") {
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (type == "email") {
            const email = searchParams.get("email");

            if (!email) {
              response.writeHead(400);
              response.end(
                JSON.stringify({
                  error: "Email should be provided",
                })
              );
              return;
            }

            const user = await userService.findByEmail(email);

            response.writeHead(200);
            response.end(JSON.stringify(user));
          } else {
            const id = searchParams.get("id");

            if (!id) {
              response.writeHead(400);
              response.end(
                JSON.stringify({
                  error: "User id should be provided",
                })
              );
              return;
            }

            const user = await userService.findById(id);

            response.writeHead(200);
            response.end(JSON.stringify(user));
          }

          response.writeHead(200);
          response.end();
        } else {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              message: "Incorrect http header method, use GET instead",
            })
          );
        }

        break;
      default:
        response.writeHead(200);
        response.end(JSON.stringify("User index route"));

        break;
    }
  });
};
