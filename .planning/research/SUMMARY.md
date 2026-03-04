# Project Research Summary

**Project:** Payment Gateway Abstraction
**Domain:** Backend service refactor — payment infrastructure
**Researched:** 2026-03-03
**Confidence:** HIGH

## Executive Summary

This project is a structural refactor to introduce a gateway-agnostic abstraction over Waldo's existing Transbank payment integration. The codebase already has two payment implementations (`TransbankService` for one-time payments, `FlowService` for Pro subscriptions), but the one-time payment domain (`AdService`, `PackService`) directly imports and calls `TransbankService` with no indirection. The task is not to add functionality — it is to insert a thin adapter layer so that a second one-time payment gateway can be swapped in via environment variable, with zero behavior change to the current Transbank flow.

The recommended approach is a plain TypeScript service module at `src/services/payment-gateway/`, following the exact same pattern as the existing 9 service directories. No Strapi plugin system, no external libraries, no new dependencies. The deliverable is: one interface file, one `TransbankAdapter` wrapping the existing service unchanged, one registry reading `PAYMENT_GATEWAY` env var, and import swaps in two service files. The entire implementation is roughly 100 lines of TypeScript.

The primary risks are interface design mistakes that would require rework when a second gateway is added (e.g., leaking Transbank-specific concepts into the interface), and silent failures in the post-payment flow (e.g., Facto throwing after a successful `commitTransaction` leaving revenue unreconciled). Both risks have clear prevention strategies and do not block the current milestone — they just need to be kept in mind during implementation.

## Key Findings

### Recommended Stack

No new packages are needed. The entire abstraction is structural TypeScript using the patterns already present in the codebase. The existing `src/services/transbank/` module is a direct template for how to structure `src/services/payment-gateway/`.

**Core technologies:**
- `TypeScript interface (IPaymentGateway)`: contract enforcement — compile-time safety with zero runtime overhead
- `Factory/registry function (getPaymentGateway())`: gateway selection — reads `PAYMENT_GATEWAY` env var, lazy singleton, mirrors how Transbank config already works
- `Plain TS module (src/services/payment-gateway/)`: module structure — consistent with all 9 existing service directories, no Strapi DI needed

### Expected Features

The scope of this milestone is strictly the abstraction plumbing. No user-visible changes.

**Must have (table stakes):**
- `IPaymentGateway` interface with `createTransaction` + `commitTransaction` — the contract every adapter must satisfy
- Normalized response envelopes (`IGatewayInitResponse`, `IGatewayCommitResponse`) — gateway-agnostic shapes callers can depend on
- `TransbankAdapter` implementing the interface — zero behavioral change, pure delegation to existing `TransbankService`
- `PaymentGatewayRegistry` with `getPaymentGateway()` — reads `PAYMENT_GATEWAY` env var, defaults to `"transbank"`
- Import swap in `ad.service.ts` and `pack.service.ts` — the two call sites that currently import `TransbankServices` directly
- Fix hardcoded `"webpay"` string in `payment.ts` controller — replace with `process.env.PAYMENT_GATEWAY ?? "transbank"` for data correctness

**Should have (future, not this milestone):**
- Concrete adapter for a second gateway (e.g., MercadoPago) — proves the abstraction works end-to-end
- Startup env var validation in registry — clear error if required gateway vars are missing

**Defer (v2+):**
- Flow/subscription abstraction — entirely separate domain and lifecycle, out of scope
- Gateway health-check / automatic fallback — adds orchestration complexity not yet needed
- Per-user or per-region gateway routing — high complexity, not required

### Architecture Approach

The architecture inserts a single new layer between the two payment service files and the existing Transbank implementation. `AdService` and `PackService` call `getPaymentGateway()` instead of importing `TransbankServices` directly. The registry returns a `TransbankAdapter`, which delegates 100% to the existing `TransbankService`. The controller, routes, policies, and all other files are untouched. Adding a future gateway requires creating one new adapter file, registering it in the registry, and setting an env var — zero changes to existing files.

**Major components:**
1. `IPaymentGateway` interface + response types (`gateway.interface.ts`) — the contract, pure types, no logic
2. `TransbankAdapter` (`adapters/transbank.adapter.ts`) — thin wrapper, delegates all calls to existing `TransbankService`
3. `PaymentGatewayRegistry` (`registry.ts`) — reads `PAYMENT_GATEWAY` env var, returns the correct adapter instance
4. Modified `AdService` + `PackService` — import swap only, identical runtime behavior

### Critical Pitfalls

1. **Transbank-specific concepts leaking into the interface** — Use an opaque `gatewayRef` string instead of `token` in the interface. The `TransbankAdapter` maps Transbank's `token` to `gatewayRef` internally. Prevents interface breakage when a second gateway uses a different reference mechanism. (Phase 1)

2. **`buy_order` string used for context recovery** — The current code parses `order-{userId}-{adId}-{uniqueId}` echoed back by Transbank. Other gateways won't echo custom strings. For now the adapter preserves this behavior, but the interface must not assume it. Store context server-side keyed by `gatewayRef` when the second gateway is added. (Phase 1 design constraint)

