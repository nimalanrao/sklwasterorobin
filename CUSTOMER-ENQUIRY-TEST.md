# SKL Waste Sdn Bhd — Customer Enquiry & Form Verification Report

> **Entity:** SKL WASTE SDN BHD (SSM Registration No: `200801038953`)  
> **Headquarters:** `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`  
> **Primary Contact:** `Mr Hari` | `+60 16-615 9365` (`tel:+60166159365`) | `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)  
> **Implementation Files:** `src/components/QuotationForm.astro`, `src/components/ContactForm.astro`, `src/utils/validators.ts`, `src/utils/formatters.ts`, `src/utils/formHandler.ts`, `src/data/formsConfig.ts`

---

## 1. Enquiry Form Architecture Overview

The SKL Waste website provides two purpose-built customer enquiry forms designed for static hosting resilience, client-side validation, spam prevention, and transparent multi-channel dispatch:

1. **Tong Roro Quotation Request Form (`#skl-quotation-form` in `src/components/QuotationForm.astro`)**
   - Embedded on `/`, `/tong-roro-rental`, `/waste-management-services`, `/service-areas`, and `/contact-us`.
   - Captures all required operational parameters:
     - `#q-customerName` (`customerName` — Required)
     - `#q-phoneNumber` (`phoneNumber` — Required, 9–15 digits)
     - `#q-customerEmail` (`customerEmail` — Optional, validated format when non-empty)
     - `#q-tongRoroSize` (`tongRoroSize` — Required: `Tong Roro 2 Feet (RM2XX — Provisional, 10 days)` or `Tong Roro 4 Feet (RM3XX–RM4XX — Provisional, 10 days)`)
     - `#q-deliveryLocation` (`deliveryLocation` — Required, listing the 13 pending-verification Selangor areas + Other Selangor/Klang Valley area)
     - `#q-preferredDeliveryDate` (`preferredDeliveryDate` — Required)
     - `#q-rentalDuration` (`rentalDuration` — Required, standard `10 days`)
     - `#q-wasteType` (`wasteType` — Required, mapped to the 9 confirmed waste categories)
     - `#q-additionalRequirements` (`additionalRequirements` — Optional)
     - `#q-websiteUrl` (`websiteUrl` — Offscreen visually-hidden honeypot bot trap)

2. **General Contact Enquiry Form (`#skl-contact-form` in `src/components/ContactForm.astro`)**
   - Embedded on `/contact-us`.
   - Captures:
     - `#c-name` (`name` — Required)
     - `#c-phone` (`phone` — Required, 9–15 digits)
     - `#c-email` (`email` — Optional, validated format when non-empty)
     - `#c-subject` (`subject` — Required)
     - `#c-message` (`message` — Required)
     - `#c-websiteUrl` (`websiteUrl` — Offscreen visually-hidden honeypot bot trap)

---

## 2. Hardened Validation, Bot Protection & Submission Lock

### A. Input Validation Rules (`src/utils/validators.ts`)
- **Phone Format Validation (`isValidPhoneFormat`)**:
  Strips non-digit formatting characters (`+`, `-`, spaces, parentheses) via `(raw || '').replace(/\D/g, '')` and verifies `digits.length >= 9 && digits.length <= 15`. Accepts standard Malaysian mobile/landline formats (`016-615 9365`, `+60 16-615 9365`, `03-6156 XXXX`) while rejecting short or malformed strings with `'Please enter a valid Malaysian or international phone number (9–15 digits).'`.
- **Optional Email Validation (`isValidOptionalEmail`)**:
  Permits empty/omitted email fields (since many site contractors prefer telephone coordination), but validates any non-empty input against `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`, returning `'Please enter a valid email address.'` if malformed.
- **Required Field Checks**:
  Ensures non-empty trimmed values for all mandatory fields before allowing submission.

