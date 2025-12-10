describe("Register Test", () => {
  it("should register successfully", () => {
    cy.visit("/registro");
    cy.wait(1000);

    // Interceptar la solicitud de registro
    cy.intercept("POST", "/api/auth/local/register").as("registerRequest");

    // Paso 1: Completar los campos del primer paso
    cy.get('.auth select[name="is_company"]')
      .should("be.visible")
      .select("false");
    cy.get('.auth input[name="firstname"]').should("be.visible").type("John");
    cy.get('.auth input[name="lastname"]').should("be.visible").type("Doe");
    cy.get('.auth input[name="rut"]').should("be.visible").type("24.336.265-2");
    cy.get('.auth button[type="submit"]').should("be.visible").click();

    // Paso 2: Completar los campos del segundo paso
    cy.get('.auth input[name="email"]')
      .should("be.visible")
      .type(Cypress.env("CYPRESS_EMAIL") || "zodis@gabrielburgos.cl");
    cy.get('.auth input[name="password"]')
      .should("be.visible")
      .type(Cypress.env("CYPRESS_PASSWORD") || "Pa$$w0rd!");
    cy.get('.auth input[name="confirm_password"]')
      .should("be.visible")
      .type(Cypress.env("CYPRESS_PASSWORD") || "Pa$$w0rd!");

    cy.wait(1000);
    cy.get('.auth button[type="submit"]').should("be.visible").click();

    // Esperar a que la solicitud de registro sea enviada y verificar la respuesta
    cy.wait("@registerRequest").then((interception) => {
      assert.isNotNull(interception.response.body, "API call has data");
    });
  });
});