3. **Facto call throws after successful `commitTransaction`** — Payment is authorized but order is never created, leaving unreconciled revenue. Wrap post-commit operations in try/catch with logging and a reconciliation queue path. (Phase 2)

4. **Missing `return` after `ctx.redirect` in `packResponse`** — Execution continues into Facto and order creation even when payment failed. Fix this bug as part of the wiring phase. (Phase 2)

5. **Over-abstracting for imagined future gateways** — Interface must not include webhooks, refunds, subscriptions, or multi-method routing. Design for exactly what Transbank does today. The second concrete gateway reveals what actually needs to generalize. (Phase 1)

## Implications for Roadmap

Based on research, the work decomposes into two clean phases with a clear dependency boundary: define the contract first, then wire it.

### Phase 1: Interface and Adapter Layer

**Rationale:** Everything else depends on the interface being correct. Defining types first is zero-risk and creates the foundation the adapter and registry build on. The interface must be finalized before any call sites are modified, so this phase must complete before Phase 2 begins.

**Delivers:** All new files under `src/services/payment-gateway/` — types, adapter, registry. No existing behavior changes. Fully self-contained; can be code-reviewed in isolation without touching the payment flow.

**Addresses:** Table stakes features 1-4 (interface, response envelopes, adapter, registry)

**Avoids:** Pitfalls 1, 2, 3, 5 (interface design mistakes, Transbank-specific leakage, over-abstraction)

**Build order within phase:**
1. `gateway.interface.ts` — pure types, no dependencies
2. `transbank.adapter.ts` — depends on interface + existing `TransbankService`
3. `registry.ts` — depends on adapter; includes env var validation

### Phase 2: Call Site Wiring and Bug Fixes

**Rationale:** Only after the registry is stable should existing call sites be modified. The import swap is mechanical and low-risk, but isolating it in its own phase allows clean verification that behavior is identical before and after.

**Delivers:** `AdService` and `PackService` routed through the abstraction layer. Hardcoded `"webpay"` string corrected. Existing bug in `packResponse` fixed. End-to-end behavior identical to pre-refactor.

**Addresses:** Table stakes features 5-6 (import swap, controller fix)

**Avoids:** Pitfalls 3, 4, 7, 8 (Facto error handling, missing return, hardcoded payment_method)

**Build order within phase:**
1. Swap imports in `ad.service.ts` (2 call sites)
2. Swap imports in `pack.service.ts` (2 call sites)
3. Fix `"webpay"` hardcoding in `payment.ts` controller
4. Add `return` after `ctx.redirect` in `packResponse` failure path
5. Verify end-to-end behavior is identical (Transbank integration unchanged)

### Phase Ordering Rationale

- Phase 1 must precede Phase 2 because the call sites can't reference the registry until it exists.
- The split prevents a large diff that mixes new abstractions with call site changes — each phase is independently reviewable and revertable.
- No phase requires deeper external research. The codebase is the authoritative source. Patterns are fully established.

### Research Flags

Phases with standard patterns (no additional research needed):
- **Phase 1:** Plain TypeScript module pattern is directly observed in 9 existing service directories. Interface design is derived 1-to-1 from `TransbankService`'s existing public API.
- **Phase 2:** Mechanical import swap. Pattern is clear from codebase inspection.

No phases require `/gsd:research-phase` during planning. All implementation details are fully specified in the research files.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Derived from direct codebase analysis — no speculation |
| Features | HIGH | Scope is constrained to existing behavior; no external API uncertainty |
| Architecture | HIGH | Based on direct codebase analysis; patterns are explicit and consistent |
| Pitfalls | HIGH | All pitfalls are specific to actual code found in the codebase |

**Overall confidence:** HIGH

### Gaps to Address

- **Interface naming (`token` vs `gatewayRef`):** Research identified this as a critical design decision. The ARCHITECTURE.md research used `token` in the interface (matching Transbank exactly), while PITFALLS.md recommends `gatewayRef` for protocol-agnostic design. The roadmapper/planner should make this call explicitly. Recommendation: use `gatewayRef` if a second gateway is a near-term priority; use `token` if this refactor is purely structural and the interface will be revised when needed.

- **`FlowService.getPaymentStatus()` is incomplete:** This placeholder returning dummy data is noted but out of scope. It should be flagged as existing tech debt for a future milestone.

- **Idempotency on commit endpoint:** No protection against double-submit on callback URL. Noted as a future improvement; does not block this milestone.

## Sources

### Primary (HIGH confidence)
- Direct codebase analysis: `apps/strapi/src/services/transbank/` — existing service pattern used as template
- Direct codebase analysis: `apps/strapi/src/api/payment/services/ad.service.ts` — call site behavior
- Direct codebase analysis: `apps/strapi/src/api/payment/services/pack.service.ts` — call site behavior
- Direct codebase analysis: `apps/strapi/src/api/payment/controllers/payment.ts` — controller behavior and hardcoded strings
- Direct codebase analysis: `apps/strapi/src/services/payment-gateway/` — existing directory structure and service patterns

### Secondary (MEDIUM confidence)
- Standard adapter pattern (GoF) — architectural approach for wrapping existing implementations behind a shared interface

### Tertiary (LOW confidence)
- None

---
*Research completed: 2026-03-03*
*Ready for roadmap: yes*
