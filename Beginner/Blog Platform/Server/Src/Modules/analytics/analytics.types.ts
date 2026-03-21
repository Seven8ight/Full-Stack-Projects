export type Analytic = {
  blog_id: string;
  date: string;
  views: number;
  unique_views: number;
  likes_added: number;
  comments_added: number;
};

export type updateAnalyticDTO = Omit<Analytic, "blog_id"> | Partial<Analytic>;

export interface AnalyticRepository {
  createAnalytic: (blogId: string) => Promise<Analytic>;
  editAnalytic: (
    blogId: string,
    analyticData: updateAnalyticDTO,
  ) => Promise<Analytic>;
  getBlogAnalytic: (blogId: string) => Promise<Analytic[]>;
  getBlogAnalyticsByDate: (
    blogId: string,
    selectedDate: string,
  ) => Promise<Analytic>;
}
export interface AnalyticService {
  createAnalytic: (blogId: string) => Promise<Analytic>;
  editAnalytic: (
    blogId: string,
    analyticData: updateAnalyticDTO,
  ) => Promise<Analytic>;
  getBlogAnalytic: (blogId: string) => Promise<Analytic[]>;
  getBlogAnalyticsByDate: (
    blogId: string,
    selectedDate: string,
  ) => Promise<Analytic>;
}
