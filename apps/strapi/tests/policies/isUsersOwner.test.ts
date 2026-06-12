// isUsersOwner.test.ts
//
// Jest regression tests for the isUsersOwner global route policy.
// Verifies: cross-user → 403 (false), self → allowed (true), manager bypass → true, no user → false.

import policy from "../../src/policies/isUsersOwner";

function createPolicyContext(
  paramId: string | number,
  user: { id: number | string; role?: { name?: string } } | undefined,
) {
  return {
    state: { user },
    params: { id: paramId },
  };
}

describe("isUsersOwner policy", () => {
  // Test 1: cross-user PUT must be denied
  it("denies cross-user PUT (returns false)", () => {
    // Arrange
    const ctx = createPolicyContext("123", {
      id: 999,
      role: { name: "Authenticated" },
    });

    // Act
    const result = policy(ctx);

    // Assert
    expect(result).toBe(false);
  });

  // Test 2: owner calling their own record must be allowed
  it("allows self PUT (returns true)", () => {
    // Arrange
    const ctx = createPolicyContext("123", {
      id: 123,
      role: { name: "Authenticated" },
    });

    // Act
    const result = policy(ctx);

    // Assert
    expect(result).toBe(true);
  });

  // Test 3: string/number mismatch on self PUT must still be allowed (String-safe compare)
  it("allows self PUT with string/number id mismatch (String-safe compare)", () => {
    // Arrange
    const ctx = createPolicyContext("123", { id: 123 });

    // Act
    const result = policy(ctx);

    // Assert
    expect(result).toBe(true);
  });

  // Test 4: manager can update any user's record
  it("allows manager for any user id (returns true)", () => {
    // Arrange
    const ctx = createPolicyContext("123", {
      id: 999,
      role: { name: "Manager" },
    });

    // Act
    const result = policy(ctx);

    // Assert
    expect(result).toBe(true);
  });

  // Test 5: unauthenticated request must be denied
  it("denies when no authenticated user (returns false)", () => {
    // Arrange
    const ctx = createPolicyContext("123", undefined);

    // Act
    const result = policy(ctx);

    // Assert
    expect(result).toBe(false);
  });
});
