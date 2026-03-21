export type Like = {
  id: string;
  user_id: string;
  blog_id: string;
  comment_id: string;
  type: "like" | "dislike";
  created_at: string;
};

export type createLikeDTO = {
  user_id: string;
  type: "like" | "dislike";
  blog_id?: string;
  comment_id?: string;
} & (
  | { blog_id: string; comment_id?: never }
  | { comment_id: string; blog_id?: never }
);
export type updateLikeDTO = Pick<Like, "id" | "user_id"> &
  (
    | { blog_id: string; comment_id?: never }
    | { comment_id: string; blog_id?: never }
  );

export interface LikeRepository {
  addLike: (likeData: createLikeDTO) => Promise<Like>;
  editLike: (likeData: updateLikeDTO) => Promise<Like>;
  getLikesByCommentId: (commentId: string) => Promise<Like[]>;
  getLikesByBlogId: (blogId: string) => Promise<Like[]>;
}
export interface LikeService {
  addLike: (userId: string, likeData: createLikeDTO) => Promise<Like>;
  editLike: (userId: string, likeData: updateLikeDTO) => Promise<Like>;
  getLikesByCommentId: (commentId: string) => Promise<Like[]>;
  getLikesByBlogId: (blogId: string) => Promise<Like[]>;
}
