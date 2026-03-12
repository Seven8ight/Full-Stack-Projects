import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyUser } from "../../Middleware/Authentication.js";
import type { PublicUser } from "../users/user.types.js";
import type { BlogRepository } from "./blog.types.js";
import { BlogRepo } from "./blog.repository.js";
import type { Database } from "../../Config/Database.js";
import { BlogServ } from "./blog.service.js";

export const BlogController = (
  Database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);
  const user = verifyUser(request, response) as PublicUser;

  let unParsedReqBody: string = "";

  request.on("data", (data: Buffer) => (unParsedReqBody += data.toString()));

  request.on("end", async () => {
    let parsedReqBody = JSON.parse(unParsedReqBody || "{}");

    const blogRepo: BlogRepository = new BlogRepo(Database),
      blogService: BlogServ = new BlogServ(blogRepo);

    try {
      switch (request.method) {
        case "GET":
          const searchParams = requestUrl.searchParams,
            getType = searchParams.get("type");

          if (getType == "one") {
            const retrieveBlog = await blogService.getBlogById(
              parsedReqBody.id,
            );

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(retrieveBlog));
          } else if (getType == "user") {
            const userBlogs = await blogService.getUserBlogs(user.id);

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(userBlogs));
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Invalid search param, lacking type",
              }),
            );
          }

          break;
        case "POST":
          const createBlog = await blogService.createBlog(parsedReqBody);

          response.writeHead(201, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(createBlog));

          break;
        case "PATCH":
          const editBlog = await blogService.createBlog(parsedReqBody);

          response.writeHead(201, {
            "content-type": "application/json",
          });
          response.end(JSON.stringify(editBlog));

          break;
        case "DELETE":
          const deletesearchParams = requestUrl.searchParams,
            deletetype = deletesearchParams.get("type");

          if (deletetype == "one")
            await blogService.deleteBlog(parsedReqBody.id, user.id);
          else if (deletetype == "user")
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
