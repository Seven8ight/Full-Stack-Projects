import type { IncomingMessage, ServerResponse } from "node:http";
import { PostRepository } from "./posts.repository.js";
import { pgClient } from "../../../Config/Db.js";
import { PostService } from "./posts.service.js";
import type { Post } from "./posts.types.js";
import { authenticateUser } from "../../middleware/Authentication.js";

export const postController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    params = requestUrl.pathname.split("/").filter(Boolean);

  const user = authenticateUser(request);

  if (user == null) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        error: "Authentication failed, authenticate yourself first",
      })
    );
    return;
  }

  const postRepo: PostRepository = new PostRepository(pgClient),
    postService: PostService = new PostService(postRepo);

  let unParsedRequestBody = "";

  request.on(
    "data",
    (data: Buffer) => (unParsedRequestBody += data.toString())
  );

  request.on("end", async () => {
    const parsedRequestBody = {
      author_id: (user as any).sub,
      ...JSON.parse(unParsedRequestBody),
    };

    switch (params[1]) {
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
          const searchParams = requestUrl.searchParams,
            postId = searchParams.get("postid");

          if (!postId) {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Post id should be provided in search params",
              })
            );
            return;
          }
          const updateRequest = await postService.editPost(
            postId,
            parsedRequestBody
          );

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

        if (!type) {
          response.writeHead(400);
          response.end(
            JSON.stringify({
              error: "Incomplete query, ensure to provide queries i.e. type",
            })
          );
          return;
        }

        try {
          if (type == "posts") {
            const allPosts = await postService.getAllPosts();

            response.writeHead(200);
            response.end(JSON.stringify(allPosts));
          } else if (type == "author") {
            const get = searchParams.get("get"),
              authorId = searchParams.get("authorid");

            if (!get || !authorId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error:
                    "Get and author id should be provided in search params",
                })
              );
              return;
            }

            if (get == "all") {
              const authorPosts = await postService.getAllAuthorPosts(authorId);

              response.writeHead(200);
              response.end(JSON.stringify(authorPosts));
            } else {
              const postId = searchParams.get("postid");

              if (!postId) {
                response.writeHead(404);
                response.end(
                  JSON.stringify({
                    error: "Post id is not provided",
                  })
                );
                return;
              }

              const authorPost = await postRepo.getAuthorPost(authorId, postId);

              response.writeHead(200);
              response.end(JSON.stringify(authorPost));
              return;
            }
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

        const deleteSearchParams = requestUrl.searchParams,
          authorIdDeletion = deleteSearchParams.get("authorid"),
          deleteType = deleteSearchParams.get("type");

        if (!deleteType || !authorIdDeletion) {
          response.writeHead(404);
          response.end(
            JSON.stringify({
              error:
                "Delete type and author id are supposed to be provided in search params",
            })
          );
        } else {
          if (deleteType == "all") {
            await postService.deleteAllAuthorPost(authorIdDeletion);

            response.writeHead(204);
            response.end();
          } else {
            const postIdDeletion = deleteSearchParams.get("postid");

            if (!postIdDeletion) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Post id needs to be provided",
                })
              );
              return;
            }

            await postService.deleteAuthorPost(
              authorIdDeletion,
              postIdDeletion
            );

            response.writeHead(204);
            response.end();
          }
        }

        break;
    }
  });
};
