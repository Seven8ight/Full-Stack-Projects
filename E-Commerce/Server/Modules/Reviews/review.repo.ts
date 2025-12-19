import type { Client, QueryResult } from "pg";
import type {
  createReviewDTO,
  review,
  reviewRepo,
  updateReviewDTO,
} from "./review.types.js";

export class ReviewRepository implements reviewRepo {
  constructor(private dbClient: Client) {}

  async getReview(userId: string, reviewId: string): Promise<review> {
    try {
      const review: QueryResult<review> = await this.dbClient.query(
        "SELECT * FROM reviews WHERE id=$1 AND user_id=$2",
        [reviewId, userId]
      );

      if (review.rowCount == 0) throw new Error("Review does not exist");

      return review.rows[0] as review;
    } catch (error) {
      throw error;
    }
  }

  async getReviews(productId: string): Promise<review[]> {
    try {
      const review: QueryResult<review> = await this.dbClient.query(
        "SELECT * FROM reviews WHERE product_id=$1",
        [productId]
      );

      if (review.rowCount == 0) throw new Error("Review does not exist");

      return review.rows as review[];
    } catch (error) {
      throw error;
    }
  }

  async addReview(review: createReviewDTO): Promise<review> {
    try {
      const reviewId = crypto.randomUUID(),
        reviewAddition: QueryResult<review> = await this.dbClient.query(
          "INSERT INTO reviews(id,user_id,product_id,comment,created_at,rating) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
          [reviewId, ...Object.values(review)]
        );

      if (reviewAddition.rowCount == 0) throw new Error("Error in creation");

      return reviewAddition.rows[0] as review;
    } catch (error) {
      throw error;
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    newReviewData: updateReviewDTO
  ) {
    try {
      if (Object.keys(newReviewData).length === 0)
        throw new Error("No fields provided for update");

      let setKeys: string[] = [],
        values: any[] = [],
        paramIndex = 3;

      for (let [key, value] of Object.entries(newReviewData)) {
        if (key == "userId") key = "user_id";
        if (key == "productId") key = "product_id";

        setKeys.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }

      const updateQuery: QueryResult<review> = await this.dbClient.query(
        `UPDATE reviews SET ${setKeys.join(
          ", "
        )} WHERE id=$1 AND user_id=$2 RETURNING *`,
        [reviewId, userId, ...values]
      );

      if (updateQuery.rowCount == 0) throw new Error("Order not found");

      return updateQuery.rows[0] as review;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(userId: string, reviewId: string) {
    try {
      const deletion = await this.dbClient.query(
        "DELETE FROM reviews WHERE id=$1 AND user_id=$2",
        [reviewId, userId]
      );

      if (deletion.rowCount == 0) throw new Error("No such review found");
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUserReviews(userId: string) {
    try {
      await this.dbClient.query("DELETE FROM reviews WHERE user_id=$1", [
        userId,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
