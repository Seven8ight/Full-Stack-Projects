export interface orderRepo {
  addOrder: (order: createOrderDTO) => Promise<Order>;
  getOrderById: (userId: string, orderId: string) => Promise<Order>;
  getUserOrders: (userId: string) => Promise<Order[]>;
  updateOrder: (
    orderId: string,
    newOrderDetails: updateOrderDTO
  ) => Promise<Order>;
  deleteOrder: (userId: string, orderId: string) => Promise<void>;
  deleteAllUserOrders: (userId: string) => Promise<void>;
}

export interface orderService {
  createOrder: (order: createOrderDTO) => Promise<Order>;
  getOrderById: (userId: string, orderId: string) => Promise<Order>;
  getUserOrders: (userId: string) => Promise<Order[]>;
  updateOrder: (
    orderId: string,
    newOrderDetails: updateOrderDTO
  ) => Promise<Order>;
  deleteOrder: (userId: string, orderId: string) => Promise<void>;
  deleteAllUserOrders: (userId: string) => Promise<void>;
}

export type Order = {
  id: string;
  userId: string;
  productIds: string[];
  price: number;
  createdAt: string;
  status: "Complete" | "Incomplete";
};

export type createOrderDTO = Omit<Order, "id">;
export type updateOrderDTO = Pick<Order, "id"> & Partial<Omit<Order, "id">>;
