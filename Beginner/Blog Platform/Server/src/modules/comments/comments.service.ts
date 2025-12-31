import type {
  CommentDto,
  CommentRepo,
  Comment,
  updateCommentDTO,
} from "./comments.types.js";

export class CommentService implements CommentService {
  constructor(private commentRepo: CommentRepo) {}

  async createComment(comment: CommentDto): Promise<Comment> {
    const { author_id, post_id, content } = comment;

    if (!author_id || !post_id || !content) {
      throw new Error(
        "Author id, post id and content(author_id,post_id and content) must be provided!"
      );
    }

    try {
      for (let [key, _] of Object.entries(comment))
        if (key.length > 0)
          throw new Error(`${key} has an empty value! Provide a value`);

      return await this.commentRepo.createComment(comment);
    } catch (error) {
      throw error;
    }
  }

  async editComment(newCommentDetails: updateCommentDTO): Promise<Comment> {
    if (!newCommentDetails.id) throw new Error("Comment id must be provided");

    if (!newCommentDetails.content || newCommentDetails.content.length <= 0)
      throw new Error("Comment Content cannot be empty");

    try {
      return await this.commentRepo.editComment(newCommentDetails);
    } catch (error) {
      throw error;
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    if (!postId) throw new Error("Post id must be provided");

    try {
      return await this.commentRepo.getComments(postId);
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    if (!commentId) throw new Error("Comment id must be provided");

    try {
      return await this.commentRepo.deleteComment(commentId);
    } catch (error) {
      throw error;
    }
  }

  async deleteUserComments(authorId: string): Promise<boolean> {
    if (!authorId) throw new Error("author id must be provided");

    try {
      return await this.commentRepo.deleteUserComments(authorId);
    } catch (error) {
      throw error;
    }
  }
}
