import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyUser } from "../../Middleware/Authentication.js";
import type { PublicUser } from "../users/user.types.js";
import type { BlogRepository } from "./blog.types.js";
import { BlogRepo } from "./blog.repository.js";
import type { Database } from "../../Config/Database.js";
import { BlogServ } from "./blog.service.js";
import {
  expireResource,
  getResource,
  setResource,
} from "../../Config/Cache.js";

export const BlogController = (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);

  let unParsedReqBody: string = "";

  request.on("data", (data: Buffer) => (unParsedReqBody += data.toString()));

  request.on("end", async () => {
    let parsedReqBody = JSON.parse(unParsedReqBody || "{}");

    const blogRepo: BlogRepository = new BlogRepo(Database),
      blogService: BlogServ = new BlogServ(blogRepo);

    try {
      const user = verifyUser(request, response) as PublicUser;

      switch (request.method) {
        case "GET":
          const searchParams = requestUrl.searchParams,
            getType = searchParams.get("type");

          if (getType == "blogs") {
            const blogType = searchParams.get("blogtype");

            if (blogType == "one") {
              const blogInCache = await getResource(`blog:${parsedReqBody.id}`);
              let responseBody;

              if (!blogInCache) {
                const retrieveBlog = await blogService.getBlogById(
                  parsedReqBody.id,
                );

                await setResource(
                  `blog:${parsedReqBody.id}`,
                  retrieveBlog,
                  "other",
                );

                responseBody = retrieveBlog;
              } else responseBody = blogInCache;

              response.writeHead(200, {
                "content-type": "application/json",
              });
              response.end(JSON.stringify(responseBody));
            } else if (blogType == "user") {
              const blogsInCache = await getResource(`blog:${user.id}`);
              let responseBody;

              if (!blogsInCache) {
                const userBlogs = await blogService.getUserBlogs(user.id);
                await setResource(`blog:${user.id}`, userBlogs, "other");

                responseBody = userBlogs;
              } else responseBody = blogsInCache;

              response.writeHead(200, {
                "content-type": "application/json",
              });
              response.end(JSON.stringify(responseBody));
            } else if (blogType == "all") {
              const allBlogsInCache = await getResource("AllBlogs");
              let responseBody: any;

              if (!allBlogsInCache) {
                const allBlogs = await blogService.getAllBlogs();

                await setResource("AllBlogs", allBlogs, "other");

                responseBody = allBlogs;
              } else responseBody = allBlogsInCache;

              response.writeHead(200, {
                "content-type": "application/json",
              });
              response.end(JSON.stringify(responseBody));
            } else {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Invalid search param, lacking type",
                }),
              );
            }
          } else if (getType == "tags") {
            const tagType = searchParams.get("tagtype");

            if (tagType == "all") {
              const tagsInCache = await getResource("tags");
              let responseBody: any;

              if (!tagsInCache) {
                const tags = await blogService.getAllBlogTags();
                await setResource("tags", tags, "other");
                responseBody = tags;
              } else responseBody = tagsInCache;

              response.writeHead(200, {
                "content-type": "application/json",
              });
              response.end(JSON.stringify(responseBody));
            } else if (tagType == "one") {
              const blogId = parsedReqBody.blog_id;

              const blogTagsInCache = await getResource(`blogtags:${blogId}`);
              let responseBody: any;

              if (blogTagsInCache) responseBody = blogTagsInCache;
              else {
                const blogTags = await blogService.getBlogTagsByBlogId(blogId);
                await setResource(`blogtags:${blogId}`, blogTags, "other");
                responseBody = blogTags;
              }

              response.writeHead(200, {
                "content-type": "application/json",
              });
              response.end(JSON.stringify(responseBody));
            } else {
              response.writeHead(404, {
                "content-type": "application/json",
              });
              response.end(
                JSON.stringify({
                  error: "Invalid tag type",
                }),
              );
            }
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Specify type in search params. Either blogs or tags",
              }),
            );
          }

          break;
        case "POST":
          const createBlog = await blogService.createBlog(
            user.id,
            parsedReqBody,
          );

          await setResource(`blog:${createBlog.id}`, createBlog, "other");

          response.writeHead(201, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(createBlog));

          break;
        case "PATCH":
          const editBlog = await blogService.editBlog(parsedReqBody);

          await expireResource(`blog:${editBlog.owner_id}`, 1);

          response.writeHead(201, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(editBlog));

          break;
        case "DELETE":
          const deletesearchParams = requestUrl.searchParams,
            deletetype = deletesearchParams.get("type");

          if (deletetype == "one") {
            await blogService.deleteBlog(parsedReqBody.id, user.id);

            await expireResource(parsedReqBody.id, 10);
          } else if (deletetype == "user")
            await blogService.deleteUserBlogs(user.id);
          else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Search param must be provided",
              }),
            );
            return;
          }

          response.writeHead(204);
          response.end();

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
