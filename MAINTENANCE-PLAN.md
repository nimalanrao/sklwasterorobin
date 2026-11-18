# SKL Waste Sdn Bhd — Operational Maintenance & Governance Plan

> **Entity:** SKL WASTE SDN BHD (SSM Registration No: `200801038953`)  
> **Headquarters:** `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`  
> **Primary Contact:** `Mr Hari` | `+60 16-615 9365` (`tel:+60166159365`) | `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)  
> **Production Domain:** `https://www.sklwaste.com.my`  
> **Architecture:** Static Astro (`astro@^5.1.0`, `output: 'static'`, `trailingSlash: 'never'`)

---

## 1. Operational Maintenance Cadence

Because the website is statically compiled (`output: 'static'`) with zero server-side database dependencies, runtime maintenance overhead and attack surface are minimal. The following structured schedule keeps lead generation, search visibility, and dependencies healthy:

| Frequency | Task Category | Actionable Checklist | Verification Target |
| :--- | :--- | :--- | :--- |
| **Weekly** | **Lead & Dispatch Verification** | 1. Submit a test quotation on `/#quotation-form` and verify `#quotation-result-panel` renders the summary, `mailto:tongroroservissklwaste@gmail.com`, clipboard copy, and `tel:+60166159365` cleanly.<br/>2. If `PUBLIC_QUOTATION_WEBHOOK_URL` or `PUBLIC_CONTACT_WEBHOOK_URL` is configured, verify HTTP 200 delivery to the inbox/CRM.<br/>3. Check `tongroroservissklwaste@gmail.com` spam/quarantine filters so customer enquiries are never missed. | 100% enquiry reachability to Mr Hari |
| **Monthly** | **Technical, Security & Search Review** | 1. Run `npm audit` in the repository root and apply non-breaking security patches (`npm audit fix`), then verify `npx tsc --noEmit` and `npm run build` exit `0`.<br/>2. Review **Google Search Console (GSC)** Coverage & Page Indexing report for all 8 indexable pages (`https://www.sklwaste.com.my/sitemap.xml`) and confirm 0 crawl errors.<br/>3. Review **GA4** conversion events (`phone_click`, `email_click`, `generate_lead`, `select_tong_roro`, `quote_form_start`, `contact_cta_click`).<br/>4. Review **Google Business Profile (GBP)** enquiries, photos, and operating hours consistency. | 0 high/critical npm vulnerabilities; 8/8 pages indexed cleanly in GSC |
| **Quarterly** | **Business Data & Compliance Audit** | 1. Review `src/data/products.ts` with Mr Hari: confirm whether provisional rates (`Tong Roro 2 Feet` = `RM2XX`, `Tong Roro 4 Feet` = `RM3XX–RM4XX`, `10 days` rental duration, unconfirmed delivery/collection charges) should be updated.<br/>2. Review `src/data/serviceAreas.ts`: check whether any of the 13 `Pending Verification` Selangor locations have been operationally confirmed (`isConfirmed: true`).<br/>3. Review `src/data/contact.ts`: verify whether WhatsApp on `+60 16-615 9365` (`whatsapp.isConfirmed`) is ready for activation.<br/>4. Verify SSL/TLS certificate auto-renewal and domain registration expiry for `sklwaste.com.my`. | 100% alignment between live operations and published data |

---

## 2. Pre-Deployment Quality Gate

Before pushing any content or code update to production, always run the 3-step verification gate locally:

```bash
# 1. Verify TypeScript strict types
npx tsc --noEmit

# 2. Build static production output
npm run build

# 3. Verify prohibited patterns are absent (PowerShell)
Select-String -Path "src\**\*","dist\**\*" -Pattern "7-day|7 days"
```

Ensure:
- `npx tsc --noEmit` exits `0`.
- `npm run build` exits `0` and generates all 9 HTML pages + `dist/sitemap.xml`, `dist/robots.txt`, `dist/llms.txt`, and `dist/_headers`.
- Zero occurrences of prohibited `7-day` or `7 days` rental terms exist (standard rental duration is strictly `10 days`).
- While `contactData.whatsapp.isConfirmed` is `false`, zero active `href="https://wa.me/60166159365"` anchors exist in `dist/`.

---

## 3. Git Backup & Instant Rollback Procedure

### A. Repository Backup Standard
- Keep the `main` branch protected as the single source of truth deployed to `https://www.sklwaste.com.my`.
- Tag every production release (e.g., `git tag -a v1.0.0-phase5 -m "Phase 5 production launch"`).

### B. Instant Rollback Steps
If a content or configuration change introduces an unexpected issue in production:

1. **Via Static Hosting Dashboard (Fastest — < 30 seconds)**:
   - In Cloudflare Pages, Netlify, or Vercel, open **Deployments**, locate the previous known-good deployment, and click **Rollback to this deploy** / **Publish deploy**.
2. **Via Git CLI**:
   ```bash
   # View recent commits
   git log --oneline -n 5

   # Revert the problematic commit cleanly
   git revert <commit-hash>

   # Verify clean build locally
   npx tsc --noEmit && npm run build

   # Push to trigger clean production rebuild
   git push origin main
   ```

---

## 4. Security Headers & Static Hardening Overview (`public/_headers`)

The static site enforces defense-in-depth browser security headers via `public/_headers` (`dist/_headers`):
- **`X-Content-Type-Options: nosniff`**: Prevents MIME-type sniffing attacks.
- **`X-Frame-Options: DENY`**: Prevents clickjacking by blocking unauthorized `<iframe>` embedding.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Preserves origin attribution while protecting full URL paths across cross-origin downgrades.
- **`Permissions-Policy: camera=(), microphone=(), geolocation=()`**: Disables unnecessary browser hardware APIs.
- **Immutable Asset Caching**: `/_astro/*` is cached for 1 year (`max-age=31536000, immutable`) and `/images/*` is cached for 30 days (`max-age=2592000, stale-while-revalidate=86400`).

---

## 5. Owner Escalation & Operational Contacts

For all operational confirmations (final quotations, bin sizing, delivery/collection surcharges, Selangor service area verification, or WhatsApp activation):

- **Company Name**: `SKL WASTE SDN BHD` (SSM Registration No: `200801038953`)
- **Headquarters Address**: `PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.`
- **Main Contact Person**: `Mr Hari`
- **Direct Telephone**: `+60 16-615 9365` (`tel:+60166159365`)
- **Official Email**: `tongroroservissklwaste@gmail.com` (`mailto:tongroroservissklwaste@gmail.com`)
- **WhatsApp Status**: Pending confirmation (`whatsapp.isConfirmed = false` in `src/data/contact.ts`).
