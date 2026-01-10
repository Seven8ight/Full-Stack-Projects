import http, { IncomingMessage, ServerResponse } from "http";
import { UserController } from "./Modules/Users/users.controller.js";
import { SERVER_PORT } from "./Config/Env.js";
import { errorMsg, info, warningMsg } from "./Utils/Logger.js";
import { connectToDatabase } from "./Config/Database.js";

const server = http.createServer(
  (request: IncomingMessage, response: ServerResponse<IncomingMessage>) => {
    const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
      pathNames = requestUrl.pathname.split("/").filter(Boolean);
    //api/
    switch (pathNames[1]) {
      case "users":
        UserController(request, response);
        break;
      default:
        response.writeHead(200);
        response.end(
          JSON.stringify({
            message: "Index route",
          })
        );
        break;
    }
  }
);

server.listen(SERVER_PORT, async () => {
  try {
    await connectToDatabase();
    info(
      `Server and database are live, server is up and running at port ${SERVER_PORT}`
    );
  } catch (error) {
    warningMsg(`Server is live, database is down, server at ${SERVER_PORT}`);
    errorMsg(`${(error as Error).message}`);
  }
});

process.on("uncaughtException", (error) => errorMsg(`${error.message}`));
process.on("unhandledRejection", (error) => errorMsg(`${error}`));
