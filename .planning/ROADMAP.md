# Roadmap: Waldo — v1.0 Payment Gateway Abstraction

## Overview

This milestone introduces a gateway-agnostic abstraction layer over Waldo's existing Transbank payment integration in Strapi v5. Phase 1 defines the interface contract and implements the TransbankAdapter and registry — no existing behavior changes. Phase 2 wires the two payment service call sites through the abstraction and fixes two known bugs in the payment flow. When complete, adding a second payment gateway requires one new adapter file and an env var change — zero modifications to existing services.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Interface and Adapter Layer** - Define IPaymentGateway contract, implement TransbankAdapter, and build the PaymentGatewayRegistry (completed 2026-03-04)
- [x] **Phase 2: Call Site Wiring and Bug Fixes** - Route AdService and PackService through the registry; fix hardcoded string and missing return bug (completed 2026-03-04)

## Phase Details

### Phase 1: Interface and Adapter Layer
**Goal**: The payment gateway abstraction exists as a complete, self-contained module — interface, adapter, and registry — with no changes to existing payment behavior
**Depends on**: Nothing (first phase)
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05
**Success Criteria** (what must be TRUE):
  1. `IPaymentGateway` interface exists with `createTransaction` and `commitTransaction` method signatures that use gateway-agnostic types (`gatewayRef`, not `token`)
  2. `IGatewayInitResponse` and `IGatewayCommitResponse` normalized types exist and cover all data the current Transbank flow depends on
  3. `TransbankAdapter` implements `IPaymentGateway` and produces identical behavior to calling `TransbankService` directly — no call site changes required
  4. `getPaymentGateway()` returns the active adapter based on `PAYMENT_GATEWAY` env var, defaulting to `"transbank"` when unset
  5. Strapi startup fails with a clear error message if required env vars for the selected gateway are absent
**Plans**: 2 plans

Plans:
- [ ] 01-01-PLAN.md — Write failing test suite (Wave 0: RED state for PAY-01 through PAY-05)
- [ ] 01-02-PLAN.md — Implement types, adapter, registry, and barrel (Wave 1: GREEN state)

### Phase 2: Call Site Wiring and Bug Fixes
**Goal**: All payment call sites use the abstraction layer; Transbank behavior is identical to pre-refactor; two existing bugs in the payment flow are corrected
**Depends on**: Phase 1
**Requirements**: WIRE-01, WIRE-02, WIRE-03, WIRE-04
**Success Criteria** (what must be TRUE):
  1. `ad.service.ts` no longer imports `TransbankServices` directly — it calls `getPaymentGateway()` and the payment flow behaves identically
  2. `pack.service.ts` no longer imports `TransbankServices` directly — it calls `getPaymentGateway()` and the payment flow behaves identically
  3. The `payment_method` field stored in the order record reflects the value of `PAYMENT_GATEWAY` env var rather than the hardcoded string `"webpay"`
  4. In the `packResponse` failure path, execution stops after `ctx.redirect` — downstream Facto and order creation logic does not run on payment failure
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Write failing test suite for WIRE-01 through WIRE-04 (Wave 0: RED state)
- [ ] 02-02-PLAN.md — Rewire services and fix controller bugs (Wave 1: GREEN state)

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Interface and Adapter Layer | 2/2 | Complete   | 2026-03-04 |
| 2. Call Site Wiring and Bug Fixes | 2/2 | Complete   | 2026-03-04 |
