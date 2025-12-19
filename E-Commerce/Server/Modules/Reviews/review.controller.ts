import type { IncomingMessage, ServerResponse } from "node:http";
import { ReviewRepository } from "./review.repo.js";
import { ReviewService } from "./review.service.js";
import { pgClient } from "./../../Config/Db.js";
import { verifyAccessToken } from "../../Authentication/Auth.js";
import type { createReviewDTO, updateReviewDTO } from "./review.types.js";

export const ReviewController = async (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>
) => {
  const requestURL = new URL(request.url!, `http://localhost:3000`),
    urlParams = requestURL.pathname.split("/").filter(Boolean);

  const { authorization } = request.headers;
  let userId: string = "";

  if (!authorization) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        Error: "Authenticate yourself first",
      })
    );
    return;
  } else {
    const userVerification = verifyAccessToken(authorization);

    if (userVerification instanceof Error) {
      response.writeHead(403);
      response.end(
        JSON.stringify({
          Error: "User token expired, re-log in",
        })
      );
    } else userId = (userVerification as any).id;
  }

  const reviewRepo = new ReviewRepository(pgClient),
    reviewService = new ReviewService(reviewRepo);

  let requestBody: string = "";

  request.on("data", (data: Buffer) => {
    requestBody += data.toString();
  });

  request.on("end", async () => {
    let { id } = JSON.parse(requestBody);

    if (userId != id) {
      response.writeHead(401);
      response.end(
        JSON.stringify({
          Error: "User id do not match re-log in",
        })
      );
    }

    if (urlParams[0] == "reviews") {
      try {
        switch (urlParams[1]) {
          case "get":
            if (request.method == "GET") {
              const reviewRetrieve = await reviewService.getReview(userId, id);

              response.writeHead(200);
              response.end(JSON.stringify(reviewRetrieve));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: "Incorrect HTTP method, use GET method instead",
                })
              );
              return;
            }

            break;
          case "getall":
            if (request.method == "GET") {
              let { productId } = JSON.parse(requestBody);
              const reviewRetrieve = await reviewService.getReviews(productId);

              response.writeHead(200);
              response.end(JSON.stringify(reviewRetrieve));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: "Incorrect HTTP method, use GET method instead",
                })
              );
              return;
            }
            break;
          case "create":
            if (request.method == "POST") {
              let reviewCreateBody: createReviewDTO = JSON.parse(requestBody);

              const createBody = await reviewService.createReview(
                reviewCreateBody
              );

              response.writeHead(201);
              response.end(JSON.stringify(createBody));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: "HTTP Method invalid for use here",
                })
              );
            }
            break;
          case "edit":
            if (request.method == "PATCH") {
              let reviewUpdateBody: updateReviewDTO = JSON.parse(requestBody);

              const updateBody = await reviewService.updateReview(
                reviewUpdateBody.userId as string,
                reviewUpdateBody.id as string,
                reviewUpdateBody
              );

              response.writeHead(201);
              response.end(JSON.stringify(updateBody));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error:
                    "The request method used here is invalid, provide PATCH method instead",
                })
              );
              return;
            }
            break;
          case "delete":
            if (request.method == "DELETE") {
              let { userId, id } = JSON.parse(requestBody);

              await reviewService.deleteReview(userId, id);

              response.writeHead(204);
              response.end(JSON.stringify("Deletion operation"));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: "Method is not allowed",
                })
              );
            }
            break;
          case "deleteuser":
            if (request.method == "DELETE") {
              let { userId } = JSON.parse(requestBody);

              await reviewService.deleteAllUserReviews(userId);

              response.writeHead(204);
              response.end(JSON.stringify("Deletion operation"));
            } else {
              response.writeHead(405);
              response.end(
                JSON.stringify({
                  Error: "Method is not allowed",
                })
              );
            }
          default:
            response.writeHead(200);
            response.end(JSON.stringify("Index route for reviews"));
        }
      } catch (error) {
        process.stdout.write(`${error}`);

        response.writeHead(404);
        response.end(JSON.stringify(`${(error as Error).message}`));
      }
    } else {
      response.writeHead(404);
      response.end(JSON.stringify("Does not exist"));
    }
  });
};
