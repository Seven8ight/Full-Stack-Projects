import { verifyAccessToken } from "../../Authentication/Auth.js";
import { IncomingMessage, ServerResponse } from "http";
import { ProductService } from "./product.service.js";
import { pgClient } from "../../Config/Db.js";
import { ProductRepository } from "./product.repo.js";
import type { Product, updateProductDTO } from "./product.types.js";
import { isAdmin } from "../../Middleware/AdminRoutes.js";

export const ProductController = async (
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

  if (urlParams[0]?.toLowerCase() !== "products") return;

  const repo = new ProductRepository(pgClient),
    service = new ProductService(repo);

  let requestBody: string = "";

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

          const { id } = body;

          if (!id) {
            response.writeHead(400, { "Content-Type": "application/json" });
            response.end(JSON.stringify({ error: "productId is required" }));
            return;
          }

          const product = await service.getProduct(id);
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(product));
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
          const products = await service.getAllProducts();
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify(products));
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

          if ((await isAdmin(request)) == true) {
            const productData: Omit<Product, "id"> = body;
            const newProduct = await service.createProduct(productData);
            response.writeHead(201, { "Content-Type": "application/json" });
            response.end(JSON.stringify(newProduct));
          } else {
            response.writeHead(403);
            response.end(
              JSON.stringify({
                Error: "Admin priviledges only",
              })
            );
          }
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
          if ((await isAdmin(request)) == true) {
            const updateData: updateProductDTO = body;

            if (!updateData.id) {
              response.writeHead(400);
              response.end(
                JSON.stringify({ error: "Product ID is required for update" })
              );
              return;
            }
            const updated = await service.updateProduct(
              updateData.id,
              updateData
            );
            response.writeHead(200, { "Content-Type": "application/json" });
            response.end(JSON.stringify(updated));
          } else {
            response.writeHead(403);
            response.end(
              JSON.stringify({
                Error: "Admin priviledges only",
              })
            );
          }
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

          if (await isAdmin(request)) {
            const { id } = body;

            if (!id) {
              response.writeHead(400);
              response.end(JSON.stringify({ error: "Product ID is required" }));
              return;
            }
            await service.removeProduct(id);
            response.writeHead(204);
            response.end();
          } else {
            response.writeHead(403);
            response.end(
              JSON.stringify({
                Error: "Admin priviledges only",
              })
            );
          }
          break;
        }

        default:
          response.writeHead(200, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ message: "Products index route" }));
      }
    } catch (error) {
      console.error("ProductController error:", error); // Log for debugging

      if (error instanceof Error) {
        if (
          error.message.includes("not found") ||
          error.message.includes("Product not found")
        ) {
          response.writeHead(404, { "Content-Type": "application/json" });
          response.end(JSON.stringify({ error: "Product not found" }));
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
