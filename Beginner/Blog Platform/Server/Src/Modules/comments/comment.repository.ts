import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  Comment,
  CommentRepo,
  createCommentDTO,
  updateCommentDTO,
} from "./comment.types.js";
import { Warning } from "../../../Utils/Logger.js";

export class CommentRepository implements CommentRepo {
  constructor(private dbClient: Database) {}

  async createComment(commentData: createCommentDTO): Promise<Comment> {
    try {
      let keys: string[] = [],
        values = Object.values(commentData),
        paramIndex = 1,
        paramIndexMapping: string[] = Array.from(
          { length: values.length },
          () => `$${paramIndex++}`,
        );

      const commentCreation: QueryResult<Comment> =
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO blogs(${keys.join(",")}) VALUES(${paramIndexMapping.join(",")}) RETURNING *`,
            [...values],
          );
        });

      if (commentCreation.rows && commentCreation.rows[0])
        return commentCreation.rows[0];

      throw new Error("Error in creation of blogs");
    } catch (error) {
      Error("Error at creating comments");
      throw error;
    }
  }

  async editComment(commentData: updateCommentDTO): Promise<Comment> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 3;

      for (let [key, value] of Object.entries(commentData)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const patchComment = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return client.query(
            `UPDATE comments SET ${keys.join(",")} WHERE id=$1 and user_id=$2 RETURNING *`,
            [commentData.id, commentData.user_id, ...values],
          );
        },
      );

      return patchComment.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getBlogComments(blogId: string): Promise<Comment[]> {
    try {
      const blogComments = await this.dbClient.query(
        "SELECT * FROM comments WHERE blog_id=$1",
        [blogId],
      );

      return blogComments.rows;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.dbClient.transaction(async (client: PoolClient) => {
        client.query(
          "UPDATE comments SET deleted_at=$1 WHERE id=$2 AND user_id=$3",
          [date.toUTCString(), commentId, userId],
        );
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteUserComments(userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.dbClient.transaction(async (client: PoolClient) => {
        client.query("UPDATE comments SET deleted_at=$1 WHERE user_id=$3", [
          date.toUTCString(),
          userId,
        ]);
      });
    } catch (error) {
      Warning("Delete user comments error repo");
      throw error;
    }
  }
}
