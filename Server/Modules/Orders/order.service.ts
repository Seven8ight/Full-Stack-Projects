import type { OrderRepo } from "./order.repo.js";
import type {
  createOrderDTO,
  orderService,
  updateOrderDTO,
} from "./order.types.js";

export class OrderService implements orderService {
  constructor(private orderRepo: OrderRepo) {}

  async createOrder(order: createOrderDTO) {
    if (!order.userId || !order.productIds || !order.price) {
      throw new Error(
        "Create Order Error: Incomplete credentials ensure to pass in user id, product ids and total price of the orders"
      );
    }

    try {
      const newOrder: createOrderDTO = {
        userId: order.userId,
        status: "Incomplete",
        productIds: order.productIds,
        createdAt: new Date().toUTCString(),
        price: order.price,
      };

      return await this.orderRepo.addOrder(newOrder);
    } catch (error) {
      throw error;
    }
  }

  async getOrderById(userId: string, orderId: string) {
    if (!userId || !orderId) {
      throw new Error(
        "Get orders by id Error: Incomplete credentials, ensure to provide the user id and order id respectively"
      );
    }

    try {
      return await this.orderRepo.getOrderById(userId, orderId);
    } catch (error) {
      throw error;
    }
  }

  async getUserOrders(userId: string) {
    if (!userId)
      throw new Error(
        "Get user orders Error: Incomplete credentials, pass in user id to continue"
      );

    try {
      return await this.orderRepo.getUserOrders(userId);
    } catch (error) {
      throw error;
    }
  }

  async updateOrder(orderId: string, newOrderDetails: updateOrderDTO) {
    if (!orderId || !newOrderDetails)
      throw new Error(
        "Incomplete credentials, ensure to pass in the order id and new order details"
      );

    try {
      for (const [key, value] of Object.entries(newOrderDetails)) {
        if (key == "price") {
          if (!Number.isInteger(value))
            throw new Error("Update Order Error: Price should be an integer");
        } else if (key == "productids") JSON.parse(value as string);
      }

      return await this.orderRepo.updateOrder(orderId, newOrderDetails);
    } catch (error) {
      throw error;
    }
  }

  async deleteOrder(userId: string, orderId: string) {
    if (!userId || !orderId)
      throw new Error(
        "Order deletion Error: Incomplete credentials, user id and order id"
      );

    try {
      await this.orderRepo.getOrderById(userId, orderId);

      return await this.orderRepo.deleteOrder(userId, orderId);
    } catch (error) {
      throw error;
    }
  }

  async deleteAllUserOrders(userId: string): Promise<void> {
    if (!userId) throw new Error("User id must be present");

    try {
      await this.orderRepo.deleteAllUserOrders(userId);
    } catch (error) {
      throw error;
    }
  }
}
