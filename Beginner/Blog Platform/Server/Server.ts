import http from "http";
import Router from "./router.js";
import { SERVER_PORT } from "./Config/Env.js";
import { info, error as Error, warning } from "./src/utils/Logger.js";
import { connectDb } from "./Config/Db.js";

const Server = http.createServer(Router);

Server.listen(SERVER_PORT, async () => {
  try {
    await connectDb();

    info(`Server and database live, server live at port, ${SERVER_PORT}`);
  } catch (error) {
    warning(`Server live at port, ${SERVER_PORT}, database is down!`);
    Error(`${(error as Error).message}`);
  }
});

process.on("uncaughtException", (error) => Error(error.message));
process.on("unhandledRejection", (error) => Error((error as Error).message));
