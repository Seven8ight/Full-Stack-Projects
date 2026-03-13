import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { AnalyticsRepo } from "./analytics.repository.js";
import { AnalyticServ } from "./analytics.service.js";

export const AnalyticsController = async (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`);

  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => (unparsedReqBody += data.toString()));

  request.on("end", async () => {
    try {
      const parsedReqBody = JSON.parse(unparsedReqBody);

      const analyticsRepo = new AnalyticsRepo(database),
        analyticsService = new AnalyticServ(analyticsRepo);

      switch (request.method) {
        case "GET":
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("by");

          if (type == "id") {
            const retrieveBlogAnalytics = await analyticsRepo.getBlogAnalytic(
              parsedReqBody.blog_id,
            );

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(retrieveBlogAnalytics));
          } else if (type == "date") {
            const retrieveBlogAnalyticsByDate =
              await analyticsRepo.getBlogAnalyticsByDate(
                parsedReqBody.blog_id,
                parsedReqBody.date,
              );

            response.writeHead(200, {
              "content-type": "application/json",
            });
            response.end(JSON.stringify(retrieveBlogAnalyticsByDate));
          } else {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Type must be specified",
              }),
            );
          }

          break;
        case "POST":
          const newAnalytics = await analyticsService.createAnalytic(
            parsedReqBody.blog_id,
          );

          response.writeHead(201);
          response.end(JSON.stringify(newAnalytics));

          break;
        case "PATCH":
          const patchAnalytics = await analyticsService.editAnalytic(
            parsedReqBody.blog_id,
            parsedReqBody,
          );

          response.writeHead(200);
          response.end(JSON.stringify(patchAnalytics));

          break;
        default:
          response.writeHead(405);
          response.end(
            JSON.stringify({
              error: "Use only GET,POST OR PATCH",
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
