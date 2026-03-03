# Requirements: Waldo — Milestone v1.0

**Defined:** 2026-03-03
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1 Requirements

Requirements for milestone v1.0: Payment Gateway Abstraction.

### Payment Abstraction Layer

- [ ] **PAY-01**: El sistema define una interfaz `IPaymentGateway` con métodos `createTransaction` y `commitTransaction` con firmas normalizadas
- [ ] **PAY-02**: El sistema define tipos de respuesta normalizados `IGatewayInitResponse` e `IGatewayCommitResponse`
- [ ] **PAY-03**: El sistema provee un `TransbankAdapter` que implementa `IPaymentGateway` delegando al `TransbankService` existente sin cambiar su comportamiento
- [ ] **PAY-04**: El sistema provee un `PaymentGatewayRegistry` (factory) que retorna la pasarela activa según la variable de entorno `PAYMENT_GATEWAY` (default: `"transbank"`)
- [ ] **PAY-05**: El registry valida que las env vars requeridas estén presentes al instanciar el adapter, lanzando un error claro al startup si faltan

### Wiring y Correcciones

- [ ] **WIRE-01**: `ad.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente
- [ ] **WIRE-02**: `pack.service.ts` usa `getPaymentGateway()` de la factory en lugar de importar `TransbankServices` directamente
- [ ] **WIRE-03**: El controller reemplaza el string hardcodeado `"webpay"` con `process.env.PAYMENT_GATEWAY ?? "transbank"` al crear el registro de orden
- [ ] **WIRE-04**: Se agrega `return` después de `ctx.redirect` en el flujo fallido de `packResponse` para evitar ejecución continua

## Future Requirements

Deferred — not in this milestone.

### Gateways Adicionales

- **GATE-01**: El sistema provee un adapter concreto para una segunda pasarela (MercadoPago, PayPal, u otra)
- **GATE-02**: El usuario puede seleccionar la pasarela de pago desde el frontend

### Robustez

- **ROB-01**: Idempotencia en el endpoint de confirmación de pago (evitar doble-submit)
- **ROB-02**: Context recovery via almacenamiento server-side del `gatewayRef` (en lugar de `buy_order` string parsing)
- **ROB-03**: Reconciliación automática cuando Facto falla después de un pago autorizado

## Out of Scope

| Feature | Reason |
|---------|--------|
| UI para selección de pasarela | Transparente para el usuario — no requerido |
| Abstracción de suscripciones Pro (FlowService) | Dominio separado, lifecycle diferente |
| Adapter concreto para segunda pasarela | Solo abstracción en este milestone |
| Cambios en Website o Dashboard | Solo Strapi |
| Webhook handling generalizado | Cada pasarela tendrá su propia ruta de callback |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| PAY-01 | Phase 1 | Pending |
| PAY-02 | Phase 1 | Pending |
| PAY-03 | Phase 1 | Pending |
| PAY-04 | Phase 1 | Pending |
| PAY-05 | Phase 1 | Pending |
| WIRE-01 | Phase 2 | Pending |
| WIRE-02 | Phase 2 | Pending |
| WIRE-03 | Phase 2 | Pending |
| WIRE-04 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-03*
*Last updated: 2026-03-03 after roadmap creation*
