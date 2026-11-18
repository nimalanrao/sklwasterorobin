# SKL Waste Sdn Bhd — Google Ecosystem Integration Report

> **Entity:** SKL WASTE SDN BHD (SSM Registration No: `200801038953`)  
> **Headquarters:** `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`  
> **Primary Contact:** `Mr Hari` | `+60 16-615 9365` (`tel:+60166159365`) | `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)  
> **Canonical Production URL:** `https://www.sklwaste.com.my`  
> **Config Files:** `src/data/seo.ts`, `src/layouts/BaseLayout.astro`, `src/utils/analytics.ts`, `.env.example`

---

## 1. Integration Overview & Truthfulness Notice

> [!IMPORTANT]
> **Live Account Verification Status:**
> All code hooks, conditional `<head>` script tags, conversion event listeners, XML sitemap endpoints, and environment variable bindings for Google Search Console (GSC), Google Analytics 4 (GA4), Google Tag Manager (GTM), and Google Ads are **100% implemented in the codebase with zero fake or placeholder tracking IDs**.
>
> **The live domain (`https://www.sklwaste.com.my`) is NOT yet verified in Google Search Console, nor are live GA4/GTM/Google Ads properties active, because live verification requires the business owner's Google account credentials and DNS control.**

### Environment Variable Binding (`src/data/seo.ts` & `.env.example`)

All Google integration identifiers are read cleanly from build-time environment variables with empty-string fallbacks (`''`) so unconfigured builds never emit broken or synthetic tags:

```typescript
export interface AnalyticsConfig {
  googleSiteVerification: string;
  ga4MeasurementId: string;
  gtmId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
}

export const analyticsConfig: AnalyticsConfig = {
  googleSiteVerification: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
  ga4MeasurementId: import.meta.env.PUBLIC_GA4_MEASUREMENT_ID ?? '',
  gtmId: import.meta.env.PUBLIC_GTM_ID ?? '',
  googleAdsId: import.meta.env.PUBLIC_GOOGLE_ADS_ID ?? '',
  googleAdsConversionLabel: import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? ''
};
```

---

## 2. Google Search Console (GSC) Readiness

### A. Sitemap & Robots Protocol Verification
- **XML Sitemap Endpoint (`src/pages/sitemap.xml.ts` -> `dist/sitemap.xml`)**:
  - Automatically builds valid XML containing the **8 canonical indexable pages**:
    1. `https://www.sklwaste.com.my` (Priority `1.0`, `weekly`)
    2. `https://www.sklwaste.com.my/tong-roro-rental` (Priority `0.9`, `monthly`)
    3. `https://www.sklwaste.com.my/waste-management-services` (Priority `0.9`, `monthly`)
    4. `https://www.sklwaste.com.my/industries-we-serve` (Priority `0.8`, `monthly`)
    5. `https://www.sklwaste.com.my/service-areas` (Priority `0.8`, `monthly`)
    6. `https://www.sklwaste.com.my/about-us` (Priority `0.8`, `monthly`)
    7. `https://www.sklwaste.com.my/contact-us` (Priority `0.8`, `monthly`)
    8. `https://www.sklwaste.com.my/privacy-policy` (Priority `0.8`, `monthly`)
  - Correctly excludes `/404` (`noindex: true`).
- **Robots Exclusion File (`public/robots.txt` -> `dist/robots.txt`)**:
  ```text
  User-agent: *
  Allow: /

  # Ensure search engine crawlers have access to static styling, images, and scripts
  Allow: /_astro/
  Allow: /images/

  # XML Sitemap
  Sitemap: https://www.sklwaste.com.my/sitemap.xml
  ```

