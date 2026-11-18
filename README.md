# SKL WASTE SDN BHD: Corporate Website

Official corporate website and customer enquiry platform for **SKL WASTE SDN BHD** (Company Registration No. `200801038953`), a waste management company based in Sungai Buloh, Selangor, Malaysia.

The site is built with **Astro 5** and **TypeScript** as a zero-JS-by-default static application (`output: 'static'`). It focuses on Tong Roro bin rental (`Sewaan Tong Roro`), waste collection, transportation, and disposal services across residential, commercial, construction, and industrial projects.

---

## Official company profile

| Field | Verified Value |
| :--- | :--- |
| **Company Name** | SKL WASTE SDN BHD |
| **Registration Number** | `200801038953` |
| **Headquarters** | PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA. |
| **Main Contact Person** | Mr Hari |
| **Telephone** | [+60 16-615 9365](tel:+60166159365) |
| **Email** | [tongroroservissklwaste@gmail.com](mailto:tongroroservissklwaste@gmail.com) |
| **WhatsApp (`https://wa.me/60166159365`)** | Controlled via `contactData.whatsapp.isConfirmed` (`false` until confirmed by owner; no active `wa.me` links render while unconfirmed) |
| **Live GitHub Pages URL** | [https://nimalanrao.github.io/sklwasterorobin/](https://nimalanrao.github.io/sklwasterorobin/) |
| **Canonical Production URL** | `https://www.sklwaste.com.my` |

---

## Rental catalogue and business rules

All business data lives in typed modules inside `src/data/` so pricing, service coverage, and contact details can be updated from a single place without touching page templates.

| Product | Provisional Rate | Standard Rental Duration | Status & Conditions |
| :--- | :--- | :--- | :--- |
| **Tong Roro 2 Feet** | `RM2XX` | `10 days` | Provisional rate (`Pending Verification`). Delivery and collection charges are not confirmed and are not claimed to be included. |
| **Tong Roro 4 Feet** | `RM3XX–RM4XX` | `10 days` | Provisional rate (`Pending Verification`). Delivery and collection charges are not confirmed and are not claimed to be included. |

Service coverage across the 13 listed locations in Selangor (Sungai Buloh, Desa Coalfields, Paya Jaras, Kuang, Kundang, Saujana Utama, Bandar Baru Sungai Buloh, Bukit Rahman Putra, Merbau Sempak, Subang Bestari, Kampung Baru Subang, Puncak Alam, and Rawang) is explicitly marked `Pending Verification` until confirmed directly with Mr Hari.

---

## Quick start

### Prerequisites

1. **Node.js** `>= 18.18.0` (tested on Node 24)
2. **npm** `>= 9.0.0`

### Installation and local development

```bash
# Install dependencies
npm install

# Start the local Astro dev server at http://localhost:4321
npm run dev

# Run TypeScript type checking
npx tsc --noEmit

# Build static production output into dist/
npm run build

# Preview the production build locally
npm run preview
```

---

## Project structure

```text
rorobinsklwaste/
├── public/
│   ├── _headers                 # Production security & static asset cache headers
│   ├── favicon.svg              # Vector fallback icon
│   ├── llms.txt                 # Structured entity & service reference for AI answer engines
│   ├── robots.txt               # Search & AI crawler directives + sitemap pointer
│   └── images/                  # Corporate logo & Tong Roro hero photography (PNG, JPG, WebP)
├── src/
│   ├── components/
│   │   ├── Header.astro               # Sticky responsive navigation + call CTA
│   │   ├── Footer.astro               # Corporate NAP footer + verification disclosures
│   │   ├── Breadcrumb.astro           # Accessible breadcrumb navigation
│   │   ├── VerificationNotice.astro   # Reusable provisional / verification alert banner
│   │   ├── ProductCard.astro          # Tong Roro 2ft & 4ft cards with SVG scale diagrams
│   │   ├── ProductCatalogue.astro     # Catalogue grid wrapper
│   │   ├── PricingTable.astro         # Transparent comparison table
│   │   ├── RentalProcessSteps.astro   # 6-step Tong Roro booking workflow
│   │   ├── ServiceList.astro          # Primary + 9 secondary waste service categories
│   │   ├── IndustryGrid.astro         # 10 served commercial, residential & industrial sectors
│   │   ├── ServiceAreaList.astro      # Interactive Selangor area filter & verification table
│   │   ├── FAQAccordion.astro         # Bilingual Bahasa Malaysia & English FAQ accordion
│   │   ├── ContactDetailsCard.astro   # Direct contact card for Mr Hari
│   │   ├── QuotationForm.astro        # Validated Tong Roro quotation form + dispatch panel
│   │   └── ContactForm.astro          # General enquiry form + dispatch panel
│   ├── data/
│   │   ├── company.ts           # Official legal name, reg no. 200801038953 & HQ address
│   │   ├── contact.ts           # Mr Hari contact info & WhatsApp activation flag
│   │   ├── products.ts          # Tong Roro 2 Feet & 4 Feet specifications and RM2XX / RM3XX–RM4XX rates
│   │   ├── services.ts          # Primary & 9 secondary waste management categories
│   │   ├── serviceAreas.ts      # 13 Selangor service areas with Pending Verification flags
│   │   ├── industries.ts        # 10 target sectors
│   │   ├── rentalProcess.ts     # 6-step rental workflow data
│   │   ├── faq.ts               # Bilingual FAQ entries
│   │   ├── formsConfig.ts       # Webhook endpoint & recipient email config
│   │   ├── navigation.ts        # Header & footer navigation links
│   │   └── seo.ts               # Per-route metadata, canonical URLs & analytics config
│   ├── layouts/
│   │   └── BaseLayout.astro     # HTML head, JSON-LD @graph, conditional GA4/GTM/Ads & click tracker
│   ├── pages/
│   │   ├── index.astro                      # Homepage
│   │   ├── about-us.astro                   # Corporate profile & registration details
│   │   ├── tong-roro-rental.astro           # Tong Roro size comparison, pricing & quotation form
│   │   ├── waste-management-services.astro  # Full service breakdown
│   │   ├── industries-we-serve.astro        # Sector-specific waste solutions
│   │   ├── service-areas.astro              # Selangor coverage directory & interactive filter
│   │   ├── contact-us.astro                 # Direct contact channels & enquiry forms
│   │   ├── privacy-policy.astro             # PDPA Malaysia privacy notice
│   │   ├── 404.astro                        # Custom error page
│   │   └── sitemap.xml.ts                   # Dynamic XML sitemap generator
│   ├── styles/
│   │   └── base.css             # Design tokens, responsive layout grid & typography
│   └── utils/
│       ├── analytics.ts         # Privacy-safe GA4 / GTM / Google Ads event dispatcher
│       ├── formHandler.ts       # Honest webhook submission + static fallback handler
│       ├── formatters.ts        # Summary text, mailto URL & prefilled WhatsApp URL builders
│       ├── schema.ts            # Schema.org JSON-LD @graph generator
│       └── validators.ts        # Honeypot spam check, 9–15 digit phone & email validators
├── .env.example                 # Template for optional PUBLIC_* environment variables
├── astro.config.mjs             # Astro static build configuration
├── package.json                 # Scripts and dependencies
└── tsconfig.json                # Strict TypeScript configuration
```

---

## Key engineering features

### 1. Customer enquiry pipeline and anti-spam protection

Both `QuotationForm.astro` and `ContactForm.astro` validate customer inputs on the client before preparing dispatch payloads:

1. Offscreen honeypot inputs (`#q-websiteUrl` and `#c-websiteUrl`) block automated spam bots without adding CAPTCHA friction for real customers.
2. Phone numbers are checked via `isValidPhoneFormat` (requiring 9 to 15 digits after stripping spaces and symbols) and optional email addresses are checked via `isValidOptionalEmail`.
3. An `isSubmitting` lock disables the submit button while processing to prevent duplicate submissions.
4. When `PUBLIC_QUOTATION_WEBHOOK_URL` or `PUBLIC_CONTACT_WEBHOOK_URL` is configured, the form posts JSON to the webhook. When unconfigured on a static host, it never fakes a backend response; instead it reveals a preformatted summary with one-click dispatch to `tongroroservissklwaste@gmail.com`, clipboard copy, and direct phone call to `+60 16-615 9365`.
5. `buildWhatsAppEnquiryUrl` in `src/utils/formatters.ts` is ready to generate prefilled non-PII `wa.me` enquiry links automatically once `contactData.whatsapp.isConfirmed` is switched to `true`.

### 2. Privacy-safe conversion tracking (GA4, GTM, and Google Ads)

`src/utils/analytics.ts` and `src/layouts/BaseLayout.astro` track 7 canonical conversion events without leaking customer PII (`name`, `phone`, `email`, `address`, or free-text notes are stripped by `PROHIBITED_PII_KEYS`):

| Event Name | Trigger |
| :--- | :--- |
| `phone_click` | Clicking any `tel:+60166159365` link |
| `email_click` | Clicking any `mailto:tongroroservissklwaste@gmail.com` link |
| `whatsapp_click` | Clicking an active `wa.me` link (only when WhatsApp is confirmed) |
| `quote_form_start` | First field interaction inside `#skl-quotation-form` |
| `select_tong_roro` | Selecting a Tong Roro size via card button or form dropdown |
| `generate_lead` | Submitting a validated quotation or general contact form |
| `contact_cta_click` | Clicking primary quotation or contact CTA buttons |

A 400ms deduplication guard prevents rapid double-clicks from inflating counts, and `test_mode: true` is attached automatically when running on `localhost` or `127.0.0.1`.

### 3. Technical SEO, Local SEO, GEO, and AEO

1. Every indexable page renders a unique `<title>`, `<meta name="description">`, self-referencing `<link rel="canonical">`, Open Graph tags, Twitter Card tags, and a single `<h1>`.
2. `src/utils/schema.ts` injects a unified Schema.org JSON-LD `@graph` (`Organization`, `WasteManagement` local business entity, `WebSite`, `WebPage`, `BreadcrumbList`, `Service`, and `Product` catalogue items) without fabricated ratings or unverified numeric prices.
3. `/sitemap.xml`, `/robots.txt`, and `/llms.txt` are generated for search engines and AI answer engines.

---

## Environment variables

Copy `.env.example` to `.env` (or configure in your hosting dashboard). All variables are optional and fall back safely when left blank:

```ini
PUBLIC_SITE_URL=https://www.sklwaste.com.my
PUBLIC_GSC_VERIFICATION=
PUBLIC_GA4_MEASUREMENT_ID=
PUBLIC_GTM_ID=
PUBLIC_GOOGLE_ADS_ID=
PUBLIC_GOOGLE_ADS_CONVERSION_LABEL=
PUBLIC_QUOTATION_WEBHOOK_URL=
PUBLIC_CONTACT_WEBHOOK_URL=
```

---

## Project documentation and reports

Detailed architecture, SEO, conversion tracking, and handover guides are available in the repository root:

1. [PHASE-5-LAUNCH-REPORT.md](./PHASE-5-LAUNCH-REPORT.md)
2. [GOOGLE-INTEGRATION-REPORT.md](./GOOGLE-INTEGRATION-REPORT.md)
3. [CONVERSION-TRACKING-REPORT.md](./CONVERSION-TRACKING-REPORT.md)
4. [CUSTOMER-ENQUIRY-TEST.md](./CUSTOMER-ENQUIRY-TEST.md)
5. [DEPLOYMENT-HANDOVER.md](./DEPLOYMENT-HANDOVER.md)
6. [MAINTENANCE-PLAN.md](./MAINTENANCE-PLAN.md)
7. [SEO-IMPLEMENTATION-REPORT.md](./SEO-IMPLEMENTATION-REPORT.md)
8. [SEO-AUDIT-REPORT.md](./SEO-AUDIT-REPORT.md)
9. [KEYWORD-MAP.md](./KEYWORD-MAP.md)
10. [LOCAL-SEO-PLAN.md](./LOCAL-SEO-PLAN.md)
11. [GEO-AEO-REPORT.md](./GEO-AEO-REPORT.md)

---

## Common owner updates

1. To update Tong Roro rental rates or delivery fee terms, edit `priceDisplay`, `isPriceProvisional`, and `deliveryFeeNote` in `src/data/products.ts`.
2. To mark any of the 13 Selangor service areas as confirmed, set `isConfirmed: true` and `statusLabel: 'Confirmed'` for that entry in `src/data/serviceAreas.ts`.
3. To activate WhatsApp links across the entire site once confirmed, set `whatsapp.isConfirmed = true` in `src/data/contact.ts` and run `npm run build`.
