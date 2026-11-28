export const SITE_URL = 'https://www.tongrorosklwaste.my';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface PageSEOConfig {
  path: string;
  title: string;
  description: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: 'Transactional' | 'Commercial' | 'Informational' | 'Navigational' | 'Legal' | 'System';
  ogImage: string;
  ogImageAlt: string;
  noindex?: boolean;
  breadcrumbs: BreadcrumbItem[];
  conversionObjective: string;
}

export interface AnalyticsConfig {
  googleSiteVerification: string;
  gscVerificationToken?: string;
  ga4MeasurementId: string;
  gtmId: string;
  googleAdsId: string;
  googleAdsConversionLabel: string;
}

export const analyticsConfig: AnalyticsConfig = {
  googleSiteVerification: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
  gscVerificationToken: import.meta.env.PUBLIC_GSC_VERIFICATION ?? '',
  ga4MeasurementId: import.meta.env.PUBLIC_GA4_MEASUREMENT_ID ?? '',
  gtmId: import.meta.env.PUBLIC_GTM_ID || 'GTM-WH7RDN24',
  googleAdsId: import.meta.env.PUBLIC_GOOGLE_ADS_ID ?? '',
  googleAdsConversionLabel: import.meta.env.PUBLIC_GOOGLE_ADS_CONVERSION_LABEL ?? ''
};