### B. Owner Domain Verification Instructions
The site owner can verify `https://www.sklwaste.com.my` in [Google Search Console](https://search.google.com/search-console) using either of two supported methods:

1. **Method 1: DNS TXT Record (Recommended — Domain Property)**
   - In Google Search Console, select **Add Property -> Domain** and enter `sklwaste.com.my`.
   - Copy the `google-site-verification=...` TXT record provided by Google.
   - Add the TXT record at the root (`@`) in the domain registrar / DNS provider (e.g., Cloudflare, Exabytes, MYNIC).
   - Click **Verify** in Google Search Console.
2. **Method 2: HTML Meta Tag (`PUBLIC_GSC_VERIFICATION` — URL Prefix Property)**
   - In Google Search Console, select **URL Prefix** (`https://www.sklwaste.com.my`) and choose the **HTML tag** verification option.
   - Copy only the token value inside `content="..."`.
   - Set `PUBLIC_GSC_VERIFICATION=<token>` in the hosting environment variables (or `.env`) and run `npm run build`.
   - `src/layouts/BaseLayout.astro` automatically renders:
     ```html
     <meta name="google-site-verification" content="<token>" />
     ```
   - Click **Verify** in Google Search Console, then navigate to **Sitemaps** and submit `https://www.sklwaste.com.my/sitemap.xml`.

---

## 3. Google Analytics 4 (GA4) & Google Tag Manager (GTM)

### Conditional Script Architecture (`src/layouts/BaseLayout.astro`)
`BaseLayout.astro` prevents duplicate tag loading by prioritizing GTM when `PUBLIC_GTM_ID` is provided, and falling back to direct `gtag.js` loading when `PUBLIC_GA4_MEASUREMENT_ID` and/or `PUBLIC_GOOGLE_ADS_ID` are configured without GTM:

| Configured Environment Variable(s) | Rendered `<head>` & `<body>` Output |
| :--- | :--- |
| **None (Default Repo State)** | Zero external analytics scripts injected. Zero network calls to `googletagmanager.com`. |
| **`PUBLIC_GTM_ID` set (`GTM-XXXXXXX`)** | Injects the GTM container `<script>` in `<head>` and `<noscript><iframe>` immediately after `<body>`. All conversion events push to `window.dataLayer`. |
| **`PUBLIC_GA4_MEASUREMENT_ID` set (`G-XXXXXXXXXX`) (without GTM)** | Loads `https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`, initializes `window.dataLayer` and `window.gtag`, and calls `gtag('config', ga4Id)`. |
| **`PUBLIC_GOOGLE_ADS_ID` set (`AW-XXXXXXXXX`) (with or without GA4, without GTM)** | Loads `gtag.js` (using `ga4Id || googleAdsId`) and calls `gtag('config', googleAdsId)` alongside `gtag('config', ga4Id)` if present. |

---

## 4. Google Ads Conversion Readiness & Landing Page Alignment

### A. Automated Lead Conversion Firing (`src/utils/analytics.ts`)
When a customer submits a valid quotation or contact form (`canonicalEvent === 'generate_lead'`) and both `PUBLIC_GOOGLE_ADS_ID` and `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` are configured, `src/utils/analytics.ts` automatically fires the Google Ads conversion snippet:

```typescript
if (
  canonicalEvent === 'generate_lead' &&
  analyticsConfig.googleAdsId &&
  analyticsConfig.googleAdsConversionLabel &&
  typeof window.gtag === 'function'
) {
  window.gtag('event', 'conversion', {
    send_to: `${analyticsConfig.googleAdsId}/${analyticsConfig.googleAdsConversionLabel}`,
    value: 1.0,
    currency: 'MYR'
  });
}
```

### B. Localhost `test_mode` Separation
To ensure local testing (`npm run dev` / `npm run preview`) never pollutes production GA4 or Google Ads conversion metrics, both `src/utils/analytics.ts` and `src/layouts/BaseLayout.astro` check `window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'` and automatically append `test_mode: true` to the event payload.

### C. High-Intent Landing Page Alignment
For paid search campaigns (`Sewa Tong Roro Selangor`, `Sewa Tong Roro Sungai Buloh`, `Harga Tong Roro 2 Feet 4 Feet`), two primary landing pages are optimized for Quality Score and conversion rate:
1. **Homepage (`https://www.sklwaste.com.my`)**: Broad commercial & regional ad groups. Features immediate hero CTA (`Dapatkan Sebut Harga` -> `/#quotation-form`), direct phone dispatch (`Hubungi Mr Hari` -> `tel:+60166159365`), product sizing cards, and embedded quotation form.
2. **Product Catalog (`https://www.sklwaste.com.my/tong-roro-rental`)**: Size-specific & price-intent ad groups (`Tong Roro 2 Feet` = `RM2XX` for `10 days`, `Tong Roro 4 Feet` = `RM3XX–RM4XX` for `10 days`, provisional estimates). Features side-by-side comparison table, waste suitability guide (`#panduan-memilih-saiz`), and pre-selectable quotation form.

---

## 5. Google Business Profile (GBP) Consistency & UTM Guide

### Exact NAP Alignment
Every field in the company's Google Business Profile must match the website and `LocalBusiness` JSON-LD (`src/utils/schema.ts`) verbatim:

| GBP Field | Verified Value |
| :--- | :--- |
| **Business Name** | `SKL WASTE SDN BHD` |
| **SSM Registration Number** | `200801038953` |
| **Address** | `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.` |
| **Primary Phone** | `+60 16-615 9365` (Contact Person: `Mr Hari`) |
| **Email** | `tongroroservissklwaste@gmail.com` |
| **Primary Category** | `Waste management service` |
| **Secondary Categories** | `Dumpster rental service`, `Debris removal service`, `Garbage collection service` |
| **Service Areas** | 13 Selangor areas in `src/data/serviceAreas.ts` are currently `Pending Verification` (`isConfirmed: false`). Only add confirmed areas to GBP once verified by Mr Hari. |
| **WhatsApp Chat / Messaging** | **Do NOT enable on GBP** while `contactData.whatsapp.isConfirmed` is `false`. |

### Recommended GBP Website Links with UTM Parameters
To segment organic Google Maps / Business Profile traffic inside GA4 without affecting canonical URLs (`rel="canonical"` strips query strings automatically):
- **Primary Website Field**:
  `https://www.sklwaste.com.my/?utm_source=google&utm_medium=organic&utm_campaign=gbp_listing`
- **Products / Booking Link**:
  `https://www.sklwaste.com.my/tong-roro-rental?utm_source=google&utm_medium=organic&utm_campaign=gbp_products#quotation-form`
