import type { IncomingMessage } from "node:http";
import { verifyAccessToken } from "../Authentication/Auth.js";
import type { User } from "../Modules/Users/user.types.js";
import { UserRepository } from "../Modules/Users/user.repo.js";
import { pgClient } from "../Config/Db.js";
import { UserService } from "../Modules/Users/user.service.js";

export const isAdmin = async (request: IncomingMessage) => {
  const { authorization } = request.headers;

  if (!authorization)
    throw new Error("Authentication required at request header");

  const verifyUser = verifyAccessToken(authorization);

  if (verifyUser instanceof Error)
    throw new Error("User token expired, re-login");

  const userRepo = new UserRepository(pgClient),
    userService = new UserService(userRepo);

  const user = await userService.getProfile((verifyUser as User).id);

  if (user) {
    if (user.role == "admin") return true;
    else return false;
  } else return false;
};
