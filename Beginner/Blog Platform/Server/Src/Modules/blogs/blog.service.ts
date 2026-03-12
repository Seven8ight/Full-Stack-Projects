import { Warning } from "../../../Utils/Logger.js";
import type {
  Blog,
  BlogRepository,
  BlogService,
  createBlogDTO,
  updateBlogDTO,
} from "./blog.types.js";

export class BlogServ implements BlogService {
  constructor(private blogRepo: BlogRepository) {}

  allowedFields: readonly (keyof createBlogDTO)[] = [
    "owner_id",
    "title",
    "slug",
    "content",
    "cover_image_url",
    "status",
    "tags",
    "media_urls",
  ] as const satisfies readonly (keyof createBlogDTO)[];

  private blogDataHasFields(data: any): data is createBlogDTO {
    if (!data || typeof data != "object") return false;

    for (const field of this.allowedFields) {
      if (!(field in data)) return false;

      if (data[field] === undefined) return false;
    }

    return true;
  }

  async createBlog(blogData: createBlogDTO): Promise<Blog> {
    try {
      let blogDataChecker = this.blogDataHasFields(blogData);
      if (!blogDataChecker) {
        throw new Error(
          `Invalid blog data, ensure all fields are present and with values. ${this.allowedFields.join(",")}`,
        );
      }

      const creationQuery = await this.blogRepo.createBlog(blogData);

      return creationQuery;
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }

  async editBlog(blogId: string, newBlogData: updateBlogDTO): Promise<Blog> {
    if (!blogId) throw new Error("Blog id must be provided");

    try {
      for (let [key, value] of Object.entries(newBlogData)) {
        if (!(key.toLowerCase() in this.allowedFields))
          throw new Error(`Invalid field, ${key}`);

        if (!value || (typeof value == "string" && value.trim().length <= 0))
          throw new Error(`${key} has a empty/undefined value`);
      }

      const editQuery = await this.blogRepo.editBlog(blogId, newBlogData);

      return editQuery;
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }

  async getBlogById(blogId: string): Promise<Blog> {
    if (!blogId) throw new Error("Blog id must be provided");

    try {
      const retrieveBlog = await this.blogRepo.getBlogById(blogId);

      return retrieveBlog;
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }

  async getUserBlogs(userId: string): Promise<Blog[]> {
    if (!userId) throw new Error("Blog id must be provided");

    try {
      const retreiveUserBlogs = await this.blogRepo.getUserBlogs(userId);

      return retreiveUserBlogs;
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }

  async deleteBlog(blogId: string, userId: string): Promise<void> {
    if (!blogId || !userId)
      throw new Error("Both blog id and user id must be provided");

    try {
      await this.blogRepo.deleteBlog(blogId, userId);
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }

  async deleteUserBlogs(userId: string): Promise<void> {
    if (!userId) throw new Error("Blog id must be provided");

    try {
      await this.blogRepo.deleteUserBlogs(userId);
    } catch (error) {
      Warning(`Error at blog service`);
      throw error;
    }
  }
}
