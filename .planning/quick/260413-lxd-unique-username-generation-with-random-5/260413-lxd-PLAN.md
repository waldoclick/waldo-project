---
phase: 260413-lxd
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/strapi/src/extensions/users-permissions/controllers/authController.ts
  - apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts
autonomous: true
requirements:
  - QUICK-260413-LXD
must_haves:
  truths:
    - "Registering a user whose email local-part collides with an existing username succeeds (does not 400) and creates the user with a suffixed username."
    - "When no collision exists, the username is persisted exactly as submitted (no suffix appended)."
    - "Collision suffix is a 5-digit numeric string (10000–99999) appended directly to the base username (e.g. gonzalo83421)."
    - "Suffix retry loop continues until a unique username is found, with a sane upper bound to prevent infinite loops."
  artifacts:
    - path: "apps/strapi/src/extensions/users-permissions/controllers/authController.ts"
      provides: "ensureUniqueUsername helper + integration into registerUserLocal before forwarding the body"
      contains: "ensureUniqueUsername"
    - path: "apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts"
      provides: "Unit tests for ensureUniqueUsername (no collision, single collision, multiple collisions)"
      contains: "ensureUniqueUsername"
  key_links:
    - from: "registerUserLocal (authController.ts)"
      to: "ensureUniqueUsername (authController.ts)"
      via: "called before building forwardBody, replacing username with collision-resolved value"
      pattern: "ensureUniqueUsername\\("
    - from: "ensureUniqueUsername"
      to: "strapi.db.query('plugin::users-permissions.user').findOne"
      via: "lookup by username to detect collision"
      pattern: "plugin::users-permissions\\.user"
---

<objective>
Add unique-username collision handling at the Strapi registration layer so that two users with the same email local-part (e.g. `gonzalo@hotmail.com` and `gonzalo@gmail.com`) can both register successfully. On collision, append a random 5-digit numeric suffix (e.g. `gonzalo83421`) and retry until a unique username is found.

Purpose: Today the website client builds `username = email.split('@')[0]` in FormRegister.vue and sends it to `/api/auth/local/register`. Strapi forwards it untouched, and the second registration with a colliding local-part fails with a uniqueness violation. Strapi is the single source of truth and is where this must be enforced (the website is a stateless HTTP client per CLAUDE.md).
Output: A working `ensureUniqueUsername` helper integrated into `registerUserLocal`, plus Jest unit tests covering the no-collision, single-collision, and multi-collision paths.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@./CLAUDE.md
@apps/strapi/src/extensions/users-permissions/controllers/authController.ts
@apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts

<interfaces>
<!-- Key contracts for the executor -->

Strapi v5 db query (already used elsewhere in this file):
```ts
await strapi.db.query("plugin::users-permissions.user").findOne({
  where: { username },
  select: ["id", "username"],
});
```

Existing registerUserLocal flow (apps/strapi/src/extensions/users-permissions/controllers/authController.ts:81):
- Destructures `username` (and other fields) from `ctx.request.body`
- Validates required fields
- Builds `forwardBody = { is_company, firstname, lastname, rut, email, password, username }`
- Assigns `ctx.request.body = forwardBody`
- Calls original `registerController(ctx)`

