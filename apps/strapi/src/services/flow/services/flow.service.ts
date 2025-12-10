import {
  IFlowConfig,
  IFlowPaymentOrderRequest,
  IFlowPaymentOrderResponse,
  IFlowPaymentStatusResponse,
  IFlowSubscriptionRequest,
  IFlowSubscriptionResponse,
  IFlowCustomerCreateRequest,
  IFlowCustomerCreateResponse,
  IFlowInvoice,
  IFlowPaginatedResponse,
} from "../types/flow.types";
import axios from "axios";
import crypto from "crypto";

// Use 'any' for Strapi type if the specific import is causing issues
type Strapi = any;

export class FlowService {
  private config: IFlowConfig;
  private strapi: Strapi;

  constructor(config: IFlowConfig, strapi: Strapi) {
    this.config = config;
    this.strapi = strapi;
  }

  private signRequest(params: Record<string, any>): string {
    const sortedKeys = Object.keys(params).sort();
    const stringToSign = sortedKeys
      .map((key) => `${key}${params[key]}`)
      .join("");

    const signature = crypto
      .createHmac("sha256", this.config.secretKey)
      .update(stringToSign)
      .digest("hex");

    return signature;
  }

  async createPaymentOrder(
    orderData: IFlowPaymentOrderRequest
  ): Promise<IFlowPaymentOrderResponse> {
    const endpoint = `${this.config.apiBaseUrl}/payment/create`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      commerceOrder: orderData.commerceOrder,
      subject: orderData.subject,
      amount: Math.round(orderData.amount),
      email: orderData.email,
      urlConfirmation: orderData.urlConfirmacion,
      urlReturn: orderData.urlRetorno,
    };
    params.s = this.signRequest(params);

    console.log(
      `[FlowService] Creating payment order - REAL API CALL to ${endpoint}`
    );

    try {
      const response = await axios.post<IFlowPaymentOrderResponse>(
        endpoint,
        new URLSearchParams(params).toString(),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        }
      );

      console.log("[FlowService] Flow API Response received:", response.data);

      // Validate Flow API response structure (important!)
      const responseData = response.data as unknown; // Cast to unknown for safe type checking

      if (
        typeof responseData !== "object" ||
        responseData === null ||
        !(responseData as IFlowPaymentOrderResponse).url ||
        !(responseData as IFlowPaymentOrderResponse).token
      ) {
        let errorDetail = JSON.stringify(responseData);
        // Check if Flow returned an HTML error page instead of JSON
        if (
          typeof responseData === "string" &&
          responseData.toLowerCase().includes("<html")
        ) {
          errorDetail = "Flow returned an HTML error page.";
        } else if (
          typeof responseData === "object" &&
          responseData !== null &&
          (responseData as any).message
        ) {
          errorDetail = `Flow error message: ${(responseData as any).message}`;
        } else if (typeof responseData === "string") {
          errorDetail = `Unexpected string response: ${responseData.substring(
            0,
            100
          )}...`; // Show beginning of string
        }
        console.error(
          "[FlowService] Invalid response structure from Flow:",
          errorDetail
        );
        throw new Error(
          `Invalid response structure received from Flow API. Details: ${errorDetail}`
        );
      }

