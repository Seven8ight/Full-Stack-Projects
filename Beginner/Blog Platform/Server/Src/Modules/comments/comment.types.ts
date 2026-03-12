export type Comment = {
  id: string;
  user_id: string;
  blog_id: string;
  content: string;
  like_count: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
};

export type createCommentDTO = Pick<Comment, "user_id" | "blog_id" | "content">;
export type updateCommentDTO = Pick<Comment, "id" | "user_id"> &
  Omit<Comment, "created_at" | "deleted_at" | "updated_at"> &
  Partial<Comment>;

export interface CommentRepo {
  createComment: (commentData: createCommentDTO) => Promise<Comment>;
  editComment: (commentData: updateCommentDTO) => Promise<Comment>;
  getBlogComments: (blogId: string) => Promise<Comment[]>;
  deleteComment: (commentId: string, userId: string) => Promise<void>;
  deleteUserComments: (userId: string) => Promise<void>;
}

export interface CommentService {
  createComment: (
    userId: string,
    commentData: createCommentDTO,
  ) => Promise<Comment>;
  editComment: (
    userId: string,
    commentData: updateCommentDTO,
  ) => Promise<Comment>;
  getBlogComments: (blogId: string) => Promise<Comment[]>;
  deleteComment: (commentId: string, userId: string) => Promise<void>;
  deleteUserComments: (userId: string) => Promise<void>;
}
