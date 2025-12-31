import chalk from "chalk";

const date = new Date();

export const info = (message: string) =>
    process.stdout.write(
      chalk.whiteBright(
        `${chalk.blue("[INFO]")}: (${date.toISOString()}) - ${message}\n`
      )
    ),
  error = (message: string) =>
    process.stdout.write(
      chalk.redBright(
        `[ERROR]: ${chalk.whiteBright(
          `(${date.toISOString()})`
        )} - ${message}\n`
      )
    ),
  warning = (message: string) =>
    process.stdout.write(
      chalk.yellowBright(`[WARNING]: (${date.toISOString()}) - ${message}\n`)
    );
