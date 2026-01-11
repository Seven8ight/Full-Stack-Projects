import type { IncomingMessage, ServerResponse } from "node:http";
import { UserController } from "./Modules/Users/users.controller.js";
import { TodoController } from "./Modules/Todos/todos.controller.js";
import { AuthController } from "./Modules/Auth/auth.controller.js";

type Route = {
  pathname: string;
  controller: (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ) => void;
};

export default function Routes(): Route[] {
  return [
    {
      pathname: "users",
      controller: UserController,
    },
    {
      pathname: "todos",
      controller: TodoController,
    },
    {
      pathname: "auth",
      controller: AuthController,
    },
  ];
}
