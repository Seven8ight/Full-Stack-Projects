import chalk from "chalk";

const date = new Date();

export const Info = (message: string) =>
    process.stdout.write(
      `${chalk.underline.blueBright("Info")}[${date.toUTCString()}]: ${chalk.whiteBright(message)}\n`,
    ),
  Warning = (message: string) =>
    process.stdout.write(
      `${chalk.underline.yellowBright("Warning")}[${date.toUTCString()}]: ${chalk.whiteBright(message)}\n`,
    ),
  ErrorMsg = (message: string, stack: Error) => {
    process.stdout.write(
      `${chalk.underline.redBright("Error")}[${date.toUTCString()}]: ${chalk.whiteBright(message)}\n`,
    );
    process.stdout.write(`${stack.stack}`);
  };
