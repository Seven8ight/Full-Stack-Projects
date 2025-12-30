import { connectDb } from "./Config/Db.js";
import {
  type Server,
  IncomingMessage,
  ServerResponse,
  createServer,
} from "http";
import { PORT } from "./Utils/Env.js";

import { UserController } from "./Modules/Users/user.controller.js";
import { ProductController } from "./Modules/Products/product.controller.js";
import { OrderController } from "./Modules/Orders/order.controller.js";
import { ReviewController } from "./Modules/Reviews/review.controller.js";

const server: Server = createServer(
  async (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ) => {
    if (!request.url) {
      response.writeHead(400, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ error: "Bad request" }));
      return;
    }

    const parsedUrl = new URL(request.url, `http://${request.headers.host}`),
      pathname = parsedUrl.pathname.split("/").filter(Boolean);

    if (request.method == "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    switch (pathname[0]) {
      case "users":
        await UserController(request, response);
        break;
      case "products":
        await ProductController(request, response);
        break;
      case "orders":
        await OrderController(request, response);
        break;
      case "reviews":
        await ReviewController(request, response);
        break;
      default:
        response.writeHead(404, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Not found" }));
        break;
    }
  }
);

server.listen(PORT, async () => {
  try {
    await connectDb();

    process.stdout.write(
      `Server and database are up and running, server at port ${PORT}\n`
    );
  } catch (error) {
    if (error instanceof Error)
      process.stdout.write(`Server is up at ${PORT}, Database down\n`);
  }
});

process.on("uncaughtException", (error: Error) => {
  process.stdout.write(`${error.stack}\n`);
});
