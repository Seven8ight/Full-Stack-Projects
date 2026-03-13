import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "../../Config/Database.js";
import { TagRepo } from "./tags.repository.js";
import { TagServ } from "./tags.service.js";

export const TagController = (
  database: Database,
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  let unparsedReqBody: string = "";

  request.on("data", (data: Buffer) => {
    unparsedReqBody += data.toString();
  });

  request.on("end", async () => {
    const parsedReqBody = JSON.parse(unparsedReqBody || "{}");

    const tagRepo = new TagRepo(database),
      tagService = new TagServ(tagRepo);

    switch (request.method) {
      case "GET":
        const tags = await tagService.getTags();

        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify(tags));

        break;
      case "POST":
        const newTag = await tagService.createTag(parsedReqBody);

        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify(newTag));

        break;
      case "PATCH":
        const patchedTag = await tagService.createTag(parsedReqBody);

        response.writeHead(200, {
          "content-type": "application/json",
        });
        response.end(JSON.stringify(patchedTag));

        break;
      default:
        response.writeHead(405);
        response.end(
          JSON.stringify({
            error: "Invalid route method",
          }),
        );

        break;
    }
  });
};
