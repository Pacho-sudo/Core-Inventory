import { 
  createDeliveryOrder, 
  validateDelivery, 
  getDeliveryOrders, 
  getDeliveryOrderDetail,
  CreateDeliveryOrderInput 
} from "@/prisma/delivery-order";

/**
 * Service to handle high-level delivery order operations.
 * This acts as a bridge between the API routes and the Prisma database layer.
 */
export class DeliveryOrderService {
  /**
   * Create a new delivery order in pending status.
   */
  static async createOrder(data: CreateDeliveryOrderInput) {
    return await createDeliveryOrder(data);
  }

  /**
   * Validate a delivery order, reducing stock and recording movement.
   */
  static async validateOrder(id: string, userId: string) {
    return await validateDelivery(id, userId);
  }

  /**
   * Fetch a list of delivery orders based on filters.
   */
  static async listOrders(filters: { warehouseId?: string; status?: string } = {}) {
    return await getDeliveryOrders(filters);
  }

  /**
   * Get full details of a single delivery order.
   */
  static async getOrder(id: string) {
    return await getDeliveryOrderDetail(id);
  }
}
