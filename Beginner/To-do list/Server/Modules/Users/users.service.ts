import { warningMsg } from "../../Utils/Logger.js";
import type {
  createUserDTO,
  createUserType,
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

  async createUser(userData: createUserDTO, userType: createUserType) {
    const allowedFields: string[] = [
      "username",
      "email",
      "password",
      "profileimage",
      "oauth",
      "oauthprovider",
    ];

    let newUserObject: Record<string, any> = {};

    for (let [key, value] of Object.entries(userData)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);
      if (typeof value == "boolean" && (value == null || value == undefined))
        throw new Error(`Oauth is empty, provide a boolean value for checking`);

      newUserObject[key] = value;
    }

    if (userType.type == "oAuth")
      newUserObject["oauthProvider"] = userType.provider;

    try {
      const newUser: User = await this.UserRepo.createUser(
        newUserObject as any,
        userType
      );

      return this.createPublicUser(newUser);
    } catch (error) {
      warningMsg("Create user service error occurred");
      throw error;
    }
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

        newUserObject[key] = value;
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
