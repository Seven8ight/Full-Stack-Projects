import http from "http";
import { SERVER_PORT } from "./Src/Config/Env.js";
import { Info } from "./Utils/Logger.js";
import Router from "./Router.js";
import { cacheClient } from "./Src/Config/Cache.js";

const server = http.createServer(Router);

async function BeginServer() {
  try {
    await cacheClient.connect();

    server.listen(SERVER_PORT, () => {
      Info(
        `Server,Database and cache are up and running, server is at port, ${SERVER_PORT}`,
      );
    });
  } catch (error) {
    Error((error as Error).message, error as Error);
  }
}

(async () => await BeginServer())();

process.on("uncaughtException", (error) => Error(`${error.message}`, error));
process.on("unhandledRejection", (reason) =>
  Error(`Unhandled promise rejection: ${reason}`),
);
