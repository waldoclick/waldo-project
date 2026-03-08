# Requirements: Waldo Project — v1.19 Zoho CRM Sync Model

**Defined:** 2026-03-08
**Core Value:** Los usuarios pueden publicar y gestionar avisos de forma confiable, con pagos que funcionan sin fricción — independientemente de la pasarela utilizada.

## v1.19 Requirements

Requirements for the Zoho CRM Sync Model milestone.

### Service Reliability

- [x] **RELY-01**: El cliente HTTP de Zoho refresca el access token automáticamente cuando recibe un 401 (response interceptor con `_retry` guard para evitar loops infinitos)
- [x] **RELY-02**: El header de autorización en `ZohoHttpClient` usa `Zoho-oauthtoken` en lugar de `Bearer`
- [ ] **RELY-03**: `createLead()` incluye `Lead_Status: "New"` en el payload enviado a Zoho
- [ ] **RELY-04**: Los tests de Zoho (`zoho.test.ts`) no hacen llamadas a la API real de Zoho — usan `axios-mock-adapter` para aislar el servicio
- [ ] **RELY-05**: Las variables `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`, `ZOHO_REFRESH_TOKEN`, `ZOHO_API_URL` están declaradas en `.env.example`

### Contact Sync Model

- [ ] **CONT-01**: Al crear un Contact en Zoho, los campos custom se inicializan en 0: `Ads_Published__c: 0`, `Total_Spent__c: 0`, `Packs_Purchased__c: 0`
- [ ] **CONT-02**: El servicio Zoho expone `updateContactStats(contactId, stats)` que actualiza selectivamente `Ads_Published__c`, `Total_Spent__c`, `Last_Ad_Posted_At__c` y/o `Packs_Purchased__c` vía `PUT /crm/v5/Contacts/{id}`

### Deal Sync Model

- [ ] **DEAL-01**: El servicio Zoho expone `createDeal(deal)` que crea un Deal con los campos: `Deal_Name`, `Stage: "Closed Won"`, `Amount`, `Contact_Name: { id }`, `Type`, `Closing_Date`, `Description`, `Lead_Source`
- [ ] **DEAL-02**: La confirmación de pago de un pack (`pack_purchased`) crea un Deal en Zoho y actualiza `Total_Spent__c` + `Packs_Purchased__c` en el Contact asociado
- [ ] **DEAL-03**: La confirmación de pago de un aviso (`ad_paid`) crea un Deal en Zoho y actualiza `Total_Spent__c` en el Contact asociado

### Event Wiring

- [ ] **EVT-01**: La publicación de un aviso (`ad_published`) actualiza `Ads_Published__c` y `Last_Ad_Posted_At__c` en el Contact de Zoho — sin crear un Deal
- [ ] **EVT-02**: El evento `ad_published` solo dispara el sync Zoho cuando el status transiciona a `"published"` por primera vez (guard: `previousData.status !== "published" && currentData.status === "published"`)
- [ ] **EVT-03**: Los eventos de pago (`pack_purchased`, `ad_paid`) resuelven el Zoho Contact ID vía `findContact(email)` antes de llamar a `createDeal()`

## Future Requirements

### Reliability Hardening (next dedicated milestone)

- **RELI-F01**: Cola de reintentos para llamadas Zoho fallidas (job queue con idempotency keys)
- **RELI-F02**: Backfill masivo de usuarios existentes que no tienen Contact en Zoho
- **RELI-F03**: Reconciliación nocturna de contadores (`Ads_Published__c`, `Total_Spent__c`) vs datos reales de Strapi

## Out of Scope

| Feature | Reason |
|---------|--------|
| Inbound Zoho webhooks (Zoho → Strapi) | Bidirectional sync requiere endpoint público, auth, y resolución de conflictos — fuera de scope |
| Almacenar Zoho Contact/Deal IDs en Strapi DB | Requiere cambios de schema en el modelo User — diferir |
| `Account_Name` en Deals | Waldo es B2C — sin modelo de empresa; omitir |
| Backfill de usuarios existentes | Miles de API calls, riesgo de rate-limit en datos en vivo — milestone separado |
| Eliminar `userUpdateController` (código muerto) | Cleanup de código; sin impacto funcional — diferir a milestone de deuda técnica |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| RELY-01 | Phase 43 | Complete |
| RELY-02 | Phase 43 | Complete |
| RELY-03 | Phase 44 | Pending |
| RELY-04 | Phase 43 | Pending |
| RELY-05 | Phase 43 | Pending |
| CONT-01 | Phase 44 | Pending |
| CONT-02 | Phase 44 | Pending |
| DEAL-01 | Phase 44 | Pending |
| DEAL-02 | Phase 45 | Pending |
| DEAL-03 | Phase 45 | Pending |
| EVT-01 | Phase 46 | Pending |
| EVT-02 | Phase 46 | Pending |
| EVT-03 | Phase 45 | Pending |

**Coverage:**
- v1.19 requirements: 13 total
- Mapped to phases: 13 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-08*
*Last updated: 2026-03-08 after initial definition*
