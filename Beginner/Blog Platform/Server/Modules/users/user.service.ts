import { Warning } from "../../Utils/Logger.js";
import type { UserRepo } from "./user.repository.js";
import type {
  PublicUser,
  updateUserDTO,
  User,
  Userservice,
} from "./user.types.js";

export class UserService implements Userservice {
  constructor(private userRepo: UserRepo) {}

  protected createPublicUser(userData: User): PublicUser {
    const forbidden = new Set(["password_hash", "oauth", "oauth_provider"]),
      filterUserData = Object.fromEntries(
        Object.entries(userData).filter(([key]) => !forbidden.has(key)),
      );

    return filterUserData as PublicUser;
  }

  async editUser(
    userId: string,
    newUserData: updateUserDTO,
  ): Promise<PublicUser> {
    if (!userId) throw new Error("User id not provided for editing");

    const allowedFields: string[] = [
      "username",
      "email",
      "password",
      "profile_image_url",
      "bio",
      "preferred_topics",
    ];

    let filteredUserData: Record<string, any> = {};

    for (let key of Object.keys(newUserData)) {
      if (allowedFields.includes(key))
        filteredUserData[key] = newUserData[key as keyof updateUserDTO];
    }

    try {
      const editUser: User = await this.userRepo.editUser(
        userId,
        filteredUserData,
      );

      return this.createPublicUser(editUser);
    } catch (error) {
      Warning("Error at user service");
      throw error;
    }
  }

  async getUser(userId: string): Promise<PublicUser> {
    if (!userId) throw new Error("User id not provided for getting the user");

    try {
      const userRetrieval: User = await this.userRepo.getUser(userId);

      return this.createPublicUser(userRetrieval);
    } catch (error) {
      Warning("Error at user service");
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    if (!userId) throw new Error("User id not provided for deletion");

    try {
      await this.userRepo.deleteUser(userId);
    } catch (error) {
      Warning("Error at user service");
      throw error;
    }
  }
}
