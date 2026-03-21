import type {
  Analytic,
  AnalyticRepository,
  AnalyticService,
  updateAnalyticDTO,
} from "./analytics.types.js";

export class AnalyticServ implements AnalyticService {
  constructor(private analyticRepo: AnalyticRepository) {}

  async createAnalytic(blogId: string): Promise<Analytic> {
    try {
      if (!blogId) throw new Error("Blog id must be provided");
      const newAnalytic = await this.analyticRepo.createAnalytic(blogId);

      return newAnalytic;
    } catch (error) {
      throw error;
    }
  }

  async editAnalytic(
    blogId: string,
    analyticData: updateAnalyticDTO,
  ): Promise<Analytic> {
    let allowedFields: string[] = [
      "views",
      "unique_views",
      "likes_added",
      "comments_added",
    ];

    try {
      if (!blogId) throw new Error("Blog id must be provided");
      let filteredAnalyticData: Record<string, any> = {};

      for (let [key, value] of Object.entries(analyticData)) {
        if (!allowedFields.includes(key)) continue;

        filteredAnalyticData[key] = value;
      }

      filteredAnalyticData.blog_id = blogId;

      const updateAnalytics = await this.analyticRepo.editAnalytic(
        blogId,
        filteredAnalyticData,
      );

      return updateAnalytics;
    } catch (error) {
      throw error;
    }
  }
  async getBlogAnalytic(blogId: string): Promise<Analytic[]> {
    try {
      if (!blogId) throw new Error("Blog id must be provided");

      const blogAnalytics = await this.analyticRepo.getBlogAnalytic(blogId);

      return blogAnalytics;
    } catch (error) {
      throw error;
    }
  }
  async getBlogAnalyticsByDate(
    blogId: string,
    selectedDate: string,
  ): Promise<Analytic> {
    try {
      const blogAnalyticsByDate =
        await this.analyticRepo.getBlogAnalyticsByDate(blogId, selectedDate);

      return blogAnalyticsByDate;
    } catch (error) {
      throw error;
    }
  }
}
