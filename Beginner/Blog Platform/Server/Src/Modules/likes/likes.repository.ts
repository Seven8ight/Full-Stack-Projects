import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  createLikeDTO,
  Like,
  LikeRepository,
  updateLikeDTO,
} from "./likes.types.js";

export class LikeRepo implements LikeRepository {
  constructor(private dbClient: Database) {}

  async addLike(likeData: createLikeDTO): Promise<Like> {
    try {
      let keys: string[] = Object.keys(likeData),
        values: string[] = Object.values(likeData),
        paramIndex: number = 1,
        paramIndexing = Array.from(
          { length: keys.length },
          () => `$${paramIndex++}`,
        );

      const newLike: QueryResult<Like> = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO likes(${keys.join(",")}) VALUES(${paramIndexing.join(",")}) RETURNING *`,
            values,
          );
        },
      );

      return newLike.rows[0] as Like;
    } catch (error) {
      throw error;
    }
  }

  async editLike(likeData: updateLikeDTO): Promise<Like> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 4;

      for (let [key, value] of Object.entries(likeData)) {
        if (
          key != "id" &&
          key != "user_id" &&
          key != "blog_id" &&
          key != "comment_id"
        ) {
          keys.push(`${key}=$${paramIndex++}`);
          values.push(value);
        }
      }

      const resourceId = likeData.blog_id
        ? likeData.blog_id
        : likeData.comment_id;

      const patchLike = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return client.query(
            `UPDATE likes SET ${keys.join(",")} WHERE id=$1 and user_id=$2 and ${likeData.comment_id ? "comment_id=$3" : "blog_id=$3"} RETURNING *`,
            [likeData.id, likeData.user_id, resourceId, ...values],
          );
        },
      );

      return patchLike.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getLikesByBlogId(blogId: string): Promise<Like[]> {
    try {
      const retrieveLikes: QueryResult<Like> = await this.dbClient.query(
        "SELECT * FROM likes WHERE blog_id=$1",
        [blogId],
      );

      return retrieveLikes.rows;
    } catch (error) {
      throw error;
    }
  }

  async getLikesByCommentId(commentId: string): Promise<Like[]> {
    try {
      const retrieveLikes: QueryResult<Like> = await this.dbClient.query(
        "SELECT * FROM likes WHERE comment_id=$1",
        [commentId],
      );

      return retrieveLikes.rows;
    } catch (error) {
      throw error;
    }
  }
}
