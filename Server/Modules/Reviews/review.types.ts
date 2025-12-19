export interface reviewRepo {
  getReview: (userId: string, reviewId: string) => Promise<review>;
  getReviews: (productId: string) => Promise<review[]>;
  addReview: (review: createReviewDTO) => Promise<review>;
  updateReview: (
    userId: string,
    reviewId: string,
    newReviewData: updateReviewDTO
  ) => Promise<review>;
  deleteReview: (userId: string, reviewId: string) => Promise<void>;
  deleteAllUserReviews: (userId: string) => Promise<void>;
}

export interface reviewService {
  getReview: (userId: string, reviewId: string) => Promise<review>;
  getReviews: (productId: string) => Promise<review[]>;
  createReview: (review: createReviewDTO) => Promise<review>;
  updateReview: (
    userId: string,
    reviewId: string,
    newReviewData: updateReviewDTO
  ) => Promise<review>;
  deleteReview: (userId: string, reviewId: string) => Promise<void>;
  deleteAllUserReviews: (userId: string) => Promise<void>;
}

export type review = {
  id: string;
  userId: string;
  productId: string;
  comment: string;
  createdAt: string;
  rating: string;
};

export type createReviewDTO = Omit<review, "id">;
export type updateReviewDTO = Pick<
  review,
  "userId" & "reviewId" & "productId"
> &
  Partial<Omit<review, "userId" & "reviewId" & "productId">>;