      // If validation passes, cast back to the expected type and return
      return responseData as IFlowPaymentOrderResponse;
    } catch (error) {
      let errorMessage = "Failed to create Flow payment order.";
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || "N/A";
        const data = error.response?.data;
        let detail = error.message;
        if (data) {
          detail = JSON.stringify(data);
          if (data.message) detail = data.message;
        }
        console.error(
          `[FlowService] Axios Error creating payment order: Status ${status}, Data: ${detail}`
        );
        errorMessage = `Flow API Request Failed: Status ${status} - ${detail}`;
      } else {
        console.error(
          "[FlowService] Generic Error creating payment order:",
          error.message,
          error.stack
        );
        errorMessage = `Failed to create Flow payment order: ${error.message}`;
      }
      throw new Error(errorMessage);
    }
  }

  async getPaymentStatus(token: string): Promise<IFlowPaymentStatusResponse> {
    const endpoint = `${this.config.apiBaseUrl}/payment/getStatus`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      token: token,
    };
    params.s = this.signRequest(params);

    console.warn(
      `[FlowService] getPaymentStatus is using PLACEHOLDER data for token: ${token}`
    );

    try {
      const dummyResponse: IFlowPaymentStatusResponse = {
        flowOrder: 12345,
        commerceOrder: "test-order-from-get-status",
        requestDate: new Date().toISOString(),
        status: 2,
        subject: "Test Payment Status",
        currency: "CLP",
        amount: "1500",
        payer: "test@example.com",
        paymentData: {
          date: new Date().toISOString(),
          media: "WebPay",
          fee: "100",
          balance: "1400",
          transferDate: new Date().toISOString(),
        },
      };
      return dummyResponse;
    } catch (error) {
      console.error(
        "[FlowService] Error in placeholder getPaymentStatus:",
        error
      );
      throw new Error("Failed to get Flow payment status (placeholder)");
    }
  }

  async handleConfirmation(
    token: string
  ): Promise<{ isValid: boolean; status?: IFlowPaymentStatusResponse }> {
    console.warn(
      `[FlowService] handleConfirmation is using PLACEHOLDER logic for token: ${token}`
    );
    try {
      const status = await this.getPaymentStatus(token);
      if (status && status.status === 2) {
        console.log(
          `[FlowService] Placeholder confirmation SUCCESS for commerceOrder: ${status.commerceOrder}`
        );
        return { isValid: true, status: status };
      } else {
        console.warn(
          `[FlowService] Placeholder confirmation received but status is not PAGADA: ${status?.status}`
        );
        return { isValid: false, status: status };
      }
    } catch (error) {
      console.error(
        "[FlowService] Error in placeholder handleConfirmation:",
        error
      );
      return { isValid: false };
    }
  }

  async createSubscription(
    subscriptionData: IFlowSubscriptionRequest
  ): Promise<IFlowSubscriptionResponse> {
    const endpoint = `${this.config.apiBaseUrl}/subscription/create`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      planId: subscriptionData.planId,
      customerId: subscriptionData.customerId,
      // Add optional parameters only if they exist in subscriptionData
      ...(subscriptionData.subscription_start && {
        subscription_start: subscriptionData.subscription_start,
      }),
      ...(subscriptionData.couponId && { couponId: subscriptionData.couponId }),
      ...(subscriptionData.trial_period_days && {
        trial_period_days: subscriptionData.trial_period_days,
      }),
      ...(subscriptionData.periods_number && {
        periods_number: subscriptionData.periods_number,
      }),
    };
    params.s = this.signRequest(params);

    console.log(
      `[FlowService] Creating subscription - API CALL to ${endpoint}`
    );

    try {
      const response = await axios.post<IFlowSubscriptionResponse>(
        endpoint,
        new URLSearchParams(params).toString(), // Send as x-www-form-urlencoded
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        }
      );

      console.log(
        "[FlowService] Flow API Subscription Response received:",
        response.data
      );

      // Basic validation: check if essential response fields exist
      const responseData = response.data;
      if (
        !responseData ||
        !responseData.subscriptionId ||
        !responseData.customerId ||
        !responseData.planId
      ) {
        console.error(
          "[FlowService] Invalid response structure from Flow Subscription API:",
          responseData
        );
        throw new Error(
          "Invalid response structure received from Flow Subscription API."
        );
      }

      return responseData;
    } catch (error) {
      let errorMessage = "Failed to create Flow subscription.";
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || "N/A";
        const data = error.response?.data;
        let detail = error.message;
        if (data) {
          detail = JSON.stringify(data);
          // Use Flow's error message if available (assuming structure { code, message })
          if (
            typeof data === "object" &&
            data !== null &&
            (data as any).message
          ) {
            detail = (data as any).message;
          }
        }
        console.error(
          `[FlowService] Axios Error creating subscription: Status ${status}, Data: ${detail}`
        );
        errorMessage = `Flow Subscription API Request Failed: Status ${status} - ${detail}`;
      } else {
        console.error(
          "[FlowService] Generic Error creating subscription:",
          error.message,
          error.stack
        );
        errorMessage = `Failed to create Flow subscription: ${error.message}`;
      }
      // Rethrow the error for the calling service (ProService) to handle
      throw new Error(errorMessage);
    }
  }

  async createCustomer(
    customerData: IFlowCustomerCreateRequest
  ): Promise<IFlowCustomerCreateResponse> {
    const endpoint = `${this.config.apiBaseUrl}/customer/create`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      name: customerData.name,
      email: customerData.email,
      externalId: customerData.externalId,
    };
    params.s = this.signRequest(params);

    console.log(`[FlowService] Creating customer - API CALL to ${endpoint}`);

    try {
      const response = await axios.post<IFlowCustomerCreateResponse>(
        endpoint,
        new URLSearchParams(params).toString(), // Send as x-www-form-urlencoded
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          timeout: 15000,
        }
      );

      console.log(
        "[FlowService] Flow API Customer Create Response received:",
        response.data
      );

      // Basic validation: check if essential response fields exist
      const responseData = response.data;
      if (
        !responseData ||
        !responseData.customerId ||
        !responseData.externalId
      ) {
        console.error(
          "[FlowService] Invalid response structure from Flow Customer Create API:",
          responseData
        );
        throw new Error(
          "Invalid response structure received from Flow Customer Create API."
        );
      }

      return responseData;
    } catch (error) {
      let errorMessage = "Failed to create Flow customer.";
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || "N/A";
        const data = error.response?.data;
        let detail = error.message;
        if (data) {
          detail = JSON.stringify(data);
          if (
            typeof data === "object" &&
            data !== null &&
            (data as any).message
          ) {
            detail = (data as any).message;
          }
        }
        // Special handling for 'customer already exists' error?
        // Check Flow docs for specific error codes/messages if needed.
        console.error(
          `[FlowService] Axios Error creating customer: Status ${status}, Data: ${detail}`
        );
        errorMessage = `Flow Customer Create API Request Failed: Status ${status} - ${detail}`;
      } else {
        console.error(
          "[FlowService] Generic Error creating customer:",
          error.message,
          error.stack
        );
        errorMessage = `Failed to create Flow customer: ${error.message}`;
      }
      throw new Error(errorMessage);
    }
  }

  async getInvoice(invoiceId: number): Promise<IFlowInvoice> {
    const endpoint = `${this.config.apiBaseUrl}/invoice/get`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      invoiceId: invoiceId,
    };
    params.s = this.signRequest(params);

    // Construct URL with query parameters for GET request
    const urlWithParams = `${endpoint}?${new URLSearchParams(
      params
    ).toString()}`;
    console.log(`[FlowService] Getting invoice - API CALL to ${urlWithParams}`);

    try {
      const response = await axios.get<IFlowInvoice>(urlWithParams, {
        timeout: 15000,
      });

      console.log(
        "[FlowService] Flow API Invoice Get Response received:",
        response.data
      );

      // Basic validation
      const responseData = response.data;
      if (!responseData || !responseData.id || responseData.id !== invoiceId) {
        console.error(
          "[FlowService] Invalid response structure from Flow Invoice Get API:",
          responseData
        );
        throw new Error(
          "Invalid response structure received from Flow Invoice Get API."
        );
      }

      return responseData;
    } catch (error) {
      let errorMessage = "Failed to get Flow invoice.";
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || "N/A";
        const data = error.response?.data;
        let detail = error.message;
        if (data) {
          detail = JSON.stringify(data);
          if (
            typeof data === "object" &&
            data !== null &&
            (data as any).message
          ) {
            detail = (data as any).message;
          }
        }
        console.error(
          `[FlowService] Axios Error getting invoice: Status ${status}, Data: ${detail}`
        );
        errorMessage = `Flow Invoice Get API Request Failed: Status ${status} - ${detail}`;
      } else {
        console.error(
          "[FlowService] Generic Error getting invoice:",
          error.message,
          error.stack
        );
        errorMessage = `Failed to get Flow invoice: ${error.message}`;
      }
      throw new Error(errorMessage);
    }
  }

  async getCustomerSubscriptions(
    customerId: string,
    start: number = 0,
    limit: number = 10
  ): Promise<IFlowPaginatedResponse<IFlowSubscriptionResponse>> {
    const endpoint = `${this.config.apiBaseUrl}/customer/getSubscriptions`;
    const params: Record<string, any> = {
      apiKey: this.config.apiKey,
      customerId: customerId,
      start: start,
      limit: limit,
      // Add filter parameters if needed, e.g., filter: planId
    };
    params.s = this.signRequest(params);

    const urlWithParams = `${endpoint}?${new URLSearchParams(
      params
    ).toString()}`;
    console.log(
      `[FlowService] Getting customer subscriptions - API CALL to ${urlWithParams}`
    );

    try {
      const response = await axios.get<
        IFlowPaginatedResponse<IFlowSubscriptionResponse>
      >(urlWithParams, {
        timeout: 15000,
      });

      console.log(
        "[FlowService] Flow API Get Customer Subscriptions Response received:",
        response.data
      );

      // Basic validation
      const responseData = response.data;
      if (
        !responseData ||
        typeof responseData.total !== "number" ||
        !Array.isArray(responseData.data)
      ) {
        console.error(
          "[FlowService] Invalid response structure from Flow Get Customer Subscriptions API:",
          responseData
        );
        throw new Error(
          "Invalid response structure received from Flow Get Customer Subscriptions API."
        );
      }

      return responseData;
    } catch (error) {
      let errorMessage = "Failed to get Flow customer subscriptions.";
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || "N/A";
        const data = error.response?.data;
        let detail = error.message;
        if (data) {
          detail = JSON.stringify(data);
          if (
            typeof data === "object" &&
            data !== null &&
            (data as any).message
          ) {
            detail = (data as any).message;
          }
        }
        console.error(
          `[FlowService] Axios Error getting customer subscriptions: Status ${status}, Data: ${detail}`
        );
        errorMessage = `Flow Get Customer Subscriptions API Request Failed: Status ${status} - ${detail}`;
      } else {
        console.error(
          "[FlowService] Generic Error getting customer subscriptions:",
          error.message,
          error.stack
        );
        errorMessage = `Failed to get Flow customer subscriptions: ${error.message}`;
      }
      throw new Error(errorMessage);
    }
  }
}
