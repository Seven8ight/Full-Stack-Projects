import type {
  createFeedbackDTO,
  Feedback,
  FeedbackRepository,
  FeedbackService,
  updateFeedbackDTO,
} from "./feedback.types.js";

export class FeedbackServ implements FeedbackService {
  constructor(private feedbackRepo: FeedbackRepository) {}

  private containsAllFields(data: any): data is createFeedbackDTO {
    if (!data || typeof data != "object") return false;

    const allowedFields: readonly Omit<keyof createFeedbackDTO, "user_id">[] = [
      "blog_id",
      "content",
    ];

    for (let [key, value] of Object.entries(data)) {
      if (!allowedFields.includes(key)) return false;
      if (!value) return false;
    }

    return true;
  }

  async getBlogFeedback(blogId: string): Promise<Feedback[]> {
    try {
      const blogFeedback = await this.feedbackRepo.getBlogFeedback(blogId);

      return blogFeedback;
    } catch (error) {
      throw error;
    }
  }

  async createFeedback(
    userId: string,
    feedbackData: createFeedbackDTO,
  ): Promise<Feedback> {
    try {
      const feedbackValidator = this.containsAllFields(feedbackData);

      if (!feedbackValidator)
        throw new Error(
          "Invalid feedback data, ensure to provide defined values",
        );

      feedbackData.user_id = userId;

      const newComment = await this.feedbackRepo.createFeedback(feedbackData);

      return newComment;
    } catch (error) {
      throw error;
    }
  }

  async editFeedback(
    userId: string,
    feedbackData: updateFeedbackDTO,
  ): Promise<Feedback> {
    if (
      !userId ||
      !feedbackData.id ||
      !feedbackData.blog_id ||
      !feedbackData.content
    )
      throw new Error("Values not provided");

    try {
      let newFeedbackData: Record<string, any> = {};

      newFeedbackData.id = feedbackData.id;
      newFeedbackData.user_id = userId;
      newFeedbackData.blog_id = feedbackData.blog_id;
      newFeedbackData.content = feedbackData.content;

      const editRequest = await this.feedbackRepo.editFeedback(
        newFeedbackData as updateFeedbackDTO,
      );

      return editRequest;
    } catch (error) {
      throw error;
    }
  }

  async getFeedbackByUserId(userId: string): Promise<Feedback[]> {
    if (!userId) throw new Error("User id not provided");

    try {
      const feedback = await this.feedbackRepo.getFeedbackByUserId(userId);

      return feedback;
    } catch (error) {
      throw error;
    }
  }

  async deleteFeedback(feedbackId: string): Promise<void> {
    if (!feedbackId) throw new Error("Feedback id not provided");

    try {
      await this.feedbackRepo.deleteFeedback(feedbackId);
    } catch (error) {
      throw error;
    }
  }
}
