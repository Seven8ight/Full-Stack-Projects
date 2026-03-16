import bcrypt from "bcryptjs";

export const passwordHash = (password: string): string =>
    bcrypt.hashSync(password, 10),
  codeHash = (code: number): string => bcrypt.hashSync(code.toString(), 10),
  compareHash = (password: string, hash: string): boolean =>
    bcrypt.compareSync(password, hash);
