export type Comment = {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

export type CommentDto = {
  content: string;
  author_id: string;
  post_id: string;
};

export type updateCommentDTO = Pick<Comment, "id"> &
  Partial<Omit<CommentDto, "author_id" | "post_id">>;

export interface CommentRepo {
  createComment: (comment: CommentDto) => Promise<Comment>;
  editComment: (newCommentDetails: updateCommentDTO) => Promise<Comment>;
  getComments: (postId: string) => Promise<Comment[]>;
  deleteComment: (commentId: string) => Promise<boolean>;
  deleteUserComments: (authorId: string) => Promise<boolean>;
}

export interface CommentServ {
  createComment: (comment: CommentDto) => Promise<Comment>;
  editComment: (newCommentDetails: updateCommentDTO) => Promise<Comment>;
  getComments: (postId: string) => Promise<Comment>;
  deleteComment: (commentId: string) => Promise<boolean>;
  deleteUserComments: (authorId: string) => Promise<boolean>;
}
