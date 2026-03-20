import type {
  Comment,
  CommentRepo,
  CommentService,
  createCommentDTO,
  updateCommentDTO,
} from "./comment.types.js";

export class CommentServ implements CommentService {
  constructor(private commentRepo: CommentRepo) {}

  allowedFields: readonly (keyof createCommentDTO)[] = [
    "user_id",
    "blog_id",
    "content",
    "like_count",
  ];

  private isValidCreateComment(data: any): data is createCommentDTO {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return false;
    }

    const presentKeys = new Set(Object.keys(data));

    for (const field of this.allowedFields) {
      if (!presentKeys.has(field) || data[field] == null) {
        return false;
      }

      const value = data[field];
      if (typeof value === "string" && value.trim() === "") {
        return false;
      }
    }

    for (const key of presentKeys) {
      if (!this.allowedFields.includes(key as any)) {
        return false;
      }
    }

    return true;
  }

  async createComment(
    userId: string,
    commentData: createCommentDTO,
  ): Promise<Comment> {
    if (!userId) throw new Error("User id not provided");

    try {
      let newCommentData: Record<string, any> = {};

      for (let [key, value] of Object.entries(commentData)) {
        if (key in this.allowedFields) continue;
        if (key == "like_count") {
          if (!(typeof Number.parseInt(value) == "number"))
            throw new Error("Like count only accepts numbers");
        } else {
          if (!value) throw new Error(`${key} has no defined value`);
        }

        newCommentData[key] = value;
      }

      newCommentData.user_id = userId;
      let commentChecker = this.isValidCreateComment(newCommentData);

      if (commentChecker == false)
        throw new Error(
          "Invalid comment body, ensure all fields are present and with defined values",
        );

      const creationRequest = await this.commentRepo.createComment(
        newCommentData as createCommentDTO,
      );

      return creationRequest;
    } catch (error) {
      throw error;
    }
  }

  async editComment(
    userId: string,
    commentData: updateCommentDTO,
  ): Promise<Comment> {
    if (!userId) throw new Error("User id not provided");

    try {
      let newCommentData: Record<string, any> = {};

      for (let [key, value] of Object.entries(commentData)) {
        if (key.toLowerCase() in this.allowedFields) continue;

        if (!value || (typeof value == "string" && value.trim().length <= 0))
          throw new Error(`${key} has a empty/undefined value`);

        newCommentData[key] = value;
      }

      newCommentData.user_id = userId;

      const editQuery = await this.commentRepo.editComment(
        newCommentData as updateCommentDTO,
      );

      return editQuery;
    } catch (error) {
      throw error;
    }
  }

  async getBlogComments(blogId: string): Promise<Comment[]> {
    if (!blogId) throw new Error("Blog id not provided");

    try {
      const retrieveComments = await this.commentRepo.getBlogComments(blogId);

      return retrieveComments;
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string, userId: string): Promise<void> {
    if (!commentId || !userId)
      throw new Error("Comment and User id not provided");

    try {
      await this.commentRepo.deleteComment(commentId, userId);
    } catch (error) {
      throw error;
    }
  }

  async deleteUserComments(userId: string): Promise<void> {
    if (!userId) throw new Error("User id not provided");
    try {
      await this.commentRepo.deleteUserComments(userId);
    } catch (error) {
      throw error;
    }
  }
}
