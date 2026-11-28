import type { APIRoute } from 'astro';
import { pageSEOMap, getCanonicalUrl, SITE_URL } from '../data/seo';

const industrySectorImages = [
  { file: 'resorts-hotels.jpg', title: 'Resorts & Hotels RORO Bin Supply - SKL Waste Sdn Bhd' },
  { file: 'kilang-gudang.jpg', title: 'Kilang & Gudang (Factories & Warehouses) Tong Roro - SKL Waste Sdn Bhd' },
  { file: 'kolej-universiti.jpg', title: 'Kolej & Universiti Waste Management - SKL Waste Sdn Bhd' },
  { file: 'pusat-beli-belah.jpg', title: 'Pusat Beli Belah (Shopping Centres) Tong Roro - SKL Waste Sdn Bhd' },
  { file: 'theme-park.jpg', title: 'Theme Park Waste Collection & RORO Bin - SKL Waste Sdn Bhd' },
  { file: 'building-construction.jpg', title: 'Building Construction Tong Roro Rental - SKL Waste Sdn Bhd' },
  { file: 'house-construction.jpg', title: 'House Construction & Renovation RORO Bin - SKL Waste Sdn Bhd' },
  { file: 'hospital.jpg', title: 'Hospital General Waste Container Supply - SKL Waste Sdn Bhd' },
  { file: 'office.jpg', title: 'Office & Commercial Building RORO Bin - SKL Waste Sdn Bhd' },
  { file: 'food-beverage.jpg', title: 'Food & Beverage Industries Waste Disposal - SKL Waste Sdn Bhd' },
  { file: 'condominium-apartment.jpg', title: 'Condominium & Apartment Bulk Waste Tong Roro - SKL Waste Sdn Bhd' },
  { file: 'renovation-remodelling.jpg', title: 'Ubah Suai & Renovasi (Renovation & Remodelling) Tong Roro - SKL Waste Sdn Bhd' }
];

const ourWorkPhotos = [
  { file: 'work-1.jpg', title: 'Sisa Pembinaan & Kayu Besi di Tapak - SKL Waste Sdn Bhd' },
  { file: 'work-2.jpg', title: 'Penghantaran Tong Roro Kediaman - SKL Waste Sdn Bhd' },
  { file: 'work-3.jpg', title: 'Pembersihan Batu Bata & Konkrit - SKL Waste Sdn Bhd' },
  { file: 'work-4.jpg', title: 'Sisa Pengubahsuaian Penuh Berbatu - SKL Waste Sdn Bhd' },
  { file: 'work-5.jpg', title: 'Tong Roro Baharu Sedia Dihantar - SKL Waste Sdn Bhd' }
];

export const GET: APIRoute = async () => {
  const buildDate = new Date().toISOString();

  const indexablePages = Object.values(pageSEOMap).filter((page) => !page.noindex);

  const xmlUrls = indexablePages
    .map((page) => {
      const canonical = getCanonicalUrl(page.path);
      const priority =
        page.path === '/'
          ? '1.0'
          : page.path === '/tong-roro-rental' || page.path === '/waste-management-services'
          ? '0.9'
          : '0.8';
      const changefreq = page.path === '/' || page.path === '/tong-roro-rental' ? 'daily' : 'weekly';

      const extraSectorImagesXml =
        page.path === '/' || page.path === '/industries-we-serve'
          ? '\n' +
            industrySectorImages
              .map(
                (img) => `    <image:image>
      <image:loc>${SITE_URL}/images/industries/${img.file}</image:loc>
      <image:title>${img.title.replace(/&/g, '&amp;')}</image:title>
      <image:geo_location>Sungai Buloh, Selangor, Malaysia</image:geo_location>
    </image:image>`
              )
              .join('\n') +
            (page.path === '/'
              ? '\n' +
                ourWorkPhotos
                  .map(
                    (photo) => `    <image:image>
      <image:loc>${SITE_URL}/images/our-work/${photo.file}</image:loc>
      <image:title>${photo.title.replace(/&/g, '&amp;')}</image:title>
      <image:geo_location>Selangor &amp; Kuala Lumpur, Malaysia</image:geo_location>
    </image:image>`
                  )
                  .join('\n')
              : '')
          : '';

      return `  <url>
    <loc>${canonical}</loc>
    <lastmod>${buildDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="ms" href="${canonical}" />
    <xhtml:link rel="alternate" hreflang="ms-MY" href="${canonical}" />
    <xhtml:link rel="alternate" hreflang="en" href="${canonical}" />
    <xhtml:link rel="alternate" hreflang="en-MY" href="${canonical}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${canonical}" />
    <image:image>
      <image:loc>${SITE_URL}/images/sewa-tong-roro-sungai-buloh-skl-waste.webp</image:loc>
      <image:title>Sewa Tong Roro Sungai Buloh &amp; Selangor - SKL Waste Sdn Bhd</image:title>
      <image:caption>Lori Roro dan kontena Tong Roro 2 Kaki dan 4 Kaki SKL Waste Sdn Bhd (200801038953) di Sungai Buloh, Selangor</image:caption>
      <image:geo_location>Sungai Buloh, Selangor, Malaysia</image:geo_location>
    </image:image>
    <image:image>
      <image:loc>${SITE_URL}/images/logo-skl-waste-sdn-bhd.webp</image:loc>
      <image:title>Logo Rasmi SKL Waste Sdn Bhd</image:title>
      <image:caption>SKL Waste Sdn Bhd (200801038953) - Syarikat Sewaan Tong Roro dan Pengurusan Sisa Selangor</image:caption>
      <image:geo_location>Sungai Buloh, Selangor, Malaysia</image:geo_location>
    </image:image>${extraSectorImagesXml}
  </url>`;
    })
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${xmlUrls}
</urlset>`;

  return new Response(sitemapXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'X-Robots-Tag': 'all',
    },
  });
};
