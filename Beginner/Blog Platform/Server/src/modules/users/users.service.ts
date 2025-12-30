import {
  type Userservice,
  type User,
  type userDTO,
  type PublicUser,
  type UserRepo,
} from "./users.types.js";

export class UserService implements Userservice {
  constructor(private userRepo: UserRepo) {}

  async editUser(
    userId: string,
    newUserDetails: Partial<User>
  ): Promise<userDTO> {
    if (!userId) throw new Error("User id not provided, identify yourself");

    let newDetails: Record<string, any> = {};

    const allowedFields = ["username", "email", "role"];

    for (let [key, value] of Object.entries(newUserDetails)) {
      if (!allowedFields.includes(key)) continue;

      if (key === "email" && typeof value === "string" && value.includes("@"))
        newDetails[key] = value;
      else if (key == "role" && (value == "user" || value == "admin"))
        newDetails[key] = value;
      else if (typeof value == "string" && value.trim().length > 0)
        newDetails[key] = value;
      else if (value) newDetails[key] = value;
    }

    try {
      return (await this.userRepo.editUser(userId, newDetails)) as userDTO;
    } catch (error) {
      throw error;
    }
  }

  async findById(userId: string): Promise<PublicUser> {
    if (!userId) throw new Error("User id not provided");

    try {
      const retrieveUser = await this.userRepo.findById(userId);

      if (retrieveUser) return retrieveUser;
      else throw new Error(`User of id ${userId} not found`);
    } catch (error) {
      throw error;
    }
  }

  async findByEmail(email: string): Promise<PublicUser> {
    if (!email || !email.includes("@"))
      throw new Error("Email not provided or of invalid format");

    try {
      const retrieveUser = await this.userRepo.findByEmail(email);

      if (retrieveUser) return retrieveUser;
      else throw new Error(`User of email, ${email} not found`);
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(userId: string) {
    if (!userId) throw new Error("User id not provided");

    try {
      return await this.userRepo.deleteUser(userId);
    } catch (error) {
      throw error;
    }
  }
}
