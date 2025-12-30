import { OrderRepo } from "../Orders/order.repo.js";
import { OrderService } from "../Orders/order.service.js";
import { ReviewRepository } from "../Reviews/review.repo.js";
import { ReviewService } from "../Reviews/review.service.js";
import { type User, type PublicUser, type UserRepo } from "./user.types.js";
import {
  Client,
  type QueryResult,
} from "../../node_modules/@types/pg/index.js";

export class UserRepository implements UserRepo {
  constructor(private db: Client) {}

  async createUser(user: User): Promise<void> {
    const date = new Date();

    await this.db.query(
      "INSERT INTO users(name,email,password,role,created_at) VALUES($1,$2,$3,$4,$5);",
      [user.name, user.email, user.password, "customer", date.toUTCString()]
    );
  }

  async findByEmail(email: string): Promise<PublicUser | null> {
    const db: QueryResult<User> = await this.db.query(
      `SELECT * FROM users WHERE email=$1`,
      [email]
    );

    if (db.rowCount == 0) return null;

    return db.rows[0] as PublicUser;
  }

  async findById(id: string): Promise<User | null> {
    const db: QueryResult<User> = await this.db.query(
      `SELECT * from users WHERE id=$1`,
      [id]
    );

    return db.rows[0] ?? null;
  }

  async editProfile(
    userId: string,
    newUserDetails: Pick<User, "id"> & Partial<User>
  ): Promise<User> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newUserDetails)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const editQuery: QueryResult<User> = await this.db.query(
        `UPDATE users SET ${keys.join(", ")} WHERE id=$1 RETURNING *`,
        [userId, ...values]
      );

      if (editQuery.rowCount == 0) throw new Error("User non-existent");

      return editQuery.rows[0] as User;
    } catch (error) {
      throw error;
    }
  }

  async deleteProfile(userId: string): Promise<void> {
    try {
      //reviews and orders

      const orderRepo = new OrderRepo(this.db),
        orderService = new OrderService(orderRepo);

      const reviewRepo = new ReviewRepository(this.db),
        reviewService = new ReviewService(reviewRepo);

      await orderService.deleteAllUserOrders(userId);
      await reviewService.deleteAllUserReviews(userId);
    } catch (error) {
      throw error;
    }
  }
}
