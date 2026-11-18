export interface RentalStep {
  stepNumber: number;
  title: string;
  description: string;
  note?: string;
}

export const rentalProcessSteps: RentalStep[] = [
  {
    stepNumber: 1,
    title: 'Enquiry & Size Selection',
    description: 'Determine your project requirements and select between the 2 Feet bin (provisional RM2XX, suitable for domestic/garden/light renovation waste) or the 4 Feet bin (provisional RM3XX–RM4XX, suitable for heavy construction, commercial, or bulky waste).',
    note: 'Both bin sizes are subject to inventory availability and site clearance.'
  },
  {
    stepNumber: 2,
    title: 'Location Verification & Final Quotation with Mr Hari',
    description: 'Contact Mr Hari (+60 16-615 9365) to verify your drop-off location (all service areas are pending verification), confirm road and site access feasibility, and obtain your final, binding quotation inclusive of confirmed delivery and collection arrangements.',
    note: 'Display prices are provisional; final quotations must be confirmed directly with Mr Hari.'
  },
  {
    stepNumber: 3,
    title: 'Delivery & 10-Day Rental Period',
    description: 'Upon confirmation, our lori Roro delivers the bin to your designated address. You enjoy a standard rental duration of 10 days to load your non-hazardous waste safely and efficiently.',
    note: 'Standard rental duration is 10 days. Any duration extension must be arranged in advance.'
  },
  {
    stepNumber: 4,
    title: 'Collection & Waste Disposal',
    description: 'Once loading is complete or at the end of the 10-day rental period, notify Mr Hari for collection. Our team hauls the bin away and disposes of the waste at authorized disposal facilities in compliance with environmental regulations.',
    note: 'Overloading past the top rim of the bin is strictly prohibited for road safety.'
  }
];
