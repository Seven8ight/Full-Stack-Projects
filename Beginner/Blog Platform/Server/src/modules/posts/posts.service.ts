import type {
  PostDTO,
  PostRepo,
  PostServ,
  updatePostDTO,
  Post,
} from "./posts.types.js";

export class PostService implements PostServ {
  constructor(private postRepo: PostRepo) {}

  async addPost(postDetails: PostDTO): Promise<Post> {
    let validation: boolean = true,
      errorMsg: string = "";

    const requiredFields = ["title", "slug", "content", "author_id"];

    for (let [key, value] of Object.entries(postDetails)) {
      if (!requiredFields.includes(key)) {
        validation = false;
        errorMsg = `${key} not allowed`;
        break;
      }

      if (value.trim().length <= 0) {
        validation = false;
        errorMsg = `${key} has an empty value`;
        break;
      }
    }

    if (validation) return await this.postRepo.createPost(postDetails);
    throw new Error(errorMsg);
  }

  async editPost(postId: string, newPostDetails: updatePostDTO): Promise<Post> {
    if (!newPostDetails.author_id) throw new Error("Author id not provided");

    let acceptedFields: updatePostDTO = {
      author_id: newPostDetails.author_id,
    };

    const requiredFields = ["title", "slug", "content", "author_id"];

    for (let [key, value] of Object.entries(newPostDetails)) {
      if (!requiredFields.includes(key)) continue;

      if (value.trim().length <= 0) continue;

      acceptedFields[key as keyof updatePostDTO] = value;
    }

    return await this.postRepo.editPost(postId, acceptedFields);
  }

  async getAuthorPost(authorId: string, postId: string): Promise<Post> {
    if (!authorId || !postId)
      throw new Error("Author id or Post id not provided");

    return await this.postRepo.getAuthorPost(authorId, postId);
  }

  async getAllAuthorPosts(authorId: string): Promise<Post[]> {
    if (!authorId) throw new Error("Author id not provided");

    try {
      return await this.postRepo.getAllAuthorPosts(authorId);
    } catch (error) {
      throw error;
    }
  }

  async getAllPosts(): Promise<Post[]> {
    try {
      return await this.postRepo.getAllPosts();
    } catch (error) {
      throw error;
    }
  }

  async deleteAuthorPost(authorId: string, postId: string): Promise<boolean> {
    if (!authorId || !postId)
      throw new Error("Author id and post id must be provided");

    try {
      return await this.postRepo.deleteAuthorPost(authorId, postId);
    } catch (error) {
      throw error;
    }
  }

  async deleteAllAuthorPost(authorId: string): Promise<boolean> {
    if (!authorId) throw new Error("Author id must be provided");

    try {
      return await this.postRepo.deleteAllAuthorPost(authorId);
    } catch (error) {
      throw error;
    }
  }
}
