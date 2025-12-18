describe("Login Test", () => {
  it("should login successfully", () => {
    cy.visit("/login");
    cy.wait(1000);
    const email = Cypress.env("CYPRESS_EMAIL") || "zodis@gabrielburgos.cl";
    const password = Cypress.env("CYPRESS_PASSWORD") || "Pa$$w0rd!";
    cy.get('.auth input[name="email"]').should("be.visible").type(email);
    cy.get('.auth input[name="password"]').should("be.visible").type(password);
    cy.get('.auth button[type="submit"]').should("be.visible").click();
    cy.url().should("include", "/");
  });
});
