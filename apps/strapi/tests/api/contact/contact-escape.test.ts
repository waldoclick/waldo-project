import { ContactService } from "../../../src/api/contact/services/contact.service";
import { escapeHtml } from "../../../src/services/mjml/escape";
import type { Core } from "@strapi/strapi";

// Mock logger to prevent log output during tests
jest.mock("../../../src/utils/logtail", () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}));

// Mock mjml service — capture data payloads passed to sendMjmlEmail
const mockSendMjmlEmail = jest.fn().mockResolvedValue(undefined);
jest.mock("../../../src/services/mjml", () => ({
  sendMjmlEmail: (...args: unknown[]) => mockSendMjmlEmail(...args),
  escapeHtml: jest.requireActual("../../../src/services/mjml/escape")
    .escapeHtml,
}));

// Mock Google services
jest.mock("../../../src/services/google/index", () => ({
  default: {
    sheets: {
      appendToSheet: jest.fn().mockResolvedValue(undefined),
    },
  },
}));

// Mock Zoho service
jest.mock("../../../src/services/zoho/index", () => ({
  zohoService: {
    createLead: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock request-ip
jest.mock("request-ip", () => ({
  getClientIp: jest.fn().mockReturnValue("1.1.1.1"),
}));

// Minimal strapi stub
const strapiStub = {
  db: {
    query: jest.fn().mockReturnValue({
      create: jest.fn().mockResolvedValue({
        id: 1,
        fullname: "<script>x</script>",
        email: "a@b.cl",
        phone: "<b>1</b>",
        company: "C&D",
        message: "<img src=x onerror=1>",
        ip: "1.1.1.1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    }),
  },
} as unknown as Core.Strapi;

describe("escapeHtml helper", () => {
  // Direct unit test of the escapeHtml function
  it("escapes all five HTML-significant characters", () => {
    expect(escapeHtml("<a>&\"'")).toBe("&lt;a&gt;&amp;&quot;&#39;");
  });

  it("returns empty string for null", () => {
    expect(escapeHtml(null)).toBe("");
  });

  it("returns empty string for undefined", () => {
    expect(escapeHtml(undefined)).toBe("");
  });

  it("converts non-string values to string before escaping", () => {
    expect(escapeHtml(42)).toBe("42");
  });
});

describe("ContactService.createContact — HTML escape at email boundary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Restore the create mock for each test
    (strapiStub.db.query as jest.Mock).mockReturnValue({
      create: jest.fn().mockResolvedValue({
        id: 1,
        fullname: "<script>x</script>",
        email: "a@b.cl",
        phone: "<b>1</b>",
        company: "C&D",
        message: "<img src=x onerror=1>",
        ip: "1.1.1.1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }),
    });
  });

  it("passes escaped name and message to contact-admin sendMjmlEmail — HTML payload neutralized", async () => {
    // Arrange
    const service = new ContactService(strapiStub);
    const contactData = {
      fullname: "<script>x</script>",
      email: "a@b.cl",
      phone: "<b>1</b>",
      company: "C&D",
      message: "<img src=x onerror=1>",
      ip: "1.1.1.1",
    };

    // Act
    await service.createContact(contactData);

    // Assert: sendMjmlEmail called twice (contact-user + contact-admin)
    expect(mockSendMjmlEmail).toHaveBeenCalledTimes(2);

    // Find the contact-admin call (2nd argument = "contact-admin")
    const adminCall = mockSendMjmlEmail.mock.calls.find(
      (call: unknown[]) => call[1] === "contact-admin",
    );
    expect(adminCall).toBeDefined();

    const adminPayload = adminCall![4] as Record<string, string>;

    // name must not contain raw <script> tag — must be escaped
    expect(adminPayload.name).not.toContain("<script>");
    expect(adminPayload.name).toContain("&lt;script&gt;");

    // message must not contain raw <img tag — must be escaped
    expect(adminPayload.message).not.toContain("<img");
    expect(adminPayload.message).toContain("&lt;img");

    // company & must be escaped
    expect(adminPayload.company).not.toContain("&D");
    expect(adminPayload.company).toContain("&amp;D");
  });

  it("passes escaped fields to contact-user sendMjmlEmail", async () => {
    // Arrange
    const service = new ContactService(strapiStub);
    const contactData = {
      fullname: "<em>Bob</em>",
      email: "bob@example.cl",
      phone: "<i>555</i>",
      company: "A&B Corp",
      message: "Hello",
      ip: "1.1.1.1",
    };

    // Act
    await service.createContact(contactData);

    // Find the contact-user call
    const userCall = mockSendMjmlEmail.mock.calls.find(
      (call: unknown[]) => call[1] === "contact-user",
    );
    expect(userCall).toBeDefined();

    const userPayload = userCall![4] as Record<string, string>;

    // name must be escaped
    expect(userPayload.name).not.toContain("<em>");
    expect(userPayload.name).toContain("&lt;em&gt;");

    // phone must be escaped
    expect(userPayload.phone).not.toContain("<i>");
    expect(userPayload.phone).toContain("&lt;i&gt;");
  });

  it("keeps the recipient email address (to) unescaped — escaping is for body fields only", async () => {
    // Arrange
    const service = new ContactService(strapiStub);
    const contactData = {
      fullname: "Test User",
      email: "user@example.cl",
      phone: undefined,
      company: undefined,
      message: "Hello",
      ip: "1.1.1.1",
    };

    // Act
    await service.createContact(contactData);

    // The 3rd argument to sendMjmlEmail is the recipient address — must not be escaped
    const userCall = mockSendMjmlEmail.mock.calls.find(
      (call: unknown[]) => call[1] === "contact-user",
    );
    expect(userCall).toBeDefined();
    // 3rd arg = recipient
    expect(userCall![2]).toBe("user@example.cl");
  });
});