### B. Offscreen Honeypot Bot Trap (`#q-websiteUrl` & `#c-websiteUrl`)
Both forms include an accessible visually-hidden `.hp-field` container (`aria-hidden="true"`, `tabindex="-1"`, `autocomplete="off"`, positioned offscreen via `position: absolute; left: -9999px; width: 1px; height: 1px; overflow: hidden; opacity: 0; pointer-events: none;`).
- Human users and screen readers never focus or populate `#q-websiteUrl` / `#c-websiteUrl`.
- Automated spam bots that fill all `<input>` fields trigger `payload.websiteUrl.trim().length > 0`, which `validateQuotationPayload` and `validateContactPayload` block immediately with `'Automated spam check triggered. Submission blocked.'`.

### C. Duplicate-Submission Lock (`isSubmitting`)
Both form submit handlers maintain a boolean `isSubmitting` lock. If a user double-clicks `#quotation-submit-btn` or `#contact-submit-btn` while an async submission is in progress, subsequent submit events return early until the `finally` block resets `isSubmitting = false`.

---

## 3. Multi-Channel Dispatch & WhatsApp Readiness

### A. Webhook vs. Honest Static Dispatch (`src/utils/formHandler.ts`, `src/data/formsConfig.ts`)
- **When `PUBLIC_QUOTATION_WEBHOOK_URL` / `PUBLIC_CONTACT_WEBHOOK_URL` is configured**:
  `submitEnquiryForm(endpointUrl, payload)` sends an HTTP `POST` with `Content-Type: application/json` to the configured endpoint and reports `{ ok: true, mode: 'webhook' }` on HTTP 2xx.
- **When no webhook URL is configured (Default Static Deployment)**:
  `submitEnquiryForm` **never fakes or simulates a server submission**. It returns `{ ok: false, mode: 'unconfigured' }`, and the UI opens `#quotation-result-panel` / `#contact-result-panel` with three immediate, verified customer dispatch options:
  1. **Direct Pre-Filled Email (`#quotation-mailto-link` / `#contact-mailto-link`)**: Built via `buildQuotationMailtoUrl` / `buildContactMailtoUrl` (`src/utils/formatters.ts`) addressed to `mailto:tongroroservissklwaste@gmail.com` with the complete formatted summary in the email body.
  2. **One-Click Clipboard Copy (`#quotation-copy-btn` / `#contact-copy-btn`)**: Copies the formatted plain-text summary (`formatQuotationSummaryText` / `formatContactSummaryText`) to the user's clipboard (`#quotation-copy-feedback`).
  3. **Direct Telephone Call to Mr Hari (`tel:+60166159365`)**: One-tap call button to confirm provisional pricing (`RM2XX` / `RM3XX–RM4XX`, `10 days` rental duration), delivery/collection charges, and pending service area availability.

### B. Conditional WhatsApp Dispatch Readiness (`buildWhatsAppEnquiryUrl`)
- `src/utils/formatters.ts` exports `buildWhatsAppEnquiryUrl(rawNumber, payload)`, which constructs `https://wa.me/60166159365?text=...` containing **only non-PII service parameters** (Tong Roro size, `10 days` rental duration, delivery location, preferred date, waste type — zero customer name, phone, or email in the URL query string).
- Because `contactData.whatsapp.isConfirmed` is currently `false` in `src/data/contact.ts`, `QuotationForm.astro` does **not** render an active `wa.me` anchor in the built HTML, displaying instead the transparent status notice:
  `Status WhatsApp: Belum Disahkan — sila hantar melalui Emel atau hubungi Mr Hari secara terus.`
- As soon as Mr Hari confirms WhatsApp availability and `contactData.whatsapp.isConfirmed` is set to `true`, `#quotation-whatsapp-link` automatically activates on the next build.

---

## 4. 10-Step Customer Journey Verification Matrix

The table below separates **(a) Verified Code & Build Implementation** from **(b) Live Browser / Production Environment Verification**:

