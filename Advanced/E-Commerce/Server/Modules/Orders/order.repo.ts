import type {
  Client,
  QueryResult,
} from "../../node_modules/@types/pg/index.js";
import type {
  createOrderDTO,
  Order,
  orderRepo,
  updateOrderDTO,
} from "./order.types.js";
import crypto from "crypto";

export class OrderRepo implements orderRepo {
  constructor(private dbClient: Client) {}

  async addOrder(order: createOrderDTO): Promise<Order> {
    const orderId = crypto.randomUUID();

    try {
      console.log([orderId, ...Object.values(order)]);
      const orderCreation = await this.dbClient.query(
        "INSERT INTO orders(id,user_id,status,productids,created_at,price) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
        [orderId, ...Object.values(order)]
      );
      return orderCreation.rows[0];
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(userId: string, orderId: string): Promise<Order> {
    try {
      const orderRetrieval: QueryResult<Order> = await this.dbClient.query(
        "SELECT * FROM orders WHERE id=$1 AND user_id=$2",
        [orderId, userId]
      );

      if (orderRetrieval.rowCount == 0) throw new Error("Order is not found");

      return orderRetrieval.rows[0] as Order;
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    try {
      const orderRetrieval: QueryResult<Order> = await this.dbClient.query(
        "SELECT * FROM orders WHERE user_id=$1",
        [userId]
      );

      if (orderRetrieval.rowCount == 0) throw new Error("Order is not found");

      return orderRetrieval.rows;
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(
    orderId: string,
    newOrderDetails: updateOrderDTO
  ): Promise<Order> {
    try {
      if (Object.keys(newOrderDetails).length === 0)
        throw new Error("No fields provided for update");

      let setKeys: string[] = [],
        values: any[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newOrderDetails)) {
        if (key == "userId") key = "user_id";
        else if (key == "productIds") key = "productids";
        setKeys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const updateQuery: QueryResult<Order> = await this.dbClient.query(
        `UPDATE orders SET ${setKeys.join(", ")} WHERE id=$1 RETURNING *`,
        [orderId, ...values]
      );

      if (updateQuery.rowCount == 0) throw new Error("Order not found");

      return updateQuery.rows[0] as Order;
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(userId: string, orderId: string): Promise<void> {
    try {
      const deleteQuery: QueryResult<Order> = await this.dbClient.query(
        "DELETE FROM ORDERS WHERE id=$1 AND user_id=$2",
        [orderId, userId]
      );

      if (deleteQuery.rowCount == 0) throw new Error("Order not found");
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUserOrders(userId: string): Promise<void> {
    try {
      await this.dbClient.query("DELETE FROM orders WHERE user_id=$1", [
        userId,
      ]);
    } catch (error) {
      throw error;
    }
  }
}
