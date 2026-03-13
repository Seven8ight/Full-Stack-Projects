import type { Pool, PoolClient, QueryResult } from "pg";
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
            "INSERT INTO blog_analytics(blog_id) VALUES($1)",
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
      let keys: string[] = [],
        values = Object.values(analyticData),
        paramIndex: number = 3;

      for (let key of Object.keys(analyticData)) {
        keys.push(`${key}=$${paramIndex++}`);
      }

      const updateAnalytic: QueryResult<Analytic> =
        await this.dbClient.transaction(async (client: PoolClient) => {
          return await client.query(
            `UPDATE blog_analytics SET ${keys.join(",")} WHERE blog_id=$1 AND date=CURRENT_DATE`,
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
  ): Promise<Analytic | Analytic[]> {
    const dateSelected = new Date(selectedDate),
      queryDate = dateSelected.toISOString().split("T")[0];

    try {
      const filteredBlogAnalytics = await this.dbClient.query(
        "SELECT * FROM blog_analytics WHERE date= DATE $1 and blog_id=$2",
        [queryDate, blogId],
      );

      return filteredBlogAnalytics.rows;
    } catch (error) {
      throw error;
    }
  }
}
