# SKL Waste Sdn Bhd — Production Deployment & Owner Handover Guide

> **Entity:** SKL WASTE SDN BHD (SSM Registration No: `200801038953`)  
> **Headquarters:** `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`  
> **Primary Contact:** `Mr Hari` | `+60 16-615 9365` (`tel:+60166159365`) | `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)  
> **Production Domain:** `https://www.sklwaste.com.my`  
> **Framework:** `astro@^5.1.0` (`output: 'static'`, `trailingSlash: 'never'`) + `typescript@^5.7.0`

---

## 1. Build & Static Output Specification

The website compiles into a 100% self-contained static bundle inside `dist/` that can be deployed to any static CDN host (Cloudflare Pages, Netlify, Vercel) or standard web server (Nginx, Apache, cPanel).

### Build Commands (`package.json`)
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript type verification (must exit 0)
npx tsc --noEmit

# 3. Build production static site into dist/
npm run build

# 4. Preview production build locally
npm run preview
```

### Generated `dist/` Artifact Manifest
Running `npm run build` outputs the following production files in `dist/`:
- **9 HTML Pages**:
  - `dist/index.html` (`/`)
  - `dist/about-us/index.html` (`/about-us`)
  - `dist/tong-roro-rental/index.html` (`/tong-roro-rental`)
  - `dist/waste-management-services/index.html` (`/waste-management-services`)
  - `dist/industries-we-serve/index.html` (`/industries-we-serve`)
  - `dist/service-areas/index.html` (`/service-areas`)
  - `dist/contact-us/index.html` (`/contact-us`)
  - `dist/privacy-policy/index.html` (`/privacy-policy`)
  - `dist/404.html` (`/404` — `noindex, follow`)
- **SEO, Crawler & Security Files**:
  - `dist/sitemap.xml` (8 canonical indexable URLs)
  - `dist/robots.txt`
  - `dist/llms.txt`
  - `dist/_headers`
  - `dist/favicon.svg`
- **Optimized Brand & Fleet Images (`dist/images/`)**:
  - `skl-logo.png`, `skl-logo.webp`, `logo-skl-waste-sdn-bhd.webp`
  - `skl-hero-roro.jpg`, `skl-hero-roro.webp`, `sewa-tong-roro-sungai-buloh-skl-waste.webp`

---

## 2. Environment Variables Specification (`.env.example`)

All environment variables are optional at build time and default safely to `''` (or `https://www.sklwaste.com.my` for `PUBLIC_SITE_URL`). Configure these in your hosting dashboard (Cloudflare Pages / Netlify / Vercel > Settings > Environment Variables) or in a local `.env` file before running `npm run build`:

| Environment Variable | Default in Code | Purpose & Owner Source |
| :--- | :--- | :--- |
| `PUBLIC_SITE_URL` | `https://www.sklwaste.com.my` | Canonical production URL used across metadata and `sitemap.xml`. |
| `PUBLIC_GSC_VERIFICATION` | `''` | Google Search Console HTML meta tag verification token (`<meta name="google-site-verification" ...>`). |
| `PUBLIC_GA4_MEASUREMENT_ID` | `''` | Google Analytics 4 Measurement ID (`G-XXXXXXXXXX`). |
| `PUBLIC_GTM_ID` | `''` | Google Tag Manager Container ID (`GTM-XXXXXXX`). Takes precedence over direct GA4 script loading when set. |
| `PUBLIC_GOOGLE_ADS_ID` | `''` | Google Ads Conversion Tracking ID (`AW-XXXXXXXXXX`). |
| `PUBLIC_GOOGLE_ADS_CONVERSION_LABEL` | `''` | Google Ads Conversion Action Label fired on `generate_lead`. |
| `PUBLIC_QUOTATION_WEBHOOK_URL` | `''` | Optional HTTPS webhook endpoint for automated quotation form POSTs (`src/data/formsConfig.ts`). |
| `PUBLIC_CONTACT_WEBHOOK_URL` | `''` | Optional HTTPS webhook endpoint for automated contact form POSTs (`src/data/formsConfig.ts`). |

---

## 3. Production Security & Caching Rules (`public/_headers`)

`public/_headers` is copied automatically into `dist/_headers` during `npm run build` and applies the following HTTP headers on Cloudflare Pages / Netlify:

```text
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/images/*
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400
```

