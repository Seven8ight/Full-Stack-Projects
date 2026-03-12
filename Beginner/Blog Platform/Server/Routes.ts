import type { IncomingMessage, ServerResponse } from "node:http";
import type { Database } from "./Src/Config/Database.js";
import { UserController } from "./Src/Modules/users/user.controller.js";
import { AuthController } from "./Src/Modules/auth/auth.controller.js";
import { BlogController } from "./Src/Modules/blogs/blog.controller.js";
import { CommentController } from "./Src/Modules/comments/comment.controller.js";
import { FeedbackController } from "./Src/Modules/feedback/feedback.controller.js";

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
  {
    name: "blogs",
    controller: BlogController,
  },
  {
    name: "comments",
    controller: CommentController,
  },
  {
    name: "feedback",
    controller: FeedbackController,
  },
];
