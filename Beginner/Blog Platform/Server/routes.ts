import type { IncomingMessage, ServerResponse } from "node:http";
import { authController } from "./src/modules/auth/auth.controller.js";
import { CommentController } from "./src/modules/comments/comments.controller.js";
import { postController } from "./src/modules/posts/posts.controller.js";
import { userController } from "./src/modules/users/users.controller.js";

type route = {
  pathname: string;
  controller: (request: any, response: ServerResponse<IncomingMessage>) => void;
};

export const routes: route[] = [
  {
    pathname: "users",
    controller: userController,
  },
  {
    pathname: "comments",
    controller: CommentController,
  },
  {
    pathname: "auth",
    controller: authController,
  },
  {
    pathname: "posts",
    controller: postController,
  },
];
