import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  Analytic,
  AnalyticRepository,
  updateAnalyticDTO,
} from "./analytics.types.js";

export class AnalyticsRepo implements AnalyticRepository {
  constructor(private dbClient: Database) {}

  async createAnalytic(blogId: string): Promise<Analytic> {
    try {
      const newAnalytic: QueryResult<Analytic> =
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            "INSERT INTO blog_analytics(blog_id) VALUES($1) RETURNING *",
            [blogId],
          );
        });

      return newAnalytic.rows[0] as Analytic;
    } catch (error) {
      throw error;
    }
  }

  async editAnalytic(
    blogId: string,
    analyticData: updateAnalyticDTO,
  ): Promise<Analytic> {
    try {
      const date = new Date(),
        formattedString = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;

      const blogAnalytic = await this.getBlogAnalyticsByDate(
        blogId,
        formattedString,
      );

      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (let key of Object.keys(analyticData)) {
        if (key != "blog_id" && key != "date") {
          keys.push(`${key}=$${paramIndex++}`);

          if (key == "views")
            values.push(blogAnalytic.views + analyticData.views!);
          else if (key == "likes_added")
            values.push(blogAnalytic.likes_added + analyticData.likes_added!);
          else if (key == "unique_views")
            values.push(blogAnalytic.unique_views + analyticData.unique_views!);
          else if (key == "comments_added")
            values.push(
              blogAnalytic.comments_added + analyticData.comments_added!,
            );
          else values.push(analyticData[key as keyof updateAnalyticDTO]);
        }
      }

      const updateAnalytic: QueryResult<Analytic> =
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            `UPDATE blog_analytics SET ${keys.join(",")} WHERE blog_id=$1 AND date=CURRENT_DATE RETURNING *`,
            [blogId, ...values],
          );
        });

      return updateAnalytic.rows[0] as Analytic;
    } catch (error) {
      throw error;
    }
  }

  async getBlogAnalytic(blogId: string): Promise<Analytic[]> {
    try {
      const blogAnalytics = await this.dbClient.query(
        "SELECT * FROM blog_analytics WHERE blog_id=$1",
        [blogId],
      );

      return blogAnalytics.rows;
    } catch (error) {
      throw error;
    }
  }

  async getBlogAnalyticsByDate(
    blogId: string,
    selectedDate: string,
  ): Promise<Analytic> {
    const dateSelected = new Date(selectedDate),
      queryDate = dateSelected.toISOString().split("T")[0];

    try {
      const filteredBlogAnalytics = await this.dbClient.query(
        "SELECT * FROM blog_analytics WHERE date=$1::date and blog_id=$2",
        [queryDate, blogId],
      );

      return filteredBlogAnalytics.rows[0];
    } catch (error) {
      throw error;
    }
  }
}
