import chalk from "chalk";

const date = new Date();

export const info = (message: string) =>
    chalk.whiteBright(
      `${chalk.blue("[INFO]")}: (${date.toISOString()}) - ${message}\n`
    ),
  error = (message: string) =>
    chalk.redBright(
      `[ERROR]: ${chalk.whiteBright(`(${date.toISOString()})`)} - ${message}\n`
    ),
  warning = (message: string) =>
    chalk.yellowBright(`[WARNING]: (${date.toISOString()}) - ${message}\n`);
