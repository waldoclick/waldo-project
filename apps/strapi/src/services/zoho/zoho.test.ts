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

    it("should include Lead_Status: 'New' in the payload", async () => {
      mock
        .onPost("https://www.zohoapis.com/crm/v5/Leads")
        .reply(200, { data: [{ Details: { id: "lead-001" } }] });
      await service.createLead({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      });
      const body = JSON.parse(
        mock.history.post.find((r) => r.url?.includes("/Leads"))!.data
      );
      expect(body.data[0].Lead_Status).toBe("New");
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

    it("should initialize custom counter fields to zero", async () => {
      mock
        .onPost("https://www.zohoapis.com/crm/v5/Contacts")
        .reply(200, { data: [{ id: "contact-001" }] });
      await service.createContact({
        First_Name: "Jane",
        Last_Name: "Smith",
        Email: "test@example.com",
      });
      const body = JSON.parse(
        mock.history.post.find((r) => r.url?.includes("/Contacts"))!.data
      );
      expect(body.data[0].Ads_Published__c).toBe(0);
      expect(body.data[0].Total_Spent__c).toBe(0);
      expect(body.data[0].Packs_Purchased__c).toBe(0);
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

  describe("createDeal()", () => {
    it("should post all required Deal fields and return the created Deal ID", async () => {
      mock
        .onPost("https://www.zohoapis.com/crm/v5/Deals")
        .reply(200, { data: [{ details: { id: "deal-001" } }] });

      const result = await service.createDeal({
        dealName: "Pack Premium - juan@example.com",
        amount: 9990,
        contactId: "contact-001",
        type: "Pack Purchase",
        closingDate: "2026-03-08",
        description: "Pack Premium purchase",
        leadSource: "Website",
      });

      expect(result).toBe("deal-001");

      const body = JSON.parse(
        mock.history.post.find((r) => r.url?.includes("/Deals"))!.data
      );
      expect(body.data[0].Deal_Name).toBe("Pack Premium - juan@example.com");
      expect(body.data[0].Stage).toBe("Closed Won");
      expect(body.data[0].Amount).toBe(9990);
      expect(body.data[0].Contact_Name).toEqual({ id: "contact-001" });
      expect(body.data[0].Type).toBe("Pack Purchase");
      expect(body.data[0].Closing_Date).toBe("2026-03-08");
      expect(body.data[0].Description).toBe("Pack Premium purchase");
      expect(body.data[0].Lead_Source).toBe("Website");
    });
  });

  describe("updateContactStats()", () => {
    it("should PUT only the provided stats fields — no undefined keys in payload", async () => {
      mock
        .onPut("https://www.zohoapis.com/crm/v5/Contacts/contact-001")
        .reply(200, { data: [{ id: "contact-001" }] });

      await service.updateContactStats("contact-001", { Total_Spent__c: 9990 });

      const body = JSON.parse(
        mock.history.put.find((r) => r.url?.includes("/Contacts/contact-001"))!
          .data
      );
      expect(body.data[0].Total_Spent__c).toBe(9990);
      expect(body.data[0]).not.toHaveProperty("Ads_Published__c");
      expect(body.data[0]).not.toHaveProperty("Last_Ad_Posted_At__c");
      expect(body.data[0]).not.toHaveProperty("Packs_Purchased__c");
    });
  });
});
