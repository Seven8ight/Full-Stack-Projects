import http from "http";
import { SERVER_PORT } from "./Config/Env.js";
import { Info } from "./Utils/Logger.js";

const server = http.createServer();

server.listen(SERVER_PORT, () => {
  Info(
    `Server,Database and cache are up and running, server is at port, ${SERVER_PORT}`,
  );
});

process.on("uncaughtException", (error) => Error(`${error.message}`, error));
process.on("unhandledRejection", (reason) =>
  Error(`Unhandled promise rejection: ${reason}`),
);
