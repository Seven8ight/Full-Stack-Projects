import { type tokens } from "../../Authentication/Auth.js";

export interface UserRepo {
  createUser: (user: User) => Promise<void>;
  findByEmail: (email: string) => Promise<PublicUser | null>;
  findById: (id: string) => Promise<User | null>;
  editProfile: (userId: string, newUserDetails: User) => Promise<User>;
  deleteProfile: (userId: string) => Promise<void>;
}

export interface userService {
  register: (data: CreateUserDTO) => Promise<tokens>;
  login: (data: LoginUserDTO) => Promise<tokens>;
  getProfile: (userId: string) => Promise<PublicUser>;
  editProfile: (
    userId: string,
    newUserDetails: Pick<User, "id"> & Omit<User, "id">
  ) => Promise<User>;
  deleteProfile: (userId: string) => Promise<void>;
}

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role?: string;
  address?: string;
  postalCode?: string;
};

export type PublicUser = Omit<User, "password">;

export type CreateUserDTO = {
  name: string;
  email: string;
  password: string;
};

export type LoginUserDTO = {
  email: string;
  password: string;
};
