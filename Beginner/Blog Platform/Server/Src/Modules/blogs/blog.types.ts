// blog.types.ts

// --- Media type ---
export type Media = {
  id?: string;
  url: string;
  type: "image" | "video";
  size: number;
  created_at?: string;
};

// --- Blog entity ---
export type Blog = {
  id: string;
  owner_id: string;
  title: string;
  slug: string;
  content: Object;
  cover_image_url?: string;
  status: "draft" | "published" | "restricted";
  view_count: number;
  like_count: number;
  comment_count: number;
  restricted_reason?: string;
  created_at: string;
  updated_at: string;
  published_at?: string;
  deleted_at?: string;
};

// --- BlogTag entity ---
export type BlogTag = {
  id: string;
  name: string;
};

// --- DTOs ---
export type createBlogDTO = Pick<
  Blog,
  "owner_id" | "title" | "slug" | "content" | "cover_image_url" | "status"
> & {
  tags?: string[];
  media?: Media[];
};

export type updateBlogDTO = Partial<createBlogDTO> & {
  id: string;
  tags?: { action: "add" | "subtract"; tags: string[] };
  media?: { action: "add" | "subtract"; media: Media[] };
  deleted_at?: string;
};

// --- Repository interface ---
export interface BlogRepository {
  createBlog: (blogData: createBlogDTO) => Promise<Blog>;
  editBlog: (blogId: string, newBlogData: updateBlogDTO) => Promise<Blog>;
  getBlogById: (blogId: string) => Promise<Blog>;
  getUserBlogs: (userId: string) => Promise<Blog[]>;
  getAllBlogTags: () => Promise<BlogTag[]>;
  getBlogTagsByBlogId: (blogId: string) => Promise<BlogTag[]>;
  deleteBlog: (blogId: string, userId: string) => Promise<void>;
  deleteUserBlogs: (userId: string) => Promise<void>;
}

// --- Service interface ---
export interface BlogService {
  createBlog: (userId: string, blogData: createBlogDTO) => Promise<Blog>;
  editBlog: (newBlogData: updateBlogDTO) => Promise<Blog>;
  getBlogById: (blogId: string) => Promise<Blog>;
  getUserBlogs: (userId: string) => Promise<Blog[]>;
  getAllBlogTags: () => Promise<BlogTag[]>;
  getBlogTagsByBlogId: (blogId: string) => Promise<BlogTag[]>;
  deleteBlog: (blogId: string, userId: string) => Promise<void>;
  deleteUserBlogs: (userId: string) => Promise<void>;
}
