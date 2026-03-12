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
    if (!userId) throw new Error("User id not provided");

    const allowedFields: string[] = ["id", "content"];

    try {
      let newFeedbackData: Record<string, any> = { ...feedbackData };

      for (let [key, value] of Object.entries(feedbackData)) {
        if (!(key in allowedFields)) continue;
        if (!value) throw new Error(`${key} has an undefined value`);

        newFeedbackData[key] = value;
      }

      feedbackData.user_id = userId;

      const editRequest = await this.feedbackRepo.editFeedback(feedbackData);

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
