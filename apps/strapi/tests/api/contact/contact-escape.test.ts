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

// SEC2-LOCKDOWN: With autoescape: true in nunjucks, the service passes raw values
// to sendMjmlEmail and the template engine handles HTML escaping at render time.
// Pre-escaping with escapeHtml() was removed from contact.service.ts to avoid
// double-escaping (raw & → &amp; → &amp;amp; in email output).
describe("ContactService.createContact — raw values passed, autoescape handles XSS", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  it("passes raw (unescaped) name and message to contact-admin sendMjmlEmail — nunjucks autoescape neutralizes HTML at render time", async () => {
    const service = new ContactService(strapiStub);
    const contactData = {
      fullname: "<script>x</script>",
      email: "a@b.cl",
      phone: "<b>1</b>",
      company: "C&D",
      message: "<img src=x onerror=1>",
      ip: "1.1.1.1",
    };

    await service.createContact(contactData);

    expect(mockSendMjmlEmail).toHaveBeenCalledTimes(2);

    const adminCall = mockSendMjmlEmail.mock.calls.find(
      (call: unknown[]) => call[1] === "contact-admin",
    );
    expect(adminCall).toBeDefined();

    const adminPayload = adminCall![4] as Record<string, string>;

    // Raw values passed through — escaping deferred to nunjucks autoescape at render time
    expect(adminPayload.name).toBe("<script>x</script>");
    expect(adminPayload.message).toBe("<img src=x onerror=1>");
    expect(adminPayload.company).toBe("C&D");
  });

  it("passes raw (unescaped) fields to contact-user sendMjmlEmail", async () => {
    const service = new ContactService(strapiStub);
    const contactData = {
      fullname: "<em>Bob</em>",
      email: "bob@example.cl",
      phone: "<i>555</i>",
      company: "A&B Corp",
      message: "Hello",
      ip: "1.1.1.1",
    };

    await service.createContact(contactData);

    const userCall = mockSendMjmlEmail.mock.calls.find(
      (call: unknown[]) => call[1] === "contact-user",
    );
    expect(userCall).toBeDefined();

    const userPayload = userCall![4] as Record<string, string>;

    // Raw values passed through — nunjucks autoescape handles rendering
    expect(userPayload.name).toBe("<em>Bob</em>");
    expect(userPayload.phone).toBe("<i>555</i>");
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
