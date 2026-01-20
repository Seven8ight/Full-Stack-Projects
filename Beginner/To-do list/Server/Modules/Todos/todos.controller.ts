import type { IncomingMessage, ServerResponse } from "node:http";
import { verifyAccessToken } from "../../Utils/Jwt.js";
import { TodoRepository } from "./todos.repository.js";
import { pgClient } from "../../Config/Database.js";
import { TodoService } from "./todos.service.js";
import type { Todo } from "./todos.types.js";

export const TodoController = (
  request: IncomingMessage,
  response: ServerResponse<IncomingMessage>,
) => {
  const requestUrl = new URL(request.url!, `http://${request.headers.host}`),
    pathNames = requestUrl.pathname.split("/").filter(Boolean),
    { authorization } = request.headers;

  if (!authorization) {
    response.writeHead(401);
    response.end(
      JSON.stringify({
        error: "Authorization tokens must be provided",
      }),
    );
    return;
  }

  const userVerifier = verifyAccessToken(authorization.split(" ")[1] as string);

  if (!userVerifier) {
    response.writeHead(403);
    response.end(
      JSON.stringify({
        error: "Authentication failed, re-log in",
      }),
    );
    return;
  }

  const userId = userVerifier.id;

  let unparsedRequestBody: string = "";

  const todoRepo = new TodoRepository(pgClient),
    todoService = new TodoService(todoRepo);

  request.on(
    "data",
    (buffer: Buffer) => (unparsedRequestBody += buffer.toString()),
  );

  request.on("end", async () => {
    try {
      if (unparsedRequestBody.length <= 0) unparsedRequestBody = "{}";
      let parsedRequestBody: any;

      if (unparsedRequestBody.length > 0)
        parsedRequestBody = JSON.parse(unparsedRequestBody);

      switch (pathNames[2]) {
        case "create":
          if (request.method != "POST") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use POST instead",
              }),
            );
            return;
          }

          const createOperation: Todo = await todoService.createTodo(
            userId,
            parsedRequestBody,
          );

          response.writeHead(201);
          response.end(JSON.stringify(createOperation));
          break;
        case "edit":
          if (request.method != "PATCH") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use PATCH instead",
              }),
            );
            return;
          }

          const editOperation = await todoService.editTodo(parsedRequestBody);

          response.writeHead(201);
          response.end(JSON.stringify(editOperation));
          break;
        case "get":
          if (request.method != "GET") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use GET instead",
              }),
            );
            return;
          }
          const searchParams = requestUrl.searchParams,
            type = searchParams.get("type");

          if (!type) {
            response.writeHead(404);
            response.end(
              JSON.stringify({
                error: "Provide type in the search params",
              }),
            );
            return;
          }

          if (type == "all") {
            const retrieveAllTodos = await todoService.getTodos(userId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveAllTodos));
          } else {
            const todoId = searchParams.get("todoid");

            if (!todoId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "todo id must be provided in the search param",
                }),
              );
              return;
            }

            const retrieveTodo = await todoService.getTodo(userId, todoId);

            response.writeHead(200);
            response.end(JSON.stringify(retrieveTodo));
          }
          break;
        case "delete":
          if (request.method != "DELETE") {
            response.writeHead(405);
            response.end(
              JSON.stringify({
                error: "Use DELETE instead",
              }),
            );
            return;
          }

          const searchDeletionParams = requestUrl.searchParams,
            typeDeletion = searchDeletionParams.get("type");

          if (!typeDeletion) {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Provide type in search params",
              }),
            );
            return;
          }

          if (typeDeletion == "one") {
            const todoId = searchDeletionParams.get("todoid");

            if (!todoId) {
              response.writeHead(404);
              response.end(
                JSON.stringify({
                  error: "Provide todoid in the search params",
                }),
              );
              return;
            }

            await todoService.deleteTodo(userId, todoId);

            response.writeHead(204);
            response.end();
          } else if (typeDeletion == "all") {
            await todoService.deleteTodos(userId);

            response.writeHead(204);
            response.end();
          } else {
            response.writeHead(400);
            response.end(
              JSON.stringify({
                error: "Invalid type value specify all or one",
              }),
            );
          }
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