export const pageSEOMap: Record<string, PageSEOConfig> = {
  '/': {
    path: '/',
    title: 'Sewa Tong RoRo Selangor & KL | SKL Waste Sdn Bhd',
    description: 'Sewa Tong Roro 2 Kaki & 4 Kaki di Selangor, Kuala Lumpur & Sungai Buloh dengan SKL Waste Sdn Bhd. Tempoh 10 hari bermula RM2XX. Hubungi Mr Hari +60 16-615 9365.',
    h1: 'SEWA TONG RoRo Selangor/KL!',
    primaryKeyword: 'Sewa Tong Roro Selangor & KL',
    secondaryKeywords: ['Sewa Tong Roro Sungai Buloh', 'Tong Roro Kuala Lumpur', 'Harga Sewa Tong Roro', 'Tong Roro 2 Feet 4 Feet', 'SKL Waste Sdn Bhd'],
    searchIntent: 'Commercial',
    ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
    ogImageAlt: 'SKL Waste Sdn Bhd lori Tong Roro dan kontena sisa di tapak projek',
    breadcrumbs: [{ label: 'Utama', href: '/' }],
    conversionObjective: 'Penghantaran borang sebut harga atau panggilan terus ke Mr Hari'
  },
  '/tong-roro-rental': {
    path: '/tong-roro-rental',
    title: 'Harga Sewa Tong Roro 2 Feet & 4 Feet | SKL Waste',
    description: 'Panduan saiz & kadar sewa Tong Roro 2 Feet (RM2XX) dan 4 Feet (RM3XX–RM4XX) untuk tempoh 10 hari di Selangor. Minta sebut harga rasmi dari Mr Hari hari ini.',
    h1: 'Katalog & Kadar Sewaan Tong Roro',
    primaryKeyword: 'Harga Sewa Tong Roro 2 Feet & 4 Feet',
    secondaryKeywords: [
      'Tong Roro 2 Feet',
      'Tong Roro 4 Feet',
      'Tempoh Sewa Tong Roro 10 Hari',
      'Cara Memilih Saiz Tong Roro'
    ],
    searchIntent: 'Transactional',
    ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
    ogImageAlt: 'Spesifikasi saiz Tong Roro 2 kaki dan 4 kaki SKL Waste',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Tong Roro Rental', href: '/tong-roro-rental' }
    ],
    conversionObjective: 'Pemilihan saiz produk dan permohonan sebut harga Tong Roro'
  },
  '/waste-management-services': {
    path: '/waste-management-services',
    title: 'Perkhidmatan Pengurusan & Pelupusan Sisa | SKL Waste',
    description: 'Perkhidmatan kutipan, pengangkutan dan pelupusan sisa pembinaan, perindustrian, pengubahsuaian serta sampah pukal di Selangor oleh SKL Waste Sdn Bhd.',
    h1: 'Perkhidmatan Pengurusan Sisa',
    primaryKeyword: 'Perkhidmatan Pengurusan & Pelupusan Sisa',
    secondaryKeywords: [
      'Kutipan Sampah',
      'Sisa Pembinaan',
      'Sisa Pengubahsuaian',
      'Sisa Perindustrian',
      'Sampah Pukal',
      'Pembersihan Tapak'
    ],
    searchIntent: 'Informational',
    ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
    ogImageAlt: 'Perkhidmatan pengurusan sisa pepejal dan pelupusan berjadual SKL Waste',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Perkhidmatan Pengurusan Sisa', href: '/waste-management-services' }
    ],
    conversionObjective: 'Permohonan sebut harga perkhidmatan pengurusan dan pelupusan sisa'
  },
  '/industries-we-serve': {
    path: '/industries-we-serve',
    title: 'Pengurusan Sisa Komersial, Pembinaan & Industri | SKL Waste',
    description: 'Penyelesaian Tong Roro untuk tapak pembinaan, perumahan, kilang, hotel, restoran dan komersial di Selangor. Dapatkan rundingan sebut harga bersama Mr Hari.',
    h1: 'Industri Yang Kami Layan',
    primaryKeyword: 'Pengurusan Sisa Komersial, Pembinaan & Industri',
    secondaryKeywords: [
      'Tong Roro Tapak Pembinaan',
      'Tong Roro Renovasi Rumah',
      'Pengurusan Sisa Kilang & Hotel'
    ],
    searchIntent: 'Commercial',
    ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
    ogImageAlt: 'Sektor industri dan komersial yang dilayan oleh SKL Waste Sdn Bhd',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Industri', href: '/industries-we-serve' }
    ],
    conversionObjective: 'Penghantaran borang pertanyaan mengikut sektor industri'
  },
  '/service-areas': {
    path: '/service-areas',
    title: 'Kawasan Servis Tong Roro Sungai Buloh & Selangor | SKL',
    description: 'Kawasan liputan servis Tong Roro Sungai Buloh, Puncak Alam, Rawang, Kundang & Saujana Utama. Semua kawasan tertakluk pengesahan ketersediaan dengan Mr Hari.',
    h1: 'Kawasan Perkhidmatan',
    primaryKeyword: 'Kawasan Servis Tong Roro Sungai Buloh & Selangor',
    secondaryKeywords: [
      'Sewa Tong Roro Sungai Buloh',
      'Sewa Tong Roro Puncak Alam',
      'Sewa Tong Roro Rawang, Kundang, Saujana Utama'
    ],
    searchIntent: 'Navigational',
    ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
    ogImageAlt: 'Kawasan servis Tong Roro sekitar Sungai Buloh dan Selangor',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Kawasan Perkhidmatan', href: '/service-areas' }
    ],
    conversionObjective: 'Pengesahan ketersediaan kawasan penghantaran dengan Mr Hari'
  },
  '/about-us': {
    path: '/about-us',
    title: 'SKL Waste Sdn Bhd (200801038953) Sungai Buloh | Profil',
    description: 'Mengenai SKL Waste Sdn Bhd (200801038953). Syarikat berdaftar pengurusan sisa dan sewaan Tong Roro beribu pejabat di Sungai Buloh, Selangor Darul Ehsan.',
    h1: 'Mengenai SKL Waste Sdn Bhd',
    primaryKeyword: 'SKL Waste Sdn Bhd (200801038953) Sungai Buloh',
    secondaryKeywords: [
      'Syarikat Sewa Tong Roro Berdaftar Selangor',
      'Ibu Pejabat Sungai Buloh'
    ],
    searchIntent: 'Informational',
    ogImage: `${SITE_URL}/images/skl-logo.png`,
    ogImageAlt: 'Logo Korporat SKL Waste Sdn Bhd Sungai Buloh Selangor',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Mengenai Kami', href: '/about-us' }
    ],
    conversionObjective: 'Membina keyakinan korporat dan menghubungkan ke Mr Hari'
  },
  '/contact-us': {
    path: '/contact-us',
    title: 'Hubungi SKL Waste Sdn Bhd & Sebut Harga Mr Hari',
    description: 'Hubungi Mr Hari di +60 16-615 9365 atau emel tongroroservissklwaste@gmail.com untuk sebut harga segera Tong Roro dan perkhidmatan sisa di Sungai Buloh.',
    h1: 'Hubungi Kami & Dapatkan Sebut Harga',
    primaryKeyword: 'Hubungi SKL Waste Sdn Bhd & Sebut Harga Mr Hari',
    secondaryKeywords: [
      'Sebut Harga Tong Roro',
      'Telefon Mr Hari +60 16-615 9365'
    ],
    searchIntent: 'Transactional',
    ogImage: `${SITE_URL}/images/skl-logo.png`,
    ogImageAlt: 'Saluran perhubungan rasmi SKL Waste Sdn Bhd Sungai Buloh',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Hubungi Kami', href: '/contact-us' }
    ],
    conversionObjective: 'Panggilan telefon terus atau penghantaran borang pertanyaan'
  },
  '/privacy-policy': {
    path: '/privacy-policy',
    title: 'Dasar Privasi SKL Waste Sdn Bhd (PDPA 2010)',
    description: 'Dasar Privasi SKL Waste Sdn Bhd (200801038953). Ketahui pengendalian data peribadi pertanyaan sebut harga mengikut Akta Perlindungan Data Peribadi 2010.',
    h1: 'Dasar Privasi',
    primaryKeyword: 'Dasar Privasi SKL Waste Sdn Bhd (PDPA 2010)',
    secondaryKeywords: [
      'Akta Perlindungan Data Peribadi 2010',
      'PDPA SKL Waste'
    ],
    searchIntent: 'Legal',
    ogImage: `${SITE_URL}/images/skl-logo.png`,
    ogImageAlt: 'Notis Privasi SKL Waste Sdn Bhd',
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: 'Dasar Privasi', href: '/privacy-policy' }
    ],
    conversionObjective: 'Pematuhan ketelusan undang-undang data peribadi'
  },
  '/404': {
    path: '/404',
    title: '404 Halaman Tidak Dijumpai | SKL Waste Sdn Bhd',
    description: 'Halaman yang dicari tidak dijumpai. Sila kembali ke laman utama atau hubungi Mr Hari di +60 16-615 9365 untuk bantuan sewaan Tong Roro.',
    h1: '404 - Halaman Tidak Dijumpai',
    primaryKeyword: 'Halaman Tidak Dijumpai SKL Waste',
    secondaryKeywords: ['Ralat 404', 'Sewa Tong Roro'],
    searchIntent: 'System',
    ogImage: `${SITE_URL}/images/skl-logo.png`,
    ogImageAlt: 'Ralat 404 SKL Waste Sdn Bhd',
    noindex: true,
    breadcrumbs: [
      { label: 'Utama', href: '/' },
      { label: '404', href: '/404' }
    ],
    conversionObjective: 'Navigasi semula ke halaman utama atau hubungi Mr Hari'
  }
};

