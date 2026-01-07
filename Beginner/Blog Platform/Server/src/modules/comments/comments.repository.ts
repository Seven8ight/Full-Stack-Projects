import type { Client, QueryResult } from "pg";
import type {
  Comment,
  CommentDto,
  CommentRepo,
  updateCommentDTO,
} from "./comments.types.js";

export class CommentRepository implements CommentRepo {
  constructor(private pgClient: Client) {}

  async createComment(commentDetails: CommentDto): Promise<Comment> {
    const { post_id, content, author_id } = commentDetails;

    try {
      const newPost: QueryResult<Comment> = await this.pgClient.query(
        "INSERT INTO comments(post_id,content,author_id) VALUES($1,$2,$3) RETURNING *",
        [post_id, content, author_id]
      );

      if (newPost.rowCount && newPost.rowCount > 0)
        return newPost.rows[0] as Comment;
      throw new Error("Post not created, try again");
    } catch (error) {
      throw error;
    }
  }

  async editComment(newCommentDetails: updateCommentDTO): Promise<Comment> {
    const { id, content } = newCommentDetails,
      date = new Date();

    try {
      const updatedComment = await this.pgClient.query(
        "UPDATE comments SET content=$1,updated_at=$2 WHERE id=$3 RETURNING *",
        [content, date.toUTCString(), id]
      );

      if (updatedComment.rowCount && updatedComment.rowCount > 0)
        return updatedComment.rows[0] as Comment;
      throw new Error("Update failed");
    } catch (error) {
      throw error;
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const getComments: QueryResult<Comment> = await this.pgClient.query(
        "SELECT * FROM comments WHERE post_id=$1",
        [postId]
      );

      if (getComments.rowCount && getComments.rowCount > 0)
        return getComments.rows;
      throw new Error(`No comments on post ${postId}`);
    } catch (error) {
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const deleteQuery = await this.pgClient.query(
        "DELETE FROM comments WHERE id=$1",
        [commentId]
      );

      if (deleteQuery.rowCount && deleteQuery.rowCount > 0) return true;
      throw new Error(`Comment of id, ${commentId} does not exist`);
    } catch (error) {
      throw error;
    }
  }

  async deleteUserComments(authorId: string): Promise<boolean> {
    try {
      const deleteQuery = await this.pgClient.query(
        "DELETE FROM comments WHERE author_id=$1",
        [authorId]
      );

      if (deleteQuery.rowCount && deleteQuery.rowCount > 0) return true;
      return false;
    } catch (error) {
      throw error;
    }
  }
}
