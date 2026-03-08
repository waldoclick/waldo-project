/**
 * Unit tests for ZohoService
 * Uses axios-mock-adapter for zero live network calls
 */

import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import { ZohoHttpClient } from "./http-client";
import { ZohoService } from "./zoho.service";
import { ZohoConfig } from "./interfaces";

const testConfig: ZohoConfig = {
  clientId: "test-client-id",
  clientSecret: "test-client-secret",
  refreshToken: "test-refresh-token",
  apiUrl: "https://www.zohoapis.com",
};

describe("ZohoService", () => {
  let mock: MockAdapter;
  let service: ZohoService;

  beforeEach(() => {
    mock = new MockAdapter(axios);

    // Mock the OAuth token refresh endpoint
    mock
      .onPost("https://accounts.zoho.com/oauth/v2/token")
      .reply(200, { access_token: "test-token" });

    const httpClient = new ZohoHttpClient(testConfig, mock.adapter());
    service = new ZohoService(httpClient);
  });

  afterEach(() => {
    mock.restore();
  });

  describe("createLead()", () => {
    it("should return an array with the created lead", async () => {
      mock
        .onPost("https://www.zohoapis.com/crm/v5/Leads")
        .reply(200, { data: [{ Details: { id: "lead-001" } }] });

      const result = await service.createLead({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        company: "Acme",
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("createContact()", () => {
    it("should return the created contact with an id field", async () => {
      mock.onPost("https://www.zohoapis.com/crm/v5/Contacts").reply(200, {
        data: [{ id: "contact-001", Email: "test@example.com" }],
      });

      const result = await service.createContact({
        First_Name: "Jane",
        Last_Name: "Smith",
        Email: "test@example.com",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("contact-001");
    });
  });

  describe("findContact()", () => {
    it("should return the contact when found by email", async () => {
      mock.onGet("https://www.zohoapis.com/crm/v5/Contacts/search").reply(200, {
        data: [{ id: "contact-001", Email: "found@example.com" }],
      });

      const result = await service.findContact("found@example.com");

      expect(result).not.toBeNull();
      expect(result.Email).toBe("found@example.com");
    });

    it("should return null when contact is not found", async () => {
      mock
        .onGet("https://www.zohoapis.com/crm/v5/Contacts/search")
        .reply(200, { data: [] });

      const result = await service.findContact("notfound@example.com");

      expect(result).toBeNull();
    });
  });

  describe("updateContact()", () => {
    it("should return the updated contact with an id field", async () => {
      mock
        .onPut("https://www.zohoapis.com/crm/v5/Contacts/contact-001")
        .reply(200, { data: [{ id: "contact-001" }] });

      const result = await service.updateContact("contact-001", {
        First_Name: "Updated",
      });

      expect(result).toBeDefined();
      expect(result.id).toBe("contact-001");
    });
  });
});
