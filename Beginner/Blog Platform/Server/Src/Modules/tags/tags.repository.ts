import type { PoolClient, QueryResult } from "pg";
import type { Database } from "../../Config/Database.js";
import type {
  createTagDTO,
  Tag,
  TagRepository,
  updateTagDTO,
} from "./tags.types.js";

export class TagRepo implements TagRepository {
  constructor(private dbClient: Database) {}

  async createTag(tagData: createTagDTO): Promise<Tag> {
    try {
      let keys: string[] = Object.keys(tagData),
        values: string[] = Object.values(tagData),
        paramIndex: number = 1,
        paramIndexing: string[] = Array.from(
          { length: keys.length },
          () => `$${paramIndex++}`,
        );

      const newTag: QueryResult<Tag> = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return await client.query(
            `INSERT INTO tags(${keys.join(",")}) VALUES(${paramIndexing.join(",")})`,
            [...values],
          );
        },
      );

      return newTag.rows[0] as Tag;
    } catch (error) {
      throw error;
    }
  }
  async editTag(tagData: updateTagDTO): Promise<Tag> {
    try {
      let keys: string[] = [],
        values: any[] = [],
        paramIndex: number = 2;

      for (let [key, value] of Object.entries(tagData)) {
        if (key != "id") {
          keys.push(`${key}=$${paramIndex++}`);
          values.push(value);
        }
      }

      const patchTag = await this.dbClient.transaction(
        async (client: PoolClient) => {
          return client.query(
            `UPDATE tags SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
            [tagData.id, ...values],
          );
        },
      );

      return patchTag.rows[0];
    } catch (error) {
      throw error;
    }
  }
  async getTags(): Promise<Tag[]> {
    try {
      const tags: QueryResult<Tag> =
        await this.dbClient.query("SELECT * FROM tags");

      return tags.rows;
    } catch (error) {
      throw error;
    }
  }
}
