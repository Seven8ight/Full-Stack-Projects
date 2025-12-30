export type User = {
  username: string;
  email: string;
  password: string;
  role: string;
};

export type userDTO = {
  id: string;
  username: string;
  email: string;
  password: string;
  role: string;
  created_at: string;
  updated_at: string;
};

export type PublicUser = {
  id: string;
  username: string;
  email: string;
  role: string;
};

export interface UserRepo {
  createUser: (userDetails: User) => Promise<userDTO | null>;
  editUser: (
    userId: string,
    newUserDetails: Partial<User>
  ) => Promise<userDTO | null>;
  findByEmail: (email: string) => Promise<PublicUser | null>;
  findById: (userId: string) => Promise<PublicUser | null>;
  deleteUser: (userId: string) => Promise<boolean>;
}

export interface Userservice {
  editUser: (userId: string, newUserDetails: Partial<User>) => Promise<userDTO>;
  findByEmail: (email: string) => Promise<PublicUser>;
  findById: (userId: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<boolean>;
}
