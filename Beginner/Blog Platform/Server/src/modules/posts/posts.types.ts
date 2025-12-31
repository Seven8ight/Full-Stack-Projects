export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type PostDTO = {
  title: string;
  slug: string;
  content: string;
  author_id: string;
};

export type updatePostDTO = Pick<PostDTO, "author_id"> &
  Partial<Omit<PostDTO, "author_id">>;

export interface PostRepo {
  createPost: (postDetails: PostDTO) => Promise<Post>;
  editPost: (newPostDetails: updatePostDTO) => Promise<Post>;
  getAuthorPost: (authorId: string, postId: string) => Promise<Post>;
  getAllAuthorPosts: (authorId: string) => Promise<Post[]>;
  getAllPosts: () => Promise<Post[]>;
  deleteAuthorPost: (authorId: string, postId: string) => Promise<boolean>;
  deleteAllAuthorPost: (authorId: string) => Promise<boolean>;
}

export interface PostServ {
  addPost: (postDetails: PostDTO) => Promise<Post>;
  editPost: (newPostDetails: updatePostDTO) => Promise<Post>;
  getAuthorPost: (authorId: string, postId: string) => Promise<Post>;
  getAllAuthorPosts: (authorId: string) => Promise<Post[]>;
  getAllPosts: () => Promise<Post[]>;
  deleteAuthorPost: (authorId: string, postId: string) => Promise<boolean>;
  deleteAllAuthorPost: (authorId: string) => Promise<boolean>;
}
