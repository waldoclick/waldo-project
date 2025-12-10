import { flowServiceFactory } from "../factories/flow.factory";
import { FlowService } from "../services/flow.service";
import { IFlowPaymentOrderRequest } from "../types/flow.types"; // Import request type

// Mock Strapi instance
const mockStrapi = {} as any;

describe("FlowService", () => {
  let flowService: FlowService;

  beforeEach(() => {
    // Arrange: Initialize service using the factory without custom config.
    // This forces it to use FLOW_DEFAULT_CONFIG internally, which reads process.env.
    // The factory will throw if required env vars are missing (assuming dotenv is working).
    try {
      flowService = flowServiceFactory(mockStrapi); // Rely on factory defaults
    } catch (error) {
      // Make the test fail clearly if config is missing
      console.error(
        "Error initializing FlowService in test. Ensure FLOW_API_KEY, FLOW_SECRET_KEY, and FLOW_API_BASE_URL are set in .env and loaded by Jest (dotenv setup).",
        error
      );
      throw new Error(
        `Failed to initialize FlowService via factory. Check environment variables and dotenv setup. Original error: ${error.message}`
      );
    }
  });

  it("should be defined", () => {
    // Assert
    expect(flowService).toBeDefined();
  });

  describe("createPaymentOrder", () => {
    it("should create a payment order (placeholder)", async () => {
      // Arrange
      const orderData: IFlowPaymentOrderRequest = {
        // Use the interface
        commerceOrder: `test-${Date.now()}`,
        subject: "Test Product Real API",
        amount: 1500,
        email: "waldo.development@gmai.com", // Use the email suggested by the user
        urlConfirmacion: "http://localhost:1337/api/payments/pro-response", // Example backend URL
        urlRetorno: "http://localhost:3000/payment/complete", // Example frontend URL
      };
      // Act
      const result = await flowService.createPaymentOrder(orderData);
      // Assert
      expect(result).toHaveProperty("url");
      expect(result).toHaveProperty("token");
      expect(result.url).toContain("https://sandbox.flow.cl/app/web/pay.php");
      // console.log('[Test] Flow Payment URL:', result.url);
      // console.log('[Test] Flow Token:', result.token);
    });

    // Add more tests: e.g., missing required fields, API error handling
  });

  // Add more tests: e.g., missing required fields, API error handling
});
