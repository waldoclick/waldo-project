/**
 * Unit tests for ZohoHttpClient
 * Uses axios-mock-adapter for zero live network calls
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ZohoHttpClient } from "../http-client";
import { ZohoConfig } from "../interfaces";

const mockConfig: ZohoConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  refreshToken: "test-refresh-token",
  apiUrl: "https://www.zohoapis.com/crm/v2",
};

describe("ZohoHttpClient", () => {
  let mock: MockAdapter;
  let client: ZohoHttpClient;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    client = new ZohoHttpClient(mockConfig, mock.adapter());

    // Mock the token refresh endpoint
    mock
      .onPost("https://accounts.zoho.com/oauth/v2/token")
      .reply(200, { access_token: "test-access-token" });
  });

  afterEach(() => {
    mock.restore();
  });

  describe("Test 1: request interceptor sets Zoho-oauthtoken header", () => {
    it("should set Authorization header with Zoho-oauthtoken prefix (not Bearer)", async () => {
      mock
        .onGet("https://www.zohoapis.com/crm/v2/Contacts")
        .reply(function (config) {
          // Capture the Authorization header to assert on it
          const authHeader = config.headers?.Authorization as string;
          if (authHeader && authHeader.startsWith("Zoho-oauthtoken ")) {
            return [200, { data: [] }];
          }
          // Return 400 if the wrong header format is used
          return [400, { error: `Wrong header: ${authHeader}` }];
        });

      const result = await client.get("/Contacts");
      expect(result).toEqual({ data: [] });
    });

    it("should NOT use Bearer prefix in Authorization header", async () => {
      let capturedAuthHeader = "";

      mock
        .onGet("https://www.zohoapis.com/crm/v2/Contacts")
        .reply(function (config) {
          capturedAuthHeader = (config.headers?.Authorization as string) || "";
          return [200, { data: [] }];
        });

      await client.get("/Contacts");
      expect(capturedAuthHeader).not.toMatch(/^Bearer /);
      expect(capturedAuthHeader).toMatch(/^Zoho-oauthtoken /);
    });
  });

  describe("Test 2: 401 response triggers token refresh and retries", () => {
    it("should automatically refresh token and retry on 401 response", async () => {
      let requestCount = 0;

      mock.onGet("https://www.zohoapis.com/crm/v2/Contacts").reply(function () {
        requestCount++;
        if (requestCount === 1) {
          // First request: return 401 (token expired)
          return [401, { message: "INVALID_TOKEN" }];
        }
        // Second request (retry after refresh): return success
        return [200, { data: [{ id: "123" }] }];
      });

      // Mock the new token refresh
      mock
        .onPost("https://accounts.zoho.com/oauth/v2/token")
        .reply(200, { access_token: "new-refreshed-token" });

      const result = await client.get("/Contacts");

      // Caller should receive the successful result, not an error
      expect(result).toEqual({ data: [{ id: "123" }] });
      // The request was made twice (original + retry)
      expect(requestCount).toBe(2);
    });
  });

  describe("Test 3: _retry guard prevents infinite loops", () => {
    it("should NOT retry a second time if the retried request also returns 401", async () => {
      // All requests return 401 — should fail after one retry attempt, not loop
      mock
        .onGet("https://www.zohoapis.com/crm/v2/Contacts")
        .reply(401, { message: "INVALID_TOKEN" });

      mock
        .onPost("https://accounts.zoho.com/oauth/v2/token")
        .reply(200, { access_token: "still-bad-token" });

      await expect(client.get("/Contacts")).rejects.toThrow();
    });
  });
});
