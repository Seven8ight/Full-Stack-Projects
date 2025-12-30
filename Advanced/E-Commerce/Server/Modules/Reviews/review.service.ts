import type {
  reviewRepo,
  reviewService,
  review,
  createReviewDTO,
  updateReviewDTO,
} from "./review.types.js";

export class ReviewService implements reviewService {
  constructor(private reviewRepo: reviewRepo) {}

  async getReview(userId: string, reviewId: string): Promise<review> {
    if (!userId || !reviewId)
      throw new Error(
        "Get Review: Incomplete credentials review id and user id should be provided"
      );

    try {
      return await this.reviewRepo.getReview(userId, reviewId);
    } catch (error) {
      throw error;
    }
  }

  async getReviews(productId: string): Promise<review[]> {
    if (!productId)
      throw new Error(
        "Get all reviews Error: Incomplete credentails for review getter, provide product id"
      );

    try {
      return await this.reviewRepo.getReviews(productId);
    } catch (error) {
      throw error;
    }
  }

  async createReview(review: createReviewDTO): Promise<review> {
    if (
      !review.comment ||
      !review.productId ||
      !review.rating ||
      !review.userId
    )
      throw new Error(
        "Create Review Error: Ensure to provide enough credentials, user id, comment, rating, product id"
      );

    const newReview: createReviewDTO = {
      userId: review.userId,
      productId: review.productId,
      comment: review.comment,
      createdAt: new Date().toUTCString(),
      rating: review.rating,
    };

    try {
      return await this.reviewRepo.addReview(newReview);
    } catch (error) {
      throw error;
    }
  }

  async updateReview(
    userId: string,
    reviewId: string,
    newReviewData: updateReviewDTO
  ): Promise<review> {
    if (!userId || !reviewId || !newReviewData)
      throw new Error(
        "Review Update Error: Incomplete credentials, user id, review id and the new details should be provided"
      );

    try {
      let review = await this.reviewRepo.updateReview(
        userId,
        reviewId,
        newReviewData
      );

      return review;
    } catch (error) {
      throw error;
    }
  }

  async deleteReview(userId: string, reviewId: string): Promise<void> {
    if (!userId || !reviewId)
      throw new Error("Review deletion Error: Review credentials not provided");

    try {
      await this.reviewRepo.getReview(userId, reviewId);

      await this.reviewRepo.deleteReview(userId, reviewId);
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUserReviews(userId: string) {
    try {
      if (!userId)
        throw new Error(
          "Review deletion all Error: User id should be provided before completion"
        );

      await this.reviewRepo.deleteAllUserReviews(userId);
    } catch (error) {
      throw error;
    }
  }
}
