describe("proResponse charge-before-activate", () => {
  describe("successful inscription + charge", () => {
    it.todo("should call authorizeCharge BEFORE updating user pro_status");
    it.todo(
      "should update subscription-pro record with card data after successful charge"
    );
    it.todo("should set pro_status to active only after charge succeeds");
    it.todo("should redirect to /pro/pagar/gracias with order documentId");
  });

  describe("charge failure", () => {
    it.todo("should NOT activate user when charge fails");
    it.todo(
      "should NOT update subscription-pro with card data when charge fails"
    );
    it.todo("should redirect to /pro/error?reason=charge-failed");
  });

  describe("inscription failure", () => {
    it.todo(
      "should redirect to /pro/error?reason=rejected when finishInscription fails"
    );
    it.todo(
      "should redirect to /pro/error?reason=cancelled when TBK_TOKEN is missing"
    );
  });
});
