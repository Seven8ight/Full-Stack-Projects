import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  User,
  userType,
  createUserDTO,
  updateUserDTO,
  UserRepository,
} from "./user.types.js";

export class UserRepo implements UserRepository {
  constructor(private dbClient: Database) {}

  async createUser(userData: createUserDTO, type: userType): Promise<User> {
    try {
      const newUser: QueryResult<User> = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO users(${Object.keys(userData).join(",")} VALUES(${Object.values(userData)}))`,
          );
        },
      );

      if (newUser.rowCount && newUser.rowCount > 0)
        return newUser.rows[0] as User;
    } catch (error) {
      Error((error as Error).message, error as Error);
    }
  }

  async editUser(userId: string, newUserData: updateUserDTO): Promise<User> {}
  async getUser(userId: string): Promise<User> {}
  async deleteUser(userId: string): Promise<void> {}
}
