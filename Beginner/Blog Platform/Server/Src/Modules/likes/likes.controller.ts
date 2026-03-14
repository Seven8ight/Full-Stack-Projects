import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { verifyUser } from "../../Middleware/Authentication.js";
import type { PublicUser } from "../users/user.types.js";
import { LikeRepo } from "./likes.repository.js";
import { LikeServ } from "./likes.service.js";
import {
  expireResource,
  getResource,
  setResource,
} from "../../Config/Cache.js";

export const LikeController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    try {
      const parsedReqBody = JSON.parse(unparsedReqBody || "{}");
      const user = verifyUser(request, response) as PublicUser;

      const likeRepo = new LikeRepo(database),
        likeService = new LikeServ(likeRepo);

      switch (request.method) {
        case "GET":
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          let responseBody: any;

          if (type == "blog") {
            const blogLikesInCache = await getResource(
              `blog-likes:${parsedReqBody.blog_id}`,
            );

            if (!blogLikesInCache) {
              responseBody = await likeService.getLikesByBlogId(
                parsedReqBody.blog_id,
              );

              await setResource(
                `blog-likes:${parsedReqBody.blog_id}`,
                responseBody,
                "other",
              );
            } else responseBody = blogLikesInCache;
          } else if (type == "comment") {
            const commentsLikesInCache = await getResource(
              `comment-likes:${parsedReqBody.comment_id}`,
            );

            if (!commentsLikesInCache) {
              responseBody = await likeService.getLikesByCommentId(
                parsedReqBody.comment_id,
              );

              await setResource(
                `comment-likes:${parsedReqBody.comment_id}`,
                responseBody,
                "other",
              );
            } else responseBody = commentsLikesInCache;
          }

          response.writeHead(200, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(responseBody));

          break;
        case "POST":
          const newLike = await likeService.addLike(user.id, parsedReqBody);

          if (parsedReqBody.blog_id)
            await expireResource(`blog-likes:${parsedReqBody.blog_id}`, 1);
          else if (parsedReqBody.comment_id)
            await expireResource(`comment-likes:${parsedReqBody.blog_id}`, 1);

          response.writeHead(201);
          response.end(JSON.stringify(newLike));

          break;
        case "PATCH":
          const patchedLike = await likeService.editLike(
            user.id,
            parsedReqBody,
          );

          if (parsedReqBody.blog_id)
            await expireResource(`blog-likes:${parsedReqBody.blog_id}`, 1);
          else if (parsedReqBody.comment_id)
            await expireResource(`comment-likes:${parsedReqBody.blog_id}`, 1);

          response.writeHead(201);
          response.end(JSON.stringify(patchedLike));

          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use either GET, POST and PATCH",
            }),
          );
          break;
      }
    } catch (error) {
      response.writeHead(400);
      response.end(
        JSON.stringify({
          error: (error as Error).message,
        }),
      );
    }
  });
};
