import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  Blog,
  BlogRepository,
  createBlogDTO,
  updateBlogDTO,
} from "./blog.types.js";

export class BlogRepo implements BlogRepository {
  constructor(private dbClient: Database) {}

  async createBlog(blogData: createBlogDTO): Promise<Blog> {
    try {
      let keys: string[] = [],
        values = Object.values(blogData),
        paramIndex = 1,
        paramIndexMapping: string[] = Array.from(
          { length: values.length },
          () => `$${paramIndex++}`,
        );

      const blogCreation: QueryResult<Blog> = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO blogs(${keys.join(",")}) VALUES(${paramIndexMapping.join(",")}) RETURNING *`,
            [...values],
          );
        },
      );

      if (blogCreation.rows && blogCreation.rows[0])
        return blogCreation.rows[0];

      throw new Error("Error in creation of blogs");
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }

  async editBlog(blogId: string, newBlogData: updateBlogDTO): Promise<Blog> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(newBlogData)) {
        if (key != "tags" && key != "media_urls") {
          keys.push(`${key}=$${paramIndex++}`);
          values.push(value);
        } else {
          if (key == "media_urls") {
            if (newBlogData.media_urls?.action == "add") {
              keys.push(`media_urls = media_urls || $${paramIndex++}::text[]`);
              values.push(newBlogData.media_urls.urls);
            } else if (newBlogData.media_urls?.action == "subtract") {
              keys.push(`media_urls = ARRAY(
                  SELECT unnest(media_urls)
                  EXCEPT
                  SELECT unnest($${paramIndex++}::text[])
                 )`);
              values.push(newBlogData.media_urls.urls);
            }
          } else if (key == "tags") {
            if (newBlogData.tags?.action == "add") {
              keys.push(`tags = tags || $${paramIndex++}::text[]`);
              values.push(newBlogData.tags.tags);
            } else if (newBlogData.tags?.action == "subtract") {
              keys.push(`tags = ARRAY(
                  SELECT unnest(tags)
                  EXCEPT
                  SELECT unnest($${paramIndex++}::text[])
                 )`);
              values.push(newBlogData.tags.tags);
            }
          }
        }
      }

      const editBlogQuery: QueryResult<Blog> = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `UPDATE blogs SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
            [blogId, ...values],
          );
        },
      );

      return editBlogQuery.rows[0] as Blog;
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }

  async getBlogById(blogId: string): Promise<Blog> {
    try {
      const blogRetrieval: QueryResult<Blog> = await this.dbClient.query(
        "SELECT * FROM blogs WHERE id=$1",
        [blogId],
      );

      return blogRetrieval.rows[0] as Blog;
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    try {
      const userBlogs: QueryResult<Blog> = await this.dbClient.query(
        "SELECT * FROM blogs WHERE owner_id=$1",
        [userId],
      );

      return userBlogs.rows;
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }

  async deleteBlog(blogId: string, userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.editBlog(blogId, {
        owner_id: userId,
        deleted_at: date.toUTCString(),
      });
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }

  async deleteUserBlogs(userId: string): Promise<void> {
    try {
      const date = new Date();

      await this.dbClient.query(
        "UPDATE blogs set deleted_at=$2 WHERE owner_id=$1",
        [userId, date.toUTCString()],
      );
    } catch (error) {
      Error(`${(error as Error).message}`);
      throw error;
    }
  }
}
