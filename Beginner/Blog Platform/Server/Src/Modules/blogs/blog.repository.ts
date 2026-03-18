import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  Blog,
  BlogRepository,
  BlogTag,
  createBlogDTO,
  updateBlogDTO,
} from "./blog.types.js";
import { expireResource } from "../../Config/Cache.js";

export class BlogRepo implements BlogRepository {
  constructor(private dbClient: Database) {}

  private async upsertTags(
    client: PoolClient,
    tags: string[],
  ): Promise<string[]> {
    if (!tags || tags.length === 0) return [];

    const placeholders = tags.map((_, idx) => `$${idx + 1}`).join(",");
    const result: QueryResult<BlogTag> = await client.query(
      `INSERT INTO tags(name) VALUES(${placeholders}) 
       ON CONFLICT(name) DO NOTHING RETURNING *`,
      tags,
    );

    return result.rows.map((tag) => tag.id);
  }

  private async insertMedia(
    client: PoolClient,
    blogId: string,
    media: { url: string; type: string; size: number }[],
  ) {
    if (!media || media.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];

    media.forEach((m, i) => {
      const offset = i * 3;
      placeholders.push(`($1, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(blogId, m.url, m.type, m.size);
    });

    await client.query(
      `INSERT INTO blog_media(blog_id,url,type,size) VALUES ${placeholders.join(", ")}`,
      values,
    );
  }

  async createBlog(blogData: createBlogDTO): Promise<Blog> {
    return this.dbClient.transaction(async (client: PoolClient) => {
      const keys = Object.keys(blogData).filter(
          (k) => k !== "tags" && k !== "media_urls",
        ),
        values = keys.map((k) => (blogData as any)[k]),
        placeholders = values.map((_, idx) => `$${idx + 1}`).join(",");

      const blogResult = await client.query<Blog>(
          `INSERT INTO blogs(${keys.join(",")}) VALUES(${placeholders}) RETURNING *`,
          values,
        ),
        blog = blogResult.rows[0]!,
        blogId = blog.id;

      const tagIds = await this.upsertTags(client, blogData.tags!);
      if (tagIds.length > 0) {
        const tagPlaceholders = tagIds.map((_, idx) => `$${idx + 2}`).join(",");
        await client.query(
          `INSERT INTO blog_tags(blog_id, tag_id) VALUES ($1, ${tagPlaceholders})`,
          [blogId, ...tagIds],
        );
      }

      await this.insertMedia(client, blogId, blogData.media!);

      return blog;
    });
  }

  async editBlog(blogId: string, newBlogData: updateBlogDTO): Promise<Blog> {
    return this.dbClient.transaction(async (client) => {
      const updates: string[] = [],
        values: any[] = [blogId];

      let idx = 2;

      for (const [key, val] of Object.entries(newBlogData)) {
        if (key === "tags" && typeof val !== "string") {
          if ((val as any).action === "add") {
            updates.push(`tags = tags || $${idx++}::text[]`);
            values.push((val as any).tags);
          } else if ((val as any).action === "subtract") {
            updates.push(
              `tags = ARRAY(SELECT unnest(tags) EXCEPT SELECT unnest($${idx++}::text[]))`,
            );
            values.push((val as any).tags);
          }
        } else if (key === "media_urls" && val) {
          if ((val as any).action === "add") {
            updates.push(`media_urls = media_urls || $${idx++}::text[]`);
            values.push((val as any).urls);
          } else if ((val as any).action === "subtract") {
            updates.push(
              `media_urls = ARRAY(SELECT unnest(media_urls) EXCEPT SELECT unnest($${idx++}::text[]))`,
            );
            values.push((val as any).urls);
          }
        } else if (key !== "id") {
          updates.push(`${key} = $${idx++}`);
          values.push(val);
        }
      }

      const result = await client.query<Blog>(
        `UPDATE blogs SET ${updates.join(", ")} WHERE id=$1 RETURNING *`,
        values,
      );

      return result.rows[0]!;
    });
  }

  async getBlogById(blogId: string): Promise<Blog> {
    const result = await this.dbClient.query(
      "WITH blog AS (SELECT * FROM blogs WHERE id=$1) SELECT hb.*, bm.id AS media_id, bm.url, bm.type, bm.size, bm.created_at FROM half_blog hb LEFT JOIN blog_media bm ON hb.id = bm.blog_id",
      [blogId],
    );

    return result.rows[0];
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    const result = await this.dbClient.query(
      "WITH half_blog AS (SELECT b.*, bt.tag_id FROM blogs b LEFT JOIN blog_tags bt ON b.id = bt.blog_id WHERE b.owner_id = $1) SELECT hb.*, bm.id AS media_id, bm.url, bm.type, bm.size, bm.created_at FROM half_blog hb LEFT JOIN blog_media bm ON hb.id = bm.blog_id",
      [userId],
    );
    return result.rows;
  }

  async getAllBlogTags(): Promise<BlogTag[]> {
    const result = await this.dbClient.query("SELECT * FROM tags");

    return result.rows;
  }

  async getBlogTagsByBlogId(blogId: string): Promise<BlogTag[]> {
    const result = await this.dbClient.query(
      "SELECT t.* FROM tags t INNER JOIN blog_tags bt ON t.id = bt.tag_id WHERE bt.blog_id=$1",
      [blogId],
    );

    return result.rows;
  }

  async deleteBlog(blogId: string, userId: string): Promise<void> {
    const deletedAt = new Date().toISOString();

    await this.editBlog(blogId, {
      id: blogId,
      owner_id: userId,
      deleted_at: deletedAt,
    });
  }

  async deleteUserBlogs(userId: string): Promise<void> {
    const deletedAt = new Date().toISOString();

    const result = await this.dbClient.query(
      "UPDATE blogs SET deleted_at=$2 WHERE owner_id=$1 RETURNING *",
      [userId, deletedAt],
    );

    for (const blog of result.rows) {
      await expireResource(`blog:${blog.id}`, 10);
    }
  }
}