Insertion point for ensureUniqueUsername: AFTER required-field validation and BEFORE building `forwardBody`, so the resolved unique username is the one forwarded to Strapi's built-in register action.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Add ensureUniqueUsername helper and wire it into registerUserLocal</name>
  <files>apps/strapi/src/extensions/users-permissions/controllers/authController.ts</files>
  <behavior>
    - When `findOne({ where: { username: base } })` returns null → return `base` unchanged.
    - When the base collides → generate `${base}${suffix}` where `suffix` is a 5-digit number (10000–99999) using `crypto.randomInt(10000, 100000)`.
    - Continue retrying with new random suffixes until `findOne` returns null for the candidate.
    - Hard cap: maximum 10 attempts. If still colliding after 10 attempts, throw an Error with message `"Could not generate unique username after 10 attempts"` (extremely unlikely given 90k suffix space).
    - Helper signature: `export const ensureUniqueUsername = async (base: string): Promise<string>`.
    - Helper must use `strapi.db.query("plugin::users-permissions.user").findOne({ where: { username: candidate }, select: ["id"] })` (matches existing patterns in the file).
  </behavior>
  <action>
    1. In `apps/strapi/src/extensions/users-permissions/controllers/authController.ts`, add a new exported async function `ensureUniqueUsername(base: string): Promise<string>` directly above `registerUserLocal` (and below `createUserReservations`).

       Implementation:
       ```ts
       export const ensureUniqueUsername = async (base: string): Promise<string> => {
         const existing = await strapi.db
           .query("plugin::users-permissions.user")
           .findOne({ where: { username: base }, select: ["id"] });

         if (!existing) return base;

         const MAX_ATTEMPTS = 10;
         for (let i = 0; i < MAX_ATTEMPTS; i++) {
           const suffix = crypto.randomInt(10000, 100000); // 5-digit: 10000–99999
           const candidate = `${base}${suffix}`;
           const collision = await strapi.db
             .query("plugin::users-permissions.user")
             .findOne({ where: { username: candidate }, select: ["id"] });
           if (!collision) return candidate;
         }

         throw new Error("Could not generate unique username after 10 attempts");
       };
       ```

       `crypto` is already imported at the top of the file (`import crypto from "crypto";`) — reuse it, do not add a duplicate import.

    2. Wire it into `registerUserLocal`: AFTER the required-field validation block (after the `if (... !username || ...) return ctx.badRequest(...)` block, around line 112) and BEFORE the `forwardBody` const declaration, add:

       ```ts
       // Resolve username collisions by appending a random 5-digit suffix.
       // Strapi is the single source of truth — enforce uniqueness here, not on the client.
       const uniqueUsername = await ensureUniqueUsername(username);
       ```

    3. Update `forwardBody` to use `username: uniqueUsername` instead of `username`.

    4. Do NOT modify `registerUserAuth` (OAuth provider callback) — Strapi's built-in OAuth flow generates usernames from provider profile data and has its own deduplication logic; out of scope for this quick task.

    5. Do NOT touch `apps/website/app/components/FormRegister.vue` — the client continues to send the naive `email.split('@')[0]` value; the Strapi layer is now responsible for resolving collisions.

    6. Run `yarn workspace strapi build` (or `cd apps/strapi && yarn build`) to verify TypeScript compiles cleanly with no `any` and no unused imports/vars (Codacy will flag them).
  </action>
  <verify>
    <automated>cd apps/strapi && yarn build</automated>
  </verify>
  <done>
    `ensureUniqueUsername` exists as an exported async function in authController.ts, is called inside `registerUserLocal` before `forwardBody` is constructed, `forwardBody.username` references the resolved unique value, and `yarn build` (TypeScript) passes with no errors or warnings.
  </done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Jest tests for ensureUniqueUsername (AAA pattern, mocked db.query)</name>
  <files>apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts</files>
  <behavior>
    - Test 1 (no collision): `findOne` returns `null` on first call → helper returns `base` unchanged, `findOne` called exactly once.
    - Test 2 (single collision): `findOne` returns `{ id: 1 }` then `null` → helper returns `${base}${suffix}` matching `/^gonzalo\d{5}$/`, `findOne` called exactly twice.
    - Test 3 (multiple collisions): `findOne` returns `{ id: 1 }`, `{ id: 2 }`, `null` → helper returns a 5-digit-suffixed username, `findOne` called exactly three times.
    - Test 4 (max attempts exceeded): `findOne` always returns `{ id: 1 }` → helper throws `Error` with message `"Could not generate unique username after 10 attempts"`, `findOne` called exactly 11 times (1 base + 10 retries).
  </behavior>
  <action>
    1. Read the existing file `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` first to match its mocking style for `strapi.db.query` (this file already mocks the same UID for other tests — reuse the same pattern).

    2. Add a new top-level `describe("ensureUniqueUsername", () => { ... })` block (do not modify or merge with existing describes for `registerUserLocal`, `verifyCode`, etc.).

    3. Import the helper: `import { ensureUniqueUsername } from "../../../../src/extensions/users-permissions/controllers/authController";` — adjust the relative path so it crosses the `tests/ → src/` boundary explicitly per CLAUDE.md testing rules.

    4. Mock `strapi.db.query("plugin::users-permissions.user").findOne` using `jest.fn()` and `mockResolvedValueOnce(...)` chains so each test controls its own collision sequence. Set up `(global as any).strapi = { db: { query: jest.fn(() => ({ findOne: mockFindOne })) } };` in `beforeEach` and reset it in `afterEach` (or follow whatever pattern the existing tests in this file use — read them first and replicate).

    5. Each test follows the AAA pattern with explicit `// Arrange`, `// Act`, `// Assert` comments (per CLAUDE.md Strapi testing rules).

    6. For the regex assertion in Test 2/3, use `expect(result).toMatch(/^gonzalo\d{5}$/)`.

    7. Do NOT mock `crypto.randomInt` — let it run for real; the regex assertion is sufficient and avoids brittle exact-value comparisons.

    8. Run `cd apps/strapi && yarn test --testPathPattern=authController` to verify all four new tests pass and no existing tests in the file regress.
  </action>
  <verify>
    <automated>cd apps/strapi && yarn test --testPathPattern=authController</automated>
  </verify>
  <done>
    Four new tests under `describe("ensureUniqueUsername")` pass. Existing tests in `authController.test.ts` continue to pass. No new TypeScript errors. Test file lives at `apps/strapi/tests/extensions/users-permissions/controllers/authController.test.ts` (root-level `tests/` dir, mirroring `src/` structure per CLAUDE.md).
  </done>
</task>

</tasks>

<verification>
1. `cd apps/strapi && yarn build` — TypeScript clean, no unused imports/vars.
2. `cd apps/strapi && yarn test --testPathPattern=authController` — all tests green.
3. (Optional manual smoke) Boot Strapi locally, register two users with emails `foo@a.com` and `foo@b.com`. Both should succeed; the second user's `username` in the DB should match `/^foo\d{5}$/`.
</verification>

<success_criteria>
- Two registrations with the same email local-part both succeed at `/api/auth/local/register` (no 400 / uniqueness error).
- The second user's `username` column in the `up_users` table matches `/^<base>\d{5}$/`.
- `ensureUniqueUsername` is exported and unit-tested in isolation.
- No changes to website client code (FormRegister.vue untouched).
- No changes to OAuth (`registerUserAuth`) — explicitly out of scope.
- Codacy / TypeScript / Jest all pass.
</success_criteria>

<output>
After completion, create `.planning/quick/260413-lxd-unique-username-generation-with-random-5/260413-lxd-SUMMARY.md` documenting:
- The exact lines added to authController.ts (helper + wiring)
- Test results (number of tests added, all green)
- Any deviations from the plan and why
</output>