| Step | Customer Journey Action | Code & Static Build Verification Status | Live Browser / Owner Production Note |
| :---: | :--- | :--- | :--- |
| **Step 1** | Customer lands on `/` or `/tong-roro-rental` and reviews `Tong Roro 2 Feet` (`RM2XX`, `10 days`) and `Tong Roro 4 Feet` (`RM3XX–RM4XX`, `10 days`). | **PASS (Code & Build)**: Product cards, pricing table, and provisional/delivery disclaimers rendered in `dist/index.html` and `dist/tong-roro-rental/index.html`. | Verify visual rendering across live domain after DNS cutover. |
| **Step 2** | Customer clicks `[data-select-product]` on a `ProductCard` (e.g., `Tong Roro 2 Feet`). | **PASS (Code)**: Smooth-scrolls to `#quotation-form`, pre-selects `#q-tongRoroSize`, focuses `#q-customerName`, and dispatches `select_tong_roro`. | Interactive DOM behavior verified in code; run live browser check post-deploy. |
| **Step 3** | Customer focuses or types into `#skl-quotation-form` for the first time. | **PASS (Code)**: `focusin` / `input` listener fires `trackConversionEvent('quote_form_start', { form_id: 'skl-quotation-form' })` once (`hasStartedQuoteForm = true`). | In localhost preview, event carries `test_mode: true`. |
| **Step 4** | Customer submits `#skl-quotation-form` with empty required fields or an invalid phone number (`12345`). | **PASS (Code)**: `validateQuotationPayload` rejects submission, populates `#quotation-error-list`, unhides `#quotation-error-summary`, and does **not** fire `generate_lead`. | Prevents malformed enquiries from firing conversion pixels. |
| **Step 5** | Automated spam bot populates hidden honeypot `#q-websiteUrl` or `#c-websiteUrl` and submits. | **PASS (Code)**: `validateQuotationPayload` / `validateContactPayload` detects non-empty `websiteUrl` and blocks submission with `'Automated spam check triggered. Submission blocked.'`. | Offscreen `.hp-field` (`left: -9999px; aria-hidden="true"`) traps automated bots. |
| **Step 6** | Customer enters valid details (`+60 12-345 6789`, `projek@syarikat.com.my`, `Tong Roro 4 Feet`, `Sungai Buloh`, date, `10 days`, `Sisa pembinaan`) and submits. | **PASS (Code)**: Validation passes (`valid: true, errors: []`). `isSubmitting` lock prevents duplicate clicks during processing. | Ready for end-to-end user enquiries. |
| **Step 7** | Analytics dispatcher records the validated enquiry submission. | **PASS (Code)**: Fires `generate_lead` (`form_id: 'skl-quotation-form'`, `product_name`, `waste_category`, `rental_duration: '10 days'`) with **zero PII** (`customerName`, `phoneNumber`, `customerEmail`, `deliveryLocation` stripped by `PROHIBITED_PII_KEYS`). | When `PUBLIC_GOOGLE_ADS_ID` & `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` are set, also fires Google Ads conversion. |
| **Step 8** | Form handler evaluates `formsConfig.quotationEndpointUrl` (`PUBLIC_QUOTATION_WEBHOOK_URL`). | **PASS (Code)**: When unconfigured (`''`), `submitEnquiryForm` returns `{ ok: false, mode: 'unconfigured' }` honestly without faking a backend response. | Owner may optionally configure `PUBLIC_QUOTATION_WEBHOOK_URL` for automated webhook POSTs. |
| **Step 9** | Result panel (`#quotation-result-panel`) displays formatted summary (`#quotation-summary-preview`) and dispatch actions. | **PASS (Code)**: Populates `#quotation-mailto-link` (`mailto:tongroroservissklwaste@gmail.com?subject=...&body=...`), `#quotation-copy-btn`, and `tel:+60166159365`. Shows pending WhatsApp notice while `isConfirmed === false`. | Customer can immediately email, copy, or call Mr Hari. |
| **Step 10** | Customer clicks `tel:+60166159365` or `mailto:tongroroservissklwaste@gmail.com` to dispatch to Mr Hari. | **PASS (Code)**: Global click listener in `BaseLayout.astro` fires `phone_click` or `email_click` once (guarded by 400ms deduplication). | Initiates mobile dialer or default email client. |
