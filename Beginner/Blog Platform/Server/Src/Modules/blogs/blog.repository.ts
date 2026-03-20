import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  Blog,
  BlogRepository,
  BlogTag,
  createBlogDTO,
  createMediaDTO,
  updateBlogDTO,
} from "./blog.types.js";
import { expireResource } from "../../Config/Cache.js";
import type { Tag } from "../tags/tags.types.js";

export class BlogRepo implements BlogRepository {
  constructor(private dbClient: Database) {}

  private async upsertTags(
    client: PoolClient,
    tags: string[],
  ): Promise<string[]> {
    if (!tags || tags.length === 0) return [];

    let result: QueryResult<BlogTag>;

    for (let tag of tags) {
      result = await client.query(
        `INSERT INTO tags(name) VALUES($1) ON CONFLICT(name) DO NOTHING RETURNING *`,
        [tag.toLowerCase()],
      );
    }

    return result!.rows.map((tag) => tag.id);
  }

  private async insertMedia(
    client: PoolClient,
    blogId: string,
    media: createMediaDTO[],
  ) {
    if (!media || media.length === 0) return;

    const values: any[] = [];
    const placeholders: string[] = [];

    media.forEach((m, i) => {
      const offset = i * 3;
      placeholders.push(`($1, $${offset + 2}, $${offset + 3}, $${offset + 4})`);
      values.push(blogId, m.url, m.type.toLowerCase(), m.size);
    });

    await client.query(
      `INSERT INTO blog_media(blog_id,url,type,size) VALUES ${placeholders.join(", ")}`,
      values,
    );
  }

  async createBlog(blogData: createBlogDTO): Promise<Blog> {
    return this.dbClient.transaction(async (client: PoolClient) => {
      const keys = Object.keys(blogData).filter(
          (k) => k !== "tags" && k !== "media",
        ),
        values = keys.map((k) => {
          if (k == "content") return JSON.stringify((blogData as any)[k]);
          return (blogData as any)[k];
        }),
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
      let keys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newBlogData)) {
        if (!value || value.toString().trim().length <= 0)
          throw new Error(`Invalid input for ${key}`);

        if (key != "media" && key != "tags") {
          keys.push(`${key}=$${paramIndex++}`);
          values.push(value);
        }
      }

      const updatedBlog = await client.query(
        `UPDATE blogs SET ${keys.join(",")} where id=$1 RETURNING *`,
        [blogId, ...values],
      );

      if (newBlogData.media) {
        if (newBlogData.media.action == "add")
          await this.insertMedia(client, blogId, newBlogData.media.media);
        else if (newBlogData.media.action == "subtract") {
          let mediaIds: string[] = [],
            keys: string[] = [],
            paramIndex: number = 1;

          for (let media of newBlogData.media.media) {
            if (media.id) mediaIds.push(media.id);
            keys.push(`id=$${paramIndex++}`);
          }

          await client.query(
            `DELETE FROM blog_media WHERE ${keys.join(",")}`,
            mediaIds,
          );
        }
      }

      if (newBlogData.tags) {
        if (newBlogData.tags.action == "add") {
          await this.upsertTags(client, newBlogData.tags.tags);

          let distinctTags: Set<string> = new Set(newBlogData.tags.tags),
            tagIds: string[] = [];

          const tagsQuery: QueryResult<Tag> =
              await client.query("select * from tags"),
            tags = tagsQuery.rows;

          for (let tagName of distinctTags) {
            const tagFinder = tags.find(
              (tag) => tag.name == tagName.toLowerCase(),
            );

            if (tagFinder) tagIds.push(tagFinder.id);
          }

          await this.dbClient.transaction(async (client: PoolClient) => {
            for (let tagId of tagIds) {
              await client.query(
                "INSERT INTO blog_tags(blog_id,tag_id) VALUES($1,$2)",
                [blogId, tagId],
              );
            }
          });
        } else if (newBlogData.tags.action == "subtract") {
          let tagIds: string[] = [],
            keys: string[] = [],
            paramIndex: number = 2;

          const tags: QueryResult<Tag> =
            await client.query("SELECT * FROM tags");

          for (let tagName of newBlogData.tags.tags) {
            const tagFinder = tags.rows.find(
              (tag) => tag.name == tagName.toLowerCase(),
            );

            if (tagFinder) tagIds.push(tagFinder.id);

            keys.push(`tag_id=$${paramIndex++}`);
          }

          await client.query(
            `DELETE FROM blog_tags WHERE blog_id=$1 AND ${keys.join(",")}`,
            [blogId, ...tagIds],
          );
        }
      }

      return updatedBlog.rows[0];
    });
  }

  async getBlogById(blogId: string): Promise<Blog> {
    const result = await this.dbClient.query(
      `
      SELECT b.*,JSON_AGG(JSON_BUILD_OBJECT
      (
      'id',bm.id,'url',bm.url,'type',bm.type,'size',bm.size)
      ) as media,
      ARRAY_AGG(DISTINCT t.name) as tags from blogs b 
      INNER JOIN blog_media bm ON b.id=bm.blog_id
      INNER JOIN blog_tags bt ON bm.blog_id=bt.blog_id
      INNER JOIN tags t ON bt.tag_id=t.id 
      where b.id=$1
      GROUP BY b.id
      `,
      [blogId],
    );

    return result.rows[0];
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    const result = await this.dbClient.query(
      `    
      SELECT b.*,JSON_AGG(JSON_BUILD_OBJECT
      (
      'id',bm.id,'url',bm.url,'type',bm.type,'size',bm.size)
      ) as media,
      ARRAY_AGG(DISTINCT t.name) as tags from blogs b 
      INNER JOIN blog_media bm ON b.id=bm.blog_id
      INNER JOIN blog_tags bt ON bm.blog_id=bt.blog_id
      INNER JOIN tags t ON bt.tag_id=t.id 
      where owner_id=$1
      GROUP BY b.id`,
      [userId],
    );
    return result.rows;
  }

  async getAllBlogTags(): Promise<BlogTag[]> {
    const result = await this.dbClient.query("SELECT * FROM tags");

    return result.rows;
  }

  async getAllBlogs(): Promise<Blog[]> {
    try {
      const allBlogs = await this.dbClient.query(`
        SELECT b.*, ARRAY_AGG(t.name) AS tags FROM blogs b
        LEFT JOIN blog_tags bt ON b.id = bt.blog_id
        LEFT JOIN tags t ON bt.tag_id = t.id
        GROUP BY b.id
      `);

      return allBlogs.rows;
    } catch (error) {
      throw error;
    }
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
