# Project Asset Requirements & Guidelines (Phase 2)

This document specifies the required authentic assets for **SKL Waste Sdn Bhd** (`200801038953`) to replace placeholder visual elements in Phase 2 production rollout.

---

## 1. Required Asset Inventory

### A. Verified Company Logo
- **Required Formats**:
  - Primary Vector: `logo-skl-waste.svg` (crisp, scalable vector graphic)
  - Raster Fallback: High-resolution PNG with transparent background (`logo-skl-waste.png`, min. 1024x1024px)
  - Monochrome / White Variant: For dark footer or contrast banners (`logo-skl-waste-white.svg`)
  - Favicon & App Icons: Multi-resolution `.svg` and `.ico`
- **Verification Criteria**:
  - Must accurately reflect the registered trade name: **SKL Waste Sdn Bhd**
  - Legible text reproduction down to 32px height.

---

### B. Tong Roro Operational Photographs
Real, high-resolution on-site photographs of actual Tong Roro containers in service. **Stock images or unverified generic bins must not be used.**

1. **Tong Roro 2 Feet (Low Profile / Light Waste)**:
   - File targets:
     - `src/assets/images/roro-2ft-main.webp` (hero product perspective)
     - `src/assets/images/roro-2ft-side.webp` (profile view showing depth/height ratio)
     - `src/assets/images/roro-2ft-loaded.webp` (operational context: garden waste, domestic renovation, soil/concrete)
   - Specifications: Clear shot highlighting low sides (easy wheelbarrow access), clean paint condition, safety reflectors.

2. **Tong Roro 4 Feet (Deep Profile / Bulk Waste)**:
   - File targets:
     - `src/assets/images/roro-4ft-main.webp` (hero product perspective)
     - `src/assets/images/roro-4ft-side.webp` (profile view displaying side walls)
     - `src/assets/images/roro-4ft-industrial.webp` (operational context: construction debris, commercial refurbishment, factory clean-up)
   - Specifications: High-sided container showing reinforced ribbing, rear door latch mechanism, safe loading markings.

3. **Scale Comparison Shot**:
   - File target: `src/assets/images/roro-size-comparison.webp`
   - Showing 2ft and 4ft containers side-by-side to assist customers in size selection.

---

### C. Sungai Buloh Operational Facility & Fleet
Authentic photographs establishing local physical presence and fleet capabilities at the headquarters:
`PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN`.

1. **Depot & Setor Yard**:
   - File target: `src/assets/images/facility-yard-sungai-buloh.webp`
   - Content: Storage depot showing inventory of serviced containers and organized staging area.
2. **Transport Fleet & Roll-On/Roll-Off Trucks**:
   - File target: `src/assets/images/fleet-roro-truck-hoist.webp`
   - Content: Hydraulic hook-lift / cable hoist trucks loading or offloading containers safely.
   - Verification: Legible SPAD/APAD permits or company vehicle identification if available.

---

### D. Regulatory Permits & Compliance Badges
Documentation proving authorized waste disposal and transportation status:
1. **Local Authority / Municipal Council Permits**:
   - Majlis Perbandaran Selayang (MPS) or relevant Selangor local authority waste transport permit.
2. **Waste Management Accreditation**:
   - DOE (Jabatan Alam Sekitar / JAS) / SWCorp / JPSPN registration details (if applicable).
3. **Display Guidelines**:
   - Redacted/watermarked certificate previews stored as `src/assets/images/permits/license-watermarked.webp`.
   - Never expose unredacted personal identification or confidential financial details.

---

## 2. Directory Layout & Naming Conventions

All assets in Phase 2 should be organized following this directory tree:

```text
src/assets/
├── README.md                           # This specification document
├── brand/
│   ├── logo-skl-waste.svg             # Main official brand logo
│   ├── logo-skl-waste-white.svg       # Inverted/white logo for dark headers/footers
│   └── favicon.svg                    # Scalable vector browser tab icon
├── images/
│   ├── products/
│   │   ├── roro-2ft-main.webp         # 2 Feet primary showcase image
│   │   ├── roro-2ft-side.webp         # 2 Feet side profile
│   │   ├── roro-4ft-main.webp         # 4 Feet primary showcase image
│   │   ├── roro-4ft-side.webp         # 4 Feet side profile
│   │   └── roro-comparison.webp       # 2ft vs 4ft comparison
│   ├── facility/
│   │   ├── yard-sungai-buloh.webp     # Facility set up and container depot
│   │   └── fleet-truck-action.webp    # Roro truck transport operation
│   └── permits/
│       └── waste-permit-badge.webp    # Watermarked license/permit badge
```

---

## 3. Technical Standards & Optimization

1. **Modern Formats**:
   - Master photos should be provided in original raw/JPEG/PNG format, then converted to optimized `.webp` or `.avif`.
2. **Resolution & Aspect Ratios**:
   - Product cards: 4:3 or 16:9 aspect ratio, minimum 1200x900px master size.
   - Facility banners: 21:9 or 16:9, minimum 1920x1080px.
3. **Astro Integration**:
   - Consume assets via Astro's built-in `<Image />` component (`import { Image } from 'astro:assets';`) to automatically generate responsive `srcset`, prevent Cumulative Layout Shift (CLS), and enforce lazy-loading.
4. **Accessibility (WCAG AA)**:
   - All visual assets must have clear, informative `alt` text in both Bahasa Malaysia and English (e.g., `alt="Tong Roro 2 Kaki untuk sisa ubah suai rumah - SKL Waste Sungai Buloh"`).
