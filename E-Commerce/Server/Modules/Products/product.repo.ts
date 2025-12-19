import crypto from "crypto";
import {
  type Product,
  type productDTO,
  type ProductRepo,
  type updateProductDTO,
} from "./product.types.js";
import { type Client, type QueryResult } from "pg";

export class ProductRepository implements ProductRepo {
  constructor(private db: Client) {}

  async addProduct(productDetails: productDTO): Promise<Product> {
    try {
      const productId = crypto.randomUUID();
      let query = "",
        values: any[] = [];

      if (productDetails.image_url) {
        query = `
          INSERT INTO products(id, name, image_url, description, price, category, discount)
          VALUES($1, $2, $3, $4, $5, $6, $7)
          RETURNING *;
        `;
        values = [
          productId,
          productDetails.name,
          productDetails.image_url,
          productDetails.description ?? null,
          productDetails.price,
          productDetails.category,
          0,
        ];
      } else {
        query = `
          INSERT INTO products(id, name, description, price, category, discount)
          VALUES($1, $2, $3, $4, $5, $6)
          RETURNING *;
        `;
        values = [
          productId,
          productDetails.name,
          productDetails.description ?? null,
          productDetails.price,
          productDetails.category,
          0,
        ];
      }

      const result: QueryResult<Product> = await this.db.query(query, values);

      if (result.rowCount === 0) {
        throw new Error("Product insertion failed");
      }
      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }

  async editProduct(
    productId: string,
    newProductDetails: updateProductDTO
  ): Promise<Product> {
    try {
      if (Object.keys(newProductDetails).length === 0) {
        throw new Error("No updates provided");
      }

      const setClauses: string[] = [],
        values: any[] = [];

      let paramIndex = 1;

      for (const [key, value] of Object.entries(newProductDetails)) {
        setClauses.push(`${key} = $${paramIndex++}`);
        values.push(value);
      }

      values.push(productId);

      const query = `
        UPDATE products
        SET ${setClauses.join(", ")}
        WHERE id = $${paramIndex}
        RETURNING *;
      `,
        result: QueryResult<Product> = await this.db.query(query, values);

      if (result.rowCount === 0) {
        throw new Error("Product not found or update failed");
      }
      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      const result: QueryResult = await this.db.query(
        "DELETE FROM products WHERE id = $1;",
        [productId]
      );
      if (result.rowCount === 0) {
        throw new Error("Product not found");
      }
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }

  async getProducts(): Promise<Product[]> {
    try {
      const result: QueryResult<Product> = await this.db.query(
        "SELECT * FROM products;"
      );

      return result.rows;
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }

  async getProductById(productId: string): Promise<Product> {
    if (!productId) {
      throw new Error("Product ID must be provided");
    }

    try {
      const result: QueryResult<Product> = await this.db.query(
        "SELECT * FROM products WHERE id = $1;",
        [productId]
      );

      if (result.rowCount === 0) {
        throw new Error("Product not found");
      }

      return result.rows[0] as Product;
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }

  async getProductsByCategory(category: string | string[]): Promise<Product[]> {
    try {
      let query = "",
        values: any[] = [];

      if (Array.isArray(category)) {
        query = "SELECT * FROM products WHERE category @> $1;";
        values = [category];
      } else {
        query = "SELECT * FROM products WHERE category = $1;";
        values = [category];
      }

      const result: QueryResult<Product> = await this.db.query(query, values);

      return result.rows;
    } catch (error) {
      throw new Error(`DB Error: ${(error as Error).message}`);
    }
  }
}
