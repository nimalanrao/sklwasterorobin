import { companyData } from '../data/company';
import { contactData } from '../data/contact';
import { productsData } from '../data/products';
import { secondaryServices } from '../data/services';
import { SITE_URL, type BreadcrumbItem, getPageSEO, getCanonicalUrl } from '../data/seo';

/**
 * Builds the Schema.org Organization / LocalBusiness graph node.
 * Strictly grounded in verified SKL Waste Sdn Bhd facts.
 * Omits unverified geo coordinates, ratings, hours, and unconfirmed service areas.
 */
export function buildOrganizationSchema() {
  return {
    '@type': ['Organization', 'LocalBusiness'],
    '@id': `${SITE_URL}/#organization`,
    name: companyData.name,
    legalName: companyData.name,
    identifier: {
      '@type': 'PropertyValue',
      propertyID: 'SSM Registration Number',
      value: companyData.registrationNumber,
    },
    url: SITE_URL,
    logo: `${SITE_URL}/images/skl-logo.png`,
    image: `${SITE_URL}/images/og-embed-skl-waste.jpg`,
    telephone: '+60166159365',
    email: contactData.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: companyData.headquarters.line1,
      addressLocality: companyData.headquarters.city,
      postalCode: companyData.headquarters.postcode,
      addressRegion: companyData.headquarters.state,
      addressCountry: 'MY',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      name: contactData.mainContactPerson,
      telephone: '+60166159365',
      email: contactData.email,
      availableLanguage: ['ms', 'en'],
    },
  };
}

/**
 * Builds the Schema.org WebSite graph node.
 */
export function buildWebSiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: companyData.name,
    publisher: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ['ms-MY', 'en-MY'],
  };
}

/**
 * Builds the Schema.org Service graph node for Sewaan Tong Roro (2 Feet & 4 Feet).
 * Linked to #organization with factual descriptions and 10 days rental duration.
 * Contains no invented numeric Offer prices.
 */
export function buildServiceSchema() {
  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/#service-tong-roro`,
    name: 'Sewaan Tong Roro (2 Feet & 4 Feet)',
    serviceType: 'Waste Container Rental & Disposal',
    provider: {
      '@id': `${SITE_URL}/#organization`,
    },
    description:
      'Perkhidmatan sewaan Tong Roro 2 Kaki dan 4 Kaki untuk tempoh sewaan standard 10 hari bagi pengurusan sisa kediaman, tapak pembinaan, pengubahsuaian, dan industri di Selangor. Kadar sewa adalah anggaran sementara (RM2XX / RM3XX–RM4XX) dan sebut harga akhir disahkan terus dengan Mr Hari (+60 16-615 9365).',
    termsOfService:
      'Tempoh sewaan standard 10 hari. Caj penghantaran dan pelupusan tertakluk kepada pengesahan lokasi.',
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Katalog Sewaan Tong Roro & Perkhidmatan Sisa',
      itemListElement: [
        ...productsData.map((prod) => ({
          '@type': 'OfferCatalog',
          name: prod.name,
          description: `${prod.summary} Tempoh sewaan standard ${prod.rentalDuration}. ${prod.provisionalDisclaimer}`,
        })),
        ...secondaryServices.map((svc) => ({
          '@type': 'OfferCatalog',
          name: svc.name,
          description: svc.description,
        })),
      ],
    },
  };
}

/**
 * Builds the Schema.org BreadcrumbList graph node for navigation hierarchy.
 */
export function buildBreadcrumbSchema(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href.startsWith('http') ? crumb.href : getCanonicalUrl(crumb.href),
    })),
  };
}

/**
 * Builds the complete Schema.org JSON-LD graph for a page.
 * Returns an object with @context and @graph containing:
 * - WebPage
 * - Organization / LocalBusiness
 * - WebSite
 * - Service (for '/', '/tong-roro-rental', and '/waste-management-services')
 * - BreadcrumbList (when breadcrumbs > 1)
 *
 * Explicitly does NOT emit FAQPage schema.
 */
export function buildPageSchemaGraph(
  currentPath: string,
  pageTitle: string,
  pageDescription: string,
  breadcrumbs?: BreadcrumbItem[]
) {
  const normalizedPath = currentPath === '' ? '/' : currentPath.replace(/\/+$/, '') || '/';
  const pageUrl = getCanonicalUrl(normalizedPath);
  const crumbs = breadcrumbs ?? getPageSEO(normalizedPath).breadcrumbs ?? [];

  const webPageSchema = {
    '@type': 'WebPage',
    '@id': `${pageUrl}#webpage`,
    url: pageUrl,
    name: pageTitle,
    description: pageDescription,
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: {
      '@id': `${SITE_URL}/#organization`,
    },
    inLanguage: ['ms-MY', 'en-MY'],
  };

  const graph: Record<string, unknown>[] = [
    buildOrganizationSchema(),
    buildWebSiteSchema(),
    webPageSchema,
  ];

  // Include Service schema on '/', '/tong-roro-rental', and '/waste-management-services'
  if (
    normalizedPath === '/' ||
    normalizedPath === '/tong-roro-rental' ||
    normalizedPath === '/waste-management-services'
  ) {
    graph.push(buildServiceSchema());
  }

  // Include BreadcrumbList schema when breadcrumbs > 1
  if (crumbs && crumbs.length > 1) {
    graph.push(buildBreadcrumbSchema(crumbs));
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph,
  };
}
