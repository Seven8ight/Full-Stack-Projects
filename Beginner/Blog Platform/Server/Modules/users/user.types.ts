export type User = {
  id: string;
  username: string;
  email: string;
  password: string;
  is_verified: boolean;
  profile_image_url: string;
  bio: string;
  preferred_topics: string[];
  oauth: string | boolean;
  oauth_provider: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type PublicUser = Omit<User, "password" | "oauth" | "oauthProvider">;

export type updateUserDTO = Partial<{
  username: string;
  email: string;
  password: string;
  bio: string;
  topics: {
    action: "add" | "remove";
    topics: string[];
  };
  deleted_at: string;
}>;

export interface UserRepository {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<User>;
  getUser: (userId: string) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
}

export interface Userservice {
  editUser: (userId: string, newUserData: updateUserDTO) => Promise<PublicUser>;
  getUser: (userId: string) => Promise<PublicUser>;
  deleteUser: (userId: string) => Promise<void>;
}
