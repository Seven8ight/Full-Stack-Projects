import crypto from "crypto";
import { UserRepository } from "./user.repo.js";
import {
  type CreateUserDTO,
  type LoginUserDTO,
  type userService,
  type User,
} from "./user.types.js";
import { generateToken, type tokens } from "../../Authentication/Auth.js";

export class UserService implements userService {
  constructor(private userRepo: UserRepository) {}

  async register(data: CreateUserDTO) {
    if (!data.name || !data.email || !data.password)
      throw new Error(
        "Error: Incomplete credentials, name, email and password."
      );

    if (data.password.length < 4) throw new Error("Password too short");

    const exists = await this.userRepo.findByEmail(data.email);

    if (exists) throw new Error("Register Error: Email already in use");

    const user = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password: data.password,
    };
    await this.userRepo.createUser(user);

    const token = generateToken({
      id: user.id,
      email: user.email,
    });

    return token as tokens;
  }

  async login(data: LoginUserDTO) {
    if (!data.email || !data.password)
      throw new Error(
        "Login Error: Login data incomplete ensure to provide email and password"
      );

    if (data.password.length < 3)
      throw new Error("Error: Password length is short");

    const userExistence = await this.userRepo.findByEmail(data.email);

    if (userExistence) {
      const userObj = await this.userRepo.findById(userExistence.id);

      if (userObj) {
        if (userObj.password == data.password)
          return generateToken({
            id: userObj.id,
            name: userObj.name,
            email: userObj.email,
          }) as tokens;
        else throw new Error("Login Error: Password is incorrect");
      } else throw new Error("Login Error: User does not exist");
    } else throw new Error("Login Error: User does not exist");
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new Error("Get Profile: User not found");

    const { password, ...publicUser } = user;
    return publicUser;
  }

  async editProfile(
    userId: string,
    newUserDetails: Pick<User, "id"> & Partial<User>
  ) {
    if (!userId || !newUserDetails)
      throw new Error("User id and new user details required");

    const userFinder = await this.getProfile(userId);

    if (userFinder)
      return await this.userRepo.editProfile(userId, newUserDetails);
    else throw new Error("Edit Profile Error: User does not exist");
  }

  async deleteProfile(userId: string) {
    if (!userId) throw new Error("User id required");

    const userFinder = await this.getProfile(userId);

    if (userFinder) return await this.userRepo.deleteProfile(userId);
    else throw new Error("Delete Profile Error: User does not exist");
  }
}
