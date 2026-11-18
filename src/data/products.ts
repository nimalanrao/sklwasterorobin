export interface TongRoroProduct {
  id: string;
  slug: string;
  name: string;
  sizeLabel: string;
  priceDisplay: string;
  rentalDuration: string;
  isPriceProvisional: boolean;
  deliveryChargesConfirmed: boolean;
  summary: string;
  suitableFor: string[];
  provisionalDisclaimer: string;
  deliveryCollectionDisclaimer: string;
}

export const productsData: TongRoroProduct[] = [
  {
    id: 'tong-roro-2-feet',
    slug: 'tong-roro-2-feet',
    name: 'Tong Roro 2 Feet',
    sizeLabel: '2 Feet',
    priceDisplay: 'RM2XX',
    rentalDuration: '10 days',
    isPriceProvisional: true,
    deliveryChargesConfirmed: false,
    summary: 'Standard 2-foot low-sided Tong Roro bin suited for residential cleanup, minor home refurbishment, garden waste, and light commercial disposal.',
    suitableFor: [
      'Domestic & residential spring cleaning',
      'Garden trimmings, branches, and yard clearance',
      'Minor home renovation, tiling, and DIY waste',
      'Light retail and commercial maintenance debris'
    ],
    provisionalDisclaimer: 'Prices are provisional (RM2XX). Final quotation must be confirmed directly with Mr Hari (+60 16-615 9365).',
    deliveryCollectionDisclaimer: 'Delivery and collection charges have not been confirmed and are not claimed to be included in displayed prices.'
  },
  {
    id: 'tong-roro-4-feet',
    slug: 'tong-roro-4-feet',
    name: 'Tong Roro 4 Feet',
    sizeLabel: '4 Feet',
    priceDisplay: 'RM3XX–RM4XX',
    rentalDuration: '10 days',
    isPriceProvisional: true,
    deliveryChargesConfirmed: false,
    summary: 'High-capacity 4-foot deep-sided Tong Roro bin engineered for major construction debris, heavy industrial waste, commercial refits, and bulky site clearance.',
    suitableFor: [
      'Major building, architectural, and structural construction debris',
      'House extension, roofing, and full-property renovation waste',
      'Industrial, factory, and warehouse bulk disposal',
      'Site clearance, bulky wooden pallets, and demolition rubble'
    ],
    provisionalDisclaimer: 'Prices are provisional (RM3XX–RM4XX). Final quotation must be confirmed directly with Mr Hari (+60 16-615 9365).',
    deliveryCollectionDisclaimer: 'Delivery and collection charges have not been confirmed and are not claimed to be included in displayed prices.'
  }
];

export const pricingDisclaimers: string[] = [
  'All prices displayed (RM2XX and RM3XX–RM4XX) are provisional estimates only. Exact final quotations must be confirmed with Mr Hari (+60 16-615 9365).',
  'Standard rental duration is 10 days. Any duration extension or early collection is subject to prior confirmation with Mr Hari.',
  'Delivery and collection charges have not been confirmed and are not claimed to be included in displayed prices. Transportation costs vary depending on exact location and access conditions.',
  'Disposal fees for specialized, dense, or restricted materials are determined upon quotation verification with Mr Hari.'
];
