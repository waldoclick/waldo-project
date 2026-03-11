# Quick Task 6 Summary: Clean up ResumeOrder display

**Date:** 2026-03-11
**Commit:** d96606e

## Changes

**`apps/website/app/components/ResumeOrder.vue`:**
- Removed "N° de comprobante" CardInfo (was showing order documentId)
- Removed "Código de comercio" CardInfo
- Changed "Estado del pago" from `summary.status || '-'` to hardcoded `"Pagado"` (returning from TBK = authorized payment)

**`apps/website/app/pages/pagar/gracias.vue`:**
- Simplified description text — removed order number reference (`#${orderData.documentId}`)
