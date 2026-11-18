# SKL Waste Sdn Bhd — Phase 5 Conversion Tracking & Privacy-Safe Analytics Report

> **Entity:** SKL WASTE SDN BHD (SSM Registration No: `200801038953`)  
> **Headquarters:** `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`  
> **Primary Contact:** `Mr Hari` | `+60 16-615 9365` (`tel:+60166159365`) | `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)  
> **Implementation Files:** `src/utils/analytics.ts`, `src/layouts/BaseLayout.astro`, `src/components/QuotationForm.astro`, `src/components/ContactForm.astro`  
> **Compliance Standard:** Malaysian Personal Data Protection Act 2010 (PDPA) — **Strict Zero-PII Architecture**

---

## 1. Conversion Tracking Architecture Overview

The Phase 5 conversion tracking system measures high-intent customer interactions across all 9 pages of `https://www.sklwaste.com.my` while guaranteeing **zero personal data (PII) leakage** into Google Analytics 4 (`window.gtag`), Google Tag Manager (`window.dataLayer`), or Google Ads conversion tags.

Every tracked interaction passes through four hardened safeguards:
1. **Canonical Event Normalization (`EVENT_ALIAS_MAP`)**: Legacy event names automatically map to the 7 canonical Phase 5 event names.
2. **Strict PII Stripping (`PROHIBITED_PII_KEYS`)**: All customer names, phone numbers, emails, delivery addresses, free-text notes, and honeypot values are stripped prior to dispatch.
3. **400ms Deduplication Guard**: Suppresses duplicate or bubbled DOM events firing within a `400ms` window.
4. **Localhost `test_mode` Flagging**: Automatically sets `test_mode: true` when `window.location.hostname` is `localhost` or `127.0.0.1`.

---

## 2. The 7 Canonical Phase 5 Conversion Events

| # | Canonical Event Name | Legacy Alias Mapped | Trigger Source & DOM Selector | Non-PII Metadata Parameters | Business Funnel Stage |
| :---: | :--- | :--- | :--- | :--- | :--- |
| **1** | `phone_click` | `telephone_click` | Global delegated click listener in `src/layouts/BaseLayout.astro` on `a[href^="tel:"]` (`tel:+60166159365` in Header, Hero, Footer, Mobile Sticky Bar, Contact Cards, Result Panels). | `event_category: 'engagement'`, `event_label: 'phone_call_mr_hari'`, `page_location: window.location.pathname`, `test_mode` | Direct Telephone Dispatch Lead |
| **2** | `email_click` | — | Global delegated click listener in `src/layouts/BaseLayout.astro` on `a[href^="mailto:"]` (`mailto:tongroroservissklwaste@gmail.com` across site and form result panels). | `event_category: 'engagement'`, `event_label: 'email_dispatch'`, `page_location: window.location.pathname`, `test_mode` | Direct Email Dispatch Lead |
| **3** | `whatsapp_click` | — | Global delegated click listener in `src/layouts/BaseLayout.astro` on `a[href*="wa.me"]`. *(Note: While `contactData.whatsapp.isConfirmed` is `false`, zero active `wa.me` links exist in the DOM; ready for future activation).* | `event_category: 'engagement'`, `event_label: 'whatsapp_dispatch'`, `page_location: window.location.pathname`, `test_mode` | Direct WhatsApp Dispatch Lead *(Pending Confirmation)* |
| **4** | `quote_form_start` | — | First `focusin` or `input` interaction inside `#skl-quotation-form` (`src/components/QuotationForm.astro`), excluding `#q-websiteUrl` honeypot (`hasStartedQuoteForm` boolean lock ensures once-per-load firing). | `form_id: 'skl-quotation-form'`, `test_mode` | Top-of-Form Engagement / Funnel Drop-off Analysis |
| **5** | `generate_lead` | `quotation_form_submit`, `contact_form_submit` | Validated submission of `#skl-quotation-form` (`src/components/QuotationForm.astro`) or `#skl-contact-form` (`src/components/ContactForm.astro`). Also triggers Google Ads conversion when configured. | Quotation: `form_id: 'skl-quotation-form'`, `product_name` (`Tong Roro 2 Feet` / `Tong Roro 4 Feet`), `waste_category`, `rental_duration` (`10 days`).<br/>Contact: `form_id: 'skl-contact-form'`, `form_type: 'general_contact'`. | Primary Verified Web Lead Conversion |
| **6** | `select_tong_roro` | `product_select` | Clicking `[data-select-product]` on `ProductCard.astro` (`Tong Roro 2 Feet` = `RM2XX`, `Tong Roro 4 Feet` = `RM3XX–RM4XX`, `10 days`) or changing `#q-tongRoroSize` select dropdown in `QuotationForm.astro`. | `product_id` / `product_name`, `test_mode` | Product Size Commercial Intent |
| **7** | `contact_cta_click` | `primary_cta_click` | Global delegated click listener in `src/layouts/BaseLayout.astro` on `a[data-track-cta], button[data-track-cta], a.btn-primary` (excluding `tel:`, `mailto:`, `wa.me`, `[data-select-product]`, and submit buttons). | `event_category: 'engagement'`, `event_label` / `cta_id`, `page_location: window.location.pathname`, `test_mode` | CTA Click-Through Velocity |

