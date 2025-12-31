import type { IncomingMessage, ServerResponse } from "node:http";
import { PostRepository } from "./posts.repository.js";
import { pgClient } from "../../../Config/Db.js";
import { PostService } from "./posts.service.js";
import type { Post } from "./posts.types.js";

export const postController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    params = requestUrl.pathname.split("/").filter(Boolean);

  const postRepo: PostRepository = new PostRepository(pgClient),
    postService: PostService = new PostService(postRepo);

  let unParsedRequestBody = "";

  request.on(
    "data",
    (data: Buffer) => (unParsedRequestBody += data.toString())
  );

  request.on("end", async () => {
    const parsedRequestBody = JSON.parse(unParsedRequestBody);

    switch (params[2]) {
      case "create":
        if (request.method != "POST") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method",
            })
          );
          return;
        }

        try {
          const createRequest: Post = await postService.addPost(
            parsedRequestBody
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
              error: "Invalid http header method",
            })
          );
          return;
        }

        try {
          const updateRequest = await postService.editPost(parsedRequestBody);

          response.writeHead(201);
          response.end(JSON.stringify(updateRequest));
        } catch (error) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: (error as Error).message,
            })
          );
        }

        break;
      case "getall":
        if (request.method != "GET") {
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Invalid http header method",
            })
          );
          return;
        }

        try {
          response.writeHead(200);
          response.end(JSON.stringify(await postRepo.getAllPosts()));
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
              error: "Invalid http header method",
            })
          );
          return;
        }

        const searchParams = requestUrl.searchParams,
          type = searchParams.get("type"),
          authorId = searchParams.get("authorid");

        if (!type || !authorId) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error:
                "Incomplete query, ensure to provide queries i.e. type and authorid",
            })
          );
          return;
        }

        try {
          if (type == "posts") {
            const authorPosts = await postRepo.getAllAuthorPosts(authorId);

            response.writeHead(200);
            response.end(JSON.stringify(authorPosts));
          } else {
            const postId = searchParams.get("postid");

            if (!postId) {
              response.writeHead(400);
              response.end(
                JSON.stringify({
                  error: "Incomplete credentials, provide author's post id",
                })
              );
              return;
            }

            const authorPost = await postRepo.getAuthorPost(authorId, postId);

            response.writeHead(200);
            response.end(JSON.stringify(authorPost));
            return;
          }
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
              error: "Invalid http header method",
            })
          );
          return;
        }
        break;
    }
  });
};
