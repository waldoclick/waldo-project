# Phase 060: Mostrar comprobante Webpay

**Goal:** Display a compliant Webpay/Transbank receipt with all required fields on /pagar/gracias after payment success.

## Description
Implement in the web client an on-screen receipt for Webpay transactions, containing every mandatory field according to Chilenean regulatory and Webpay standards. No print/email features in this phase. Focus is on immediate post-payment user clarity and legal compliance.

## Requirements
- Monto (amount)
- Código de autorización (authorization code)
- Fecha/hora de pago (date/time of payment)
- Tipo de pago (payment type)
- Últimos 4 dígitos (last 4 digits of card)
- Número de orden/compra (order/transaction number)
- Nombre/RUT/ID de comercio (merchant name/id)
- Webpay branding (logo)
- All labels in Spanish

## Phase Boundary
- Only for direct Webpay flows, not for other gateways, not for email/print
- Data comes from confirmed Webpay response
- Placeholder if any field absent