*(Note: `src/utils/analytics.ts` also supports `service_area_Filter` / `service_area_filter` in `CanonicalConversionEventName` for service area filtering extensions).*

---

## 3. Alias Normalization (`EVENT_ALIAS_MAP`)

To maintain backward compatibility across components while standardizing GA4 and GTM reporting, `src/utils/analytics.ts` normalizes legacy event names via `EVENT_ALIAS_MAP`:

```typescript
export const EVENT_ALIAS_MAP: Record<string, CanonicalConversionEventName> = {
  telephone_click: 'phone_click',
  quotation_form_submit: 'generate_lead',
  contact_form_submit: 'generate_lead',
  product_select: 'select_tong_roro',
  primary_cta_click: 'contact_cta_click'
};
```

Both `event` (canonical name) and `original_event` (invoked name) are included in the `window.dataLayer` payload and `skl:conversion` browser `CustomEvent`.

---

## 4. 400ms Deduplication Guard

To prevent double-counting caused by rapid double-clicks or overlapping event listeners:
- **In `src/utils/analytics.ts`**:
  Module-scoped `lastEventKey` and `lastEventTimestamp` track `${canonicalEvent}::${dedupIdentifier}`. Any identical event key occurring within `< 400ms` of the previous call returns early without firing.
- **In `src/layouts/BaseLayout.astro` & Form Components**:
  Global click delegation in `BaseLayout.astro` enforces a `400ms` guard (`now - lastTrackTs < 400`), and per-element `mailto:` / `tel:` click listeners inside `QuotationForm.astro` and `ContactForm.astro` were removed so clicks inside form result panels are handled once by the global listener.

---

## 5. Strict Zero-PII Sanitization (`PROHIBITED_PII_KEYS`)

In compliance with the Malaysian Personal Data Protection Act 2010 (PDPA) and Google Analytics Terms of Service, `sanitizeMetadata()` in `src/utils/analytics.ts` normalizes every metadata key (`key.toLowerCase().replace(/[^a-z]/g, '')`) and strips any key matching `PROHIBITED_PII_KEYS`:

```typescript
const PROHIBITED_PII_KEYS = new Set([
  'name',
  'customername',
  'phone',
  'phonenumber',
  'email',
  'customeremail',
  'address',
  'deliverylocation',
  'location',
  'message',
  'additionalrequirements',
  'additionalnotes',
  'requirements',
  'note',
  'websiteurl'
]);
```

Only primitive `string | number | boolean` values on non-PII keys are permitted into `safeMetadata`.

---

## 6. Multi-Channel Dispatch Targets

When `trackConversionEvent(eventName, metadata)` executes in the browser (`src/utils/analytics.ts`):
1. **Google Tag Manager (`window.dataLayer`)**: If `Array.isArray(window.dataLayer)`, pushes `{ event: canonicalEvent, original_event: eventName, ...safeMetadata, timestamp }`.
2. **Google Analytics 4 (`window.gtag`)**: If `typeof window.gtag === 'function'`, calls `window.gtag('event', canonicalEvent, safeMetadata)`.
3. **Google Ads Conversion (`window.gtag`)**: If `canonicalEvent === 'generate_lead'` and both `analyticsConfig.googleAdsId` and `analyticsConfig.googleAdsConversionLabel` are configured, fires `window.gtag('event', 'conversion', { send_to: `${googleAdsId}/${googleAdsConversionLabel}`, value: 1.0, currency: 'MYR' })`.
4. **In-Page CustomEvent (`skl:conversion`)**: Dispatches `new CustomEvent('skl:conversion', { detail: { eventName: canonicalEvent, originalEventName: eventName, metadata: safeMetadata, timestamp } })` on `window` for automated testing and browser console inspection.
