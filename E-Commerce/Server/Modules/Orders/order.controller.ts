import { verifyAccessToken } from "../../Authentication/Auth.js";
import { IncomingMessage, ServerResponse } from "http";
import { pgClient } from "../../Config/Db.js";
import { OrderRepo } from "./order.repo.js";
import { OrderService } from "./order.service.js";
import type { createOrderDTO, updateOrderDTO } from "./order.types.js";

export const OrderController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const url = new URL(request.url!, "http://localhost:3000"),
    urlParams = url.pathname.split("/").filter(Boolean);

  const { authorization } = request.headers;

  if (!authorization) {
    response.writeHead(401, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({ error: "Authentication failed: No token provided" })
    );
    return;
  }

  const userVerification = verifyAccessToken(authorization);

  if (userVerification instanceof Error) {
    response.writeHead(403, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({ error: "Invalid or expired token. Please re-login." })
    );
    return;
  }

  if (urlParams[0]?.toLowerCase() !== "orders") return;

  const repo = new OrderRepo(pgClient),
    service = new OrderService(repo);

  let requestBody = "";
  request.on("data", (chunk) => (requestBody += chunk));

  request.on("end", async () => {
    try {
      let body: any = {};

      if (requestBody) {
        try {
          body = JSON.parse(requestBody);
        } catch (parseError) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(
            JSON.stringify({ error: "Invalid JSON in request body" })
          );
          return;
        }
      }

      const action = urlParams[1];

      switch (action) {
        case "get": {
          if (request.method !== "GET") {
            response.writeHead(405, { "Content-Type": "application/json" });
            response.end(
              JSON.stringify({ error: "Method not allowed. Use GET." })
            );
            return;
          }

          const { userId, id } = body;

          if (!userId || !id) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "orderId is required" }));
            return;
          }

          const order = await service.getOrderById(userId, id);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(order));

          break;
        }
        case "getall": {
          if (request.method !== "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({ error: "Method not allowed. Use GET." })
            );
            return;
          }

          const { userId } = body,
            order = await service.getUserOrders(userId);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(order));
          break;
        }
        case "create": {
          if (request.method !== "POST") {
            response.writeHead(405);
            response.end(
              JSON.stringify({ error: "Method not allowed. Use POST." })
            );
            return;
          }

          const orderData: createOrderDTO = body,
            newOrder = await service.createOrder(orderData);

          response.writeHead(201, { "Content-Type": "application/json" });
          response.end(JSON.stringify(newOrder));
          break;
        }
        case "edit": {
          if (request.method !== "PATCH") {
            response.writeHead(405);
            response.end(
              JSON.stringify({ error: "Method not allowed. Use PATCH." })
            );
            return;
          }

          const updateData: updateOrderDTO = body;

          if (!updateData.id) {
            response.writeHead(400);
            response.end(
              JSON.stringify({ error: "Product ID is required for update" })
            );
            return;
          }

          const updated = await service.updateOrder(updateData.id, updateData);

          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(updated));
          break;
        }
        case "delete": {
          if (request.method !== "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({ error: "Method not allowed. Use DELETE." })
            );
            return;
          }

          const { userId, id } = body;

          if (!userId || !id) {
            response.writeHead(400);
            response.end(JSON.stringify({ error: "Product ID is required" }));
            return;
          }

          await service.deleteOrder(userId, id);

          response.writeHead(204);
          response.end();
          break;
        }
        case "deleteuser": {
          if (request.method !== "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({ error: "Method not allowed. Use DELETE." })
            );
            return;
          }

          const { userId } = body;

          if (!userId) {
            response.writeHead(400);
            response.end(JSON.stringify({ error: "Product ID is required" }));
            return;
          }

          await service.deleteAllUserOrders(userId);

          response.writeHead(204);
          response.end();
          break;
        }
        default:
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Orders index route" }));
      }
    } catch (error) {
      console.error("ProductController error:", error); // Log for debugging

      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("Order not found")
        ) {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Order not found" }));
        } else if (
          error.message.includes("required") ||
          error.message.includes("Incomplete")
        ) {
          response.writeHead(400, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: error.message }));
        } else {
          response.writeHead(500, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Internal server error" }));
        }
      } else {
        response.writeHead(500);
        response.end(JSON.stringify({ error: "Unexpected error" }));
      }
    }
  });
};
