import { zohoService } from "./index";

describe("ZohoService - Real Integration", () => {
  it("should create a real lead in Zoho CRM", async () => {
    const leadData = {
      firstName: "Real",
      lastName: "Test",
      email: `waldo.development@gmail.com`,
      company: "Waldo API",
      description: "Lead creado por test automatizado",
    };

    const createdLeads = await zohoService.createLead(leadData);
    expect(Array.isArray(createdLeads)).toBe(true);
    expect(createdLeads.length).toBeGreaterThan(0);
  });

  it("should find a contact by email", async () => {
    const contact = await zohoService.findContact("geo2019ab@gmail.com");
    console.log("Contacto encontrado:", JSON.stringify(contact, null, 2));
    expect(contact).toBeDefined();
    expect(contact.Email).toBe("geo2019ab@gmail.com");
  });
});
