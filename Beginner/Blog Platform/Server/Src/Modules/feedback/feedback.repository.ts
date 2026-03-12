import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  createFeedbackDTO,
  Feedback,
  FeedbackRepository,
  updateFeedbackDTO,
} from "./feedback.types.js";

export class FeedbackRepo implements FeedbackRepository {
  constructor(private dbClient: Database) {}

  async createFeedback(feedbackData: createFeedbackDTO): Promise<Feedback> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 1,
        paramIndexing: string[] = [];

      for (let [key, value] of Object.entries(feedbackData)) {
        keys.push(key);
        paramIndexing.push(`$${paramIndex++}`);
        values.push(value);
      }

      const newFeedback: QueryResult<Feedback> =
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO feedback(${keys.join(",")}) VALUES(${paramIndexing.join(",")}) RETURNING *`,
            [...values],
          );
        });

      return newFeedback.rows[0] as Feedback;
    } catch (error) {
      throw error;
    }
  }

  async editFeedback(feedbackData: updateFeedbackDTO): Promise<Feedback> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(feedbackData)) {
        if (key != "user_id" && key != "blog_id") {
          keys.push(`${key}=$${paramIndex++}`);
          values.push(value);
        }
      }

      const patchFeedback = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `UPDATE feedback SET ${keys.join(",")} WHERE id=$1 and user_id=$2 RETURNING *`,
            [feedbackData.id, feedbackData.user_id, ...values],
          );
        },
      );

      return patchFeedback.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
    try {
      const userFeedback: QueryResult<Feedback> = await this.dbClient.query(
        "SELECT * FROM feedback WHERE user_id=$1",
        [userId],
      );

      return userFeedback.rows;
    } catch (error) {
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    try {
      const date = new Date();

      await this.dbClient.query(
        "UPDATE feedback SET deleted_at=$1 WHERE id=$2",
        [date.toUTCString(), feedbackId],
      );
    } catch (error) {
      throw error;
    }
  }
}
