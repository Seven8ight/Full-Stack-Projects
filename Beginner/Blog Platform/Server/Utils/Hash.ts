import bcrypt from "bcryptjs";

export const passwordHash = (password: string): string =>
    bcrypt.hashSync(password, 10),
  compareHash = (password: string, hash: string): boolean =>
    bcrypt.compareSync(password, hash);
