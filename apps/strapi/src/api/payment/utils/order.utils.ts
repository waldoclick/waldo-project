import { OrderResponse } from "../types/payment.type";

interface CreateOrderParams {
  amount: number;
  buy_order: string;
  userId: number;
  is_invoice: boolean;
  payment_method: string;
  payment_response?: unknown;
  document_details?: unknown;
  adId?: number;
  items?: unknown[];
  document_response?: unknown;
}

class OrderUtils {
  /**
   * Create a new order
   * @param params - Structured order parameters
   * @returns Response object with success status and the created order
   */
  public async createAdOrder({
    amount,
    buy_order,
    userId,
    is_invoice = false,
    payment_method,
    payment_response,
    document_details,
    adId,
    items,
    document_response,
  }: CreateOrderParams): Promise<OrderResponse> {
    try {
      const orderData = {
        amount,
        buy_order,
        user: userId,
        is_invoice,
        payment_method: payment_method as "webpay" | "transbank",
        payment_response,
        document_details,
        ad: adId,
        items,
        document_response,
        publishedAt: new Date(),
      };

      // console.log("orderData", orderData);

      const order = await strapi.db
        .query("api::order.order")
        .create({ data: orderData });

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error("Error in createOrder:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get order by ID
   * @param id - The order ID to retrieve
   * @returns Response object with success status and the order if found
   */
  public async getOrderById(id: number): Promise<OrderResponse> {
    try {
      const order = await strapi.db.query("api::order.order").findOne({
        where: { id },
        populate: ["user", "ad"],
      });

      if (!order) {
        return {
          success: false,
          message: "Order not found",
        };
      }

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error("Error in getOrderById:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Updates the document_response field of an order
   * @param orderId - The ID of the order to update
   * @param documentResponse - The document response data to save
   * @returns Response object with success status and the updated order
   */
  public async updateOrderDocumentResponse(
    orderId: number,
    documentResponse: unknown
  ): Promise<OrderResponse> {
    try {
      const order = await strapi.db.query("api::order.order").update({
        where: { id: orderId },
        data: {
          document_response: documentResponse,
        },
      });

      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error("Error in updateOrderDocumentResponse:", error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new OrderUtils();
