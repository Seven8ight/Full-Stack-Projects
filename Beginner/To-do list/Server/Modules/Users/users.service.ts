import { generateTokens } from "../../Utils/Jwt.js";
import { warningMsg } from "../../Utils/Logger.js";
import type {
  createUserDTO,
  createUserType,
  loginType,
  PublicUser,
  updateUserDTO,
  User,
  UserRepo,
  Userservice,
} from "./users.types.js";

export class UserService implements Userservice {
  constructor(private UserRepo: UserRepo) {}

  private createPublicUser(userData: User): PublicUser {
    return {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      profileImage: (userData as any).profile_image,
    };
  }

  async editUser(userId: string, newUserData: updateUserDTO) {
    if (!userId) throw new Error("User id not provided for editing");

    try {
      const allowedFields: string[] = [
        "username",
        "email",
        "password",
        "profileimage",
      ];

      let newUserObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newUserData)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (value.length < 0) throw new Error(`${key} has an empty value`);

        if (key.toLowerCase() == "profileimage")
          newUserObject["profile_image"] = value;
        else newUserObject[key] = value;
      }

      const updatedUser = await this.UserRepo.editUser(userId, newUserObject);

      return this.createPublicUser(updatedUser);
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getUser(userId: string) {
    if (!userId) throw new Error("User id not provided for retrieval");

    try {
      const retrieveUser = await this.UserRepo.getUser(userId);

      return this.createPublicUser(retrieveUser);
    } catch (error) {
      warningMsg("Get user service error occurred");
      throw error;
    }
  }

  async deleteUser(userId: string) {
    if (!userId) throw new Error("User id not provided for deletion");

    try {
      await this.UserRepo.deleteUser(userId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }
}
