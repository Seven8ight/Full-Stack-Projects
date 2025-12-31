import type { Client, QueryResult } from "pg";
import type { Post, PostDTO, PostRepo, updatePostDTO } from "./posts.types.js";

export class PostRepository implements PostRepo {
  constructor(private pgClient: Client) {}

  async createPost(postDetails: PostDTO): Promise<Post> {
    const { title, slug, content, author_id } = postDetails;

    try {
      const newPost: QueryResult<Post> = await this.pgClient.query(
        "INSERT INTO posts(title,slug,content,published,author_id) VALUES($1,$2,$3,$4,$5) RETURNING *",
        [title, slug, content, true, author_id]
      );

      if (newPost.rowCount && newPost.rowCount > 0)
        return newPost.rows[0] as Post;
      throw new Error("Post not created, try again");
    } catch (error) {
      throw error;
    }
  }

  async editPost(newPostDetails: updatePostDTO): Promise<Post> {
    const { author_id } = newPostDetails,
      date = new Date();

    let keys: string[] = [],
      values: any[] = [],
      parsedIndex = 2;

    for (let [key, value] of Object.entries(newPostDetails)) {
      if (key == "author_id" || key == "id") continue;

      keys.push(`${key}=$${parsedIndex++}`);
      values.push(value);
    }

    keys.push(`updated_at=$${parsedIndex++}`);
    values.push(date.toUTCString());

    try {
      const updateQuery: QueryResult<Post> = await this.pgClient.query(
        `UPDATE posts SET ${keys.join(", ")} WHERE author_id=$1 RETURNING *`,
        [author_id, ...values]
      );

      if (updateQuery.rowCount && updateQuery.rowCount > 0)
        return updateQuery.rows[0] as Post;
      throw new Error("Update unsuccessful, try again later");
    } catch (error) {
      throw error;
    }
  }

  async getAuthorPost(authorId: string, postId: string): Promise<Post> {
    try {
      const retrievePost: QueryResult<Post> = await this.pgClient.query(
        "SELECT * FROM posts WHERE id=$1 AND author_id=$2",
        [postId, authorId]
      );

      if (retrievePost.rowCount && retrievePost.rowCount > 0)
        return retrievePost.rows[0] as Post;

      throw new Error(
        `Author ${authorId} does not have a post of id, ${postId}`
      );
    } catch (error) {
      throw error;
    }
  }

  async getAllAuthorPosts(authorId: string): Promise<Post[]> {
    try {
      const retrievePosts: QueryResult<Post> = await this.pgClient.query(
        "SELECT * FROM posts WHERE author_id=$1",
        [authorId]
      );

      if (retrievePosts.rowCount && retrievePosts.rowCount > 0)
        return retrievePosts.rows;
      throw new Error("Author id invalid");
    } catch (error) {
      throw error;
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      const retrieveAllPosts: QueryResult<Post> = await this.pgClient.query(
        "SELECT * FROM posts"
      );

      if (retrieveAllPosts.rowCount && retrieveAllPosts.rowCount > 0)
        return retrieveAllPosts.rows;
      throw new Error("Database error in fetching all posts");
    } catch (error) {
      throw error;
    }
  }

  async deleteAuthorPost(authorId: string, postId: string): Promise<boolean> {
    try {
      const deleteAuthorPost = await this.pgClient.query(
        "DELETE FROM posts WHERE id=$1 AND author_id=$2",
        [authorId, postId]
      );

      if (deleteAuthorPost.rowCount && deleteAuthorPost.rowCount > 0)
        return true;
      return false;
    } catch (error) {
      throw error;
    }
  }

  async deleteAllAuthorPost(authorId: string): Promise<boolean> {
    try {
      const deleteAllAuthorPosts = await this.pgClient.query(
        "DELETE FROM posts WHERE author_id=$1",
        [authorId]
      );

      if (deleteAllAuthorPosts.rowCount && deleteAllAuthorPosts.rowCount > 0)
        return true;
      return false;
    } catch (error) {
      throw error;
    }
  }
}
