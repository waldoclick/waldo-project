describe("subscription-pro collection type", () => {
  describe("schema", () => {
    it.todo("should have oneToOne relation to user with inversedBy");
    it.todo(
      "should have tbk_user, card_type, card_last4, inscription_token, pending_invoice fields"
    );
  });

  describe("bootstrap migration", () => {
    it.todo(
      "should create subscription-pro records for active users with tbk_user"
    );
    it.todo(
      "should create subscription-pro records for cancelled users with tbk_user"
    );
    it.todo("should skip users without tbk_user");
    it.todo(
      "should be idempotent - skip users who already have a subscription-pro record"
    );
  });
});
