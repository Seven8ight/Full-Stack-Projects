export type Blog = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  content: Object;
  cover_image_url: string;
  status: "draft" | "published" | "restricted";
  tags: string[];
  media_urls: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  restricted_reason: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  deleted_at: string;
};

export type createBlogDTO = Pick<
  Blog,
  | "owner_id"
  | "title"
  | "slug"
  | "content"
  | "cover_image_url"
  | "status"
  | "tags"
  | "media_urls"
>;

export type updateBlogDTO = (Pick<createBlogDTO, "owner_id"> &
  Partial<createBlogDTO>) &
  Partial<{
    media_urls: {
      action: "add" | "subtract";
      urls: string[];
    };
    tags: {
      action: "add" | "subtract";
      tags: string[];
    };
    deleted_at: string;
  }> &
  Pick<Blog, "id">;

export interface BlogRepository {
  createBlog: (blogData: createBlogDTO) => Promise<Blog>;
  editBlog: (blogId: string, newBlogData: updateBlogDTO) => Promise<Blog>;
  getBlogById: (blogId: string) => Promise<Blog>;
  getUserBlogs: (userId: string) => Promise<Blog[]>;
  deleteBlog: (blogId: string, userId: string) => Promise<void>;
  deleteUserBlogs: (userId: string) => Promise<void>;
}

export interface BlogService {
  createBlog: (userId: string, blogData: createBlogDTO) => Promise<Blog>;
  editBlog: (newBlogData: updateBlogDTO) => Promise<Blog>;
  getBlogById: (blogId: string) => Promise<Blog>;
  getUserBlogs: (userId: string) => Promise<Blog[]>;
  deleteBlog: (blogId: string, userId: string) => Promise<void>;
  deleteUserBlogs: (userId: string) => Promise<void>;
}
