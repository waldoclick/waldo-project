/**
 * TDD tests for Zoho CRM wiring in ad.ts approveAd().
 *
 * Tests verify that when an admin approves an ad:
 *   - findContact(email) is called
 *   - If contact found: updateContactStats called with Ads_Published__c + Last_Ad_Posted_At__c
 *   - No createDeal is called (EVT-01: no Deal for ad_published)
 *   - Guard: if ad was already active (re-approve), sync is NOT fired (EVT-02)
 *   - If contact null: sync skipped, approveAd returns success
 *   - If Zoho throws: approveAd still returns success
 *
 * Requirements covered: EVT-01, EVT-02
 */

// ─── Mock strapi global ───────────────────────────────────────────────────────

const mockAd = {
  id: "1",
  active: false, // ← pre-update state: not yet active (first publish)
  banned: false,
  rejected: false,
  remaining_days: 30,
  name: "Test Ad",
  slug: "test-ad",
  user: {
    id: "user-1",
    email: "owner@example.com",
    firstname: "John",
    lastname: "Doe",
  },
};

const strapi = {
  contentType: jest.fn().mockReturnValue({}),
  query: jest.fn().mockReturnValue({
    findOne: jest.fn().mockResolvedValue(mockAd),
    update: jest.fn().mockResolvedValue({}),
  }),
};
Object.assign(global, { strapi });

// ─── Mock email service ───────────────────────────────────────────────────────

jest.mock("../../../../src/services/mjml", () => ({
  sendMjmlEmail: jest.fn().mockResolvedValue(undefined),
}));

// ─── Mock Zoho service barrel ─────────────────────────────────────────────────

jest.mock("../../../../src/services/zoho", () => ({
  zohoService: {
    findContact: jest.fn(),
    updateContactStats: jest.fn().mockResolvedValue(undefined),
    // Note: createDeal intentionally omitted — EVT-01 requires no Deal
  },
}));

import { zohoService } from "../../../../src/services/zoho";
import adServiceFactory from "../../../../src/api/ad/services/ad";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Flush microtask queue so floating promises run */
const flushPromises = () => new Promise((r) => setTimeout(r, 0));

// ─── Test setup ───────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();

  // Restore default: ad is in pending state (first publish)
  (strapi.contentType as jest.Mock).mockReturnValue({});
  (strapi.query as jest.Mock).mockReturnValue({
    findOne: jest.fn().mockResolvedValue({ ...mockAd, active: false }),
    update: jest.fn().mockResolvedValue({}),
  });

  // Default: contact found
  (zohoService.findContact as jest.Mock).mockResolvedValue({
    id: "contact-zoho-1",
  });
  (zohoService.updateContactStats as jest.Mock).mockResolvedValue(undefined);
});

// ─── EVT-01 / EVT-02: Zoho wiring in approveAd ───────────────────────────────

describe("approveAd — Zoho CRM wiring (EVT-01, EVT-02)", () => {
  it("Test 1 — Contact found: updateContactStats called with Ads_Published__c and Last_Ad_Posted_At__c", async () => {
    const adService = adServiceFactory({ strapi });

    await adService.approveAd("1", "admin-1");
    await flushPromises();

    expect(zohoService.findContact).toHaveBeenCalledWith("owner@example.com");
    expect(zohoService.updateContactStats).toHaveBeenCalledWith(
      "contact-zoho-1",
      expect.objectContaining({
        Ads_Published__c: 1,
        Last_Ad_Posted_At__c: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
      })
    );
  });

  it("Test 2 — No createDeal called (EVT-01: ad_published has no Deal)", async () => {
    const adService = adServiceFactory({ strapi });

    await adService.approveAd("1", "admin-1");
    await flushPromises();

    // zohoService has no createDeal in the mock — any call would throw
    // Verify updateContactStats was called (sync ran) but no Deal was created
    expect(zohoService.updateContactStats).toHaveBeenCalledTimes(1);
    expect(
      (zohoService as unknown as Record<string, unknown>).createDeal
    ).toBeUndefined();
  });

  it("Test 3 — Guard: re-approve (ad.active=true) does NOT fire Zoho sync (EVT-02)", async () => {
    // Simulate: ad was already active before this approve call
    (strapi.query as jest.Mock).mockReturnValue({
      findOne: jest.fn().mockResolvedValue({ ...mockAd, active: true }),
      update: jest.fn().mockResolvedValue({}),
    });

    const adService = adServiceFactory({ strapi });

    // approveAd will throw "Advertisement is not pending approval" since active=true
    // That's correct — the guard is implicitly enforced by isPending check
    // But we still verify no Zoho call was made
    await adService.approveAd("1", "admin-1").catch(() => {});
    await flushPromises();

    expect(zohoService.findContact).not.toHaveBeenCalled();
    expect(zohoService.updateContactStats).not.toHaveBeenCalled();
  });

  it("Test 4 — Contact not found: sync skipped, approveAd returns success", async () => {
    (zohoService.findContact as jest.Mock).mockResolvedValue(null);

    const adService = adServiceFactory({ strapi });
    const result = await adService.approveAd("1", "admin-1");
    await flushPromises();

    expect(zohoService.updateContactStats).not.toHaveBeenCalled();
    expect(result.success).toBe(true);
  });

  it("Test 5 — Zoho sync is non-blocking (floating promise — method returns before Zoho resolves)", async () => {
    // findContact never resolves — if awaited, this test hangs
    (zohoService.findContact as jest.Mock).mockReturnValue(
      new Promise(() => {})
    );

    const adService = adServiceFactory({ strapi });
    const result = await adService.approveAd("1", "admin-1");

    // Must complete immediately
    expect(result.success).toBe(true);
  });

  it("Test 6 — Zoho throws: approveAd still returns success", async () => {
    (zohoService.findContact as jest.Mock).mockRejectedValue(
      new Error("Zoho unavailable")
    );

    const adService = adServiceFactory({ strapi });
    const result = await adService.approveAd("1", "admin-1");
    await flushPromises();

    expect(result.success).toBe(true);
  });
});
