export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  is_verified: boolean;
  profile_image_url: string;
  bio: string;
  preferred_topics: string[];
  oauth: string;
  oauthProvider: string;
  created_at: string;
  updated_at: string;
};

export type userType = "legacy" | "oauth";

export type PublicUser = Omit<User, "password">;

export type createUserDTO = Pick<User, "username" | "email" | "password"> &
  Omit<User, "id" | "is_verified" | "created_at" | "updated_at">;
export type updateUserDTO = Omit<User, "id" | "created_at" | "updated_at"> &
  Partial<User>;

export interface UserRepository {
  createUser: (userData: createUserDTO, type: userType) => Promise<User>;
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface Userservice {
  createUser: (userData: createUserDTO, type: userType) => Promise<PublicUser>;
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<PublicUser>;
  getUser: (userId: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<void>;
}
