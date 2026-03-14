import http from "http";
import { SERVER_PORT } from "./Src/Config/Env.js";
import { Info } from "./Utils/Logger.js";
import Router from "./Router.js";
import { cacheClient } from "./Src/Config/Cache.js";

const server = http.createServer(Router);

server.listen(SERVER_PORT, async () => {
  await cacheClient.connect();

  Info(
    `Server,Database and cache are up and running, server is at port, ${SERVER_PORT}`,
  );
});

process.on("uncaughtException", (error) => Error(`${error.message}`, error));
process.on("unhandledRejection", (reason) =>
  Error(`Unhandled promise rejection: ${reason}`),
);
