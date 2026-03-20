export type Feedback = {
  id: string;
  user_id: string;
  blog_id: string;
  content: string;
  created_at: string;
  deleted_at: string;
};

export type createFeedbackDTO = Omit<
  Feedback,
  "id" | "created_at" | "deleted_at"
>;
export type updateFeedbackDTO =
  | (Pick<Feedback, "id" | "blog_id" | "user_id"> & Partial<Feedback>)
  | Omit<Feedback, "created_at">;

export interface FeedbackRepository {
  createFeedback: (feedbackData: createFeedbackDTO) => Promise<Feedback>;
  editFeedback: (feedbackData: updateFeedbackDTO) => Promise<Feedback>;
  getBlogFeedback: (blogId: string) => Promise<Feedback[]>;
  getFeedbackByUserId: (userId: string) => Promise<Feedback[]>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
}

export interface FeedbackService {
  createFeedback: (
    userId: string,
    feedbackData: createFeedbackDTO,
  ) => Promise<Feedback>;
  editFeedback: (
    userId: string,
    feedbackData: updateFeedbackDTO,
  ) => Promise<Feedback>;
  getBlogFeedback: (blogId: string) => Promise<Feedback[]>;
  getFeedbackByUserId: (userId: string) => Promise<Feedback[]>;
  deleteFeedback: (feedbackId: string) => Promise<void>;
}
