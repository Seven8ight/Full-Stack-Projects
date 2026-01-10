export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  profileImage: string;
  oAuth: boolean;
  oAuthProvider: string;
};

export type createUserDTO = Pick<User, "username" | "email"> & Partial<User>;
export type createUserType = { type: "legacy" | "oAuth"; provider?: string };

export type PublicUser = Omit<User, "password" | "oAuth" | "oAuthProvider">;

export type updateUserDTO = Omit<
  Partial<User>,
  "id" | "oAuth" | "oAuthProvider"
>;

export interface UserRepo {
  createUser: (userData: createUserDTO, type: createUserType) => Promise<User>;
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface Userservice {
  createUser: (
    userData: createUserDTO,
    type: createUserType
  ) => Promise<PublicUser>;
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<PublicUser>;
  getUser: (userId: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<void>;
}