export function getCanonicalUrl(path: string): string {
  if (!path || path === '/') {
    return `${SITE_URL}/`;
  }
  const cleanPath = path.startsWith('/') ? path.replace(/\/+$/, '') : `/${path.replace(/\/+$/, '')}`;
  return `${SITE_URL}${cleanPath}`;
}

export function getPageSEO(path: string): PageSEOConfig {
  const normalizedPath = path === '' ? '/' : path.replace(/\/+$/, '') || '/';
  return (
    pageSEOMap[normalizedPath] ?? {
      path: normalizedPath,
      title: 'SKL Waste Sdn Bhd | Sewaan Tong Roro & Pengurusan Sisa',
      description:
        'SKL Waste Sdn Bhd menyediakan perkhidmatan sewaan Tong Roro 2ft dan 4ft serta pengurusan sisa di Selangor. Hubungi Mr Hari di +60 16-615 9365.',
      h1: 'SKL Waste Sdn Bhd',
      primaryKeyword: 'Sewa Tong Roro Selangor',
      secondaryKeywords: ['Servis Tong Roro', 'Sungai Buloh'],
      searchIntent: 'Commercial',
      ogImage: `${SITE_URL}/images/skl-hero-roro.jpg`,
      ogImageAlt: 'SKL Waste Sdn Bhd Tong Roro Lori dan Kontena',
      breadcrumbs: [{ label: 'Utama', href: '/' }],
      conversionObjective: 'Dapatkan Sebut Harga Tong Roro'
    }
  );
}