*(If deploying to Nginx or Apache instead of Cloudflare Pages/Netlify, mirror these security headers and `Cache-Control` directives in your server block or `.htaccess`).*

---

## 4. DNS & SSL Cutover Steps for `www.sklwaste.com.my`

1. **Connect Repository to Static Host**:
   - In Cloudflare Pages, Netlify, or Vercel, import the repository.
   - Set **Build command**: `npm run build`
   - Set **Build output directory**: `dist`
   - Set **Node.js version**: `20` or `22+`.
2. **Add Custom Domain**:
   - Add both `www.sklwaste.com.my` (Primary Canonical Domain) and `sklwaste.com.my` (Apex Redirect to `https://www.sklwaste.com.my`).
3. **Update DNS Records at Registrar (MYNIC / Cloudflare / Exabytes)**:
   - Point `www` (`CNAME`) to the hosting provider's target hostname.
   - Point apex `@` (`A` / `ALIAS` / `CNAME` flattening) to the hosting provider's IP/target.
4. **Verify HTTPS / SSL**:
   - Confirm automatic Let's Encrypt / Cloudflare Universal SSL certificate issuance.
   - Enable **Always Use HTTPS** and verify that `http://sklwaste.com.my` and `https://sklwaste.com.my` 301-redirect cleanly to `https://www.sklwaste.com.my`.

---

## 5. Owner Data Maintenance Guide (Updating Prices, Service Areas & WhatsApp)

All business data is centralized in strongly-typed TypeScript files inside `src/data/` so the owner or developer never has to hunt through multiple HTML templates.

### A. Updating Provisional Pricing (`src/data/products.ts`)
Currently, `Tong Roro 2 Feet` displays `RM2XX` (`10 days`) and `Tong Roro 4 Feet` displays `RM3XX–RM4XX` (`10 days`), with `isPriceProvisional: true` and `deliveryChargesConfirmed: false`.
To publish confirmed prices once approved by Mr Hari:
1. Open `src/data/products.ts`.
2. Update `priceDisplay` (e.g., from `'RM2XX'` and `'RM3XX–RM4XX'` to the confirmed RM figures), keep `rentalDuration: '10 days'` (never 7 days), and update `isPriceProvisional: false` and `deliveryChargesConfirmed: true` (if delivery/collection terms are finalized).
3. Update `provisionalDisclaimer`, `deliveryCollectionDisclaimer`, and `pricingDisclaimers` in `src/data/products.ts` to reflect the confirmed terms.
4. Run `npm run build` and redeploy.

### B. Confirming Service Areas (`src/data/serviceAreas.ts`)
Currently, all 13 Selangor service areas (`Desa Coalfields`, `Bandar Seri Coalfields`, `Sungai Buloh`, `Paya Jaras`, `Bukit Jelutong`, `Bukit Beruntung`, `Kundang`, `Puncak Alam`, `Aman Putri`, `Tasik Puteri`, `Saujana Utama`, `Subang`, `Rawang`) are marked `isConfirmed: false` and `statusLabel: 'Pending Verification'`.
To mark verified areas as confirmed:
1. Open `src/data/serviceAreas.ts`.
2. For each township verified by Mr Hari, update:
   ```typescript
   isConfirmed: true,
   statusLabel: 'Confirmed Coverage',
   notes: 'Confirmed Tong Roro delivery and collection coverage.'
   ```
3. Run `npm run build` and redeploy.

### C. Activating WhatsApp Links (`src/data/contact.ts`)
Currently, `contactData.whatsapp.isConfirmed` is `false`, ensuring zero active `https://wa.me/60166159365` links appear on the website.
Once Mr Hari confirms that `+60 16-615 9365` is active on WhatsApp for customer enquiries:
1. Open `src/data/contact.ts`.
2. Change `isConfirmed: false` to `isConfirmed: true`:
   ```typescript
   whatsapp: {
     url: 'https://wa.me/60166159365',
     rawNumber: '60166159365',
     isConfirmed: true,
     verificationNote: 'Confirmed WhatsApp dispatch line for Mr Hari.'
   }
   ```
3. Run `npm run build` and redeploy. This single boolean toggle automatically activates the WhatsApp contact buttons and the pre-filled WhatsApp enquiry action (`#quotation-whatsapp-link` powered by `buildWhatsAppEnquiryUrl`) in `QuotationForm.astro`.
