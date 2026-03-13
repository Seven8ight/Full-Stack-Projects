import type { LikeRepo } from "./likes.repository.js";
import type {
  createLikeDTO,
  Like,
  LikeService,
  updateLikeDTO,
} from "./likes.types.js";

export class LikeServ implements LikeService {
  constructor(private likeRepo: LikeRepo) {}

  async addLike(userId: string, likeData: createLikeDTO): Promise<Like> {
    if (!userId) throw new Error("User id must be provided");

    try {
      if (!likeData.type || (!likeData.blog_id && !likeData.comment_id))
        throw new Error(
          "Ensure type is provided and either comment or blog id is provided",
        );

      if (likeData.type != "like" && likeData.type != "dislike")
        throw new Error("Type can be only like or dislike");

      likeData.user_id = userId;

      const newLike: Like = await this.likeRepo.addLike(likeData);

      return newLike;
    } catch (error) {
      throw error;
    }
  }

  async editLike(userId: string, likeData: updateLikeDTO): Promise<Like> {
    if (!userId) throw new Error("User id must be provided");

    try {
      if (!likeData.blog_id && !likeData.comment_id)
        throw new Error("Blog or comment id must be provided");

      const patchedLike: Like = await this.likeRepo.editLike(likeData);

      return patchedLike;
    } catch (error) {
      throw error;
    }
  }

  async getLikesByBlogId(blogId: string): Promise<Like[]> {
    if (!blogId) throw new Error("Blog id must be provided");

    try {
      const likes: Like[] = await this.likeRepo.getLikesByBlogId(blogId);

      return likes;
    } catch (error) {
      throw error;
    }
  }

  async getLikesByCommentId(commentId: string): Promise<Like[]> {
    if (!commentId) throw new Error("User id must be provided");

    try {
      const likes: Like[] = await this.likeRepo.getLikesByCommentId(commentId);

      return likes;
    } catch (error) {
      throw error;
    }
  }
}
