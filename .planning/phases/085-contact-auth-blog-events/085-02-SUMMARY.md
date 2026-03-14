---
phase: 085-contact-auth-blog-events
plan: "02"
status: completed
date: 2026-03-14
---

# Plan 02 Completion Summary

## What was done

Wired all 6 GA4 events into their trigger points across the website. All events fire correctly and reach GA4 via GTM (GTM-N4B8LDKS, measurement ID G-NR60QSZXRL).

## Events verified

| Req | Event | File | Verified |
|---|---|---|---|
| CONT-01 | `contact` (method=`email`) | `AdSingle.vue` | ✓ Tag Assistant + GA4 |
| CONT-02 | `contact` (method=`phone`) | `AdSingle.vue` | ✓ Tag Assistant + GA4 |
| LEAD-01 | `generate_lead` | `contacto/gracias.vue` | ✓ GA4 Realtime |
| AUTH-01 | `sign_up` (method=`email`) | `FormRegister.vue` | ✓ Console + dataLayer |
| AUTH-02 | `login` (method=`email`) | `FormVerifyCode.vue` | ✓ Console + dataLayer |
| AUTH-02 | `login` (method=`google`) | `login/google.vue` | ✓ Console + dataLayer |
| BLOG-01 | `article_view` | `blog/[slug].vue` | ✓ Tag Assistant hits panel |

## GTM setup completed

- Trigger `engagement-events`: Custom Event, regex `contact|generate_lead|sign_up|login|article_view`, fires on all custom events
- Tag `ga4-engagement-events`: GA4 Event, `{{Event}}` as event name, triggered by `engagement-events`
- Published as Version 6

## Key decisions

- `ga4-engagement-events` tag uses `{{Event}}` as event name — picks up the event name dynamically from the dataLayer, no hardcoding needed
- No event parameters configured in GTM — parameters are passed via `dataLayer.push()` from the code and GA4 collects them automatically
- `@click.capture` used in `AdSingle.vue` to ensure `contactSeller()` fires regardless of internal copy button propagation behavior
- `articleViewFired` boolean guard prevents double-firing on SSR hydration; slug-change watcher resets the guard on navigation between articles
