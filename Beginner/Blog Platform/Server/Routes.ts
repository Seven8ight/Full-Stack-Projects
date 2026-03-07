import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "./Config/Database.js";
import { UserController } from "./Modules/users/user.controller.js";
import { AuthController } from "./Modules/auth/auth.controller.js";

type Controller = {
  name: string;
  controller: (
    Database: Database,
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>,
  ) => void;
};

export const RouteControllers: Controller[] = [
  {
    name: "users",
    controller: UserController,
  },
  {
    name: "auth",
    controller: AuthController,
  },
];
