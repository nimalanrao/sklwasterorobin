export interface CompanyHeadquarters {
  line1: string;
  postcode: string;
  city: string;
  state: string;
  country: string;
  fullAddress: string;
}

export interface HeroContent {
  primaryHeadline: string;
  supportingDescription: string;
  primaryActionLabel: string;
  primaryActionHref: string;
  secondaryActionLabel: string;
  secondaryActionHref: string;
}

export interface CompanyInfo {
  name: string;
  registrationNumber: string;
  headquarters: CompanyHeadquarters;
  description: string;
  serviceAvailabilityDisclaimer: string;
  primaryBusiness: string;
  hero: HeroContent;
}

export const companyData: CompanyInfo = {
  name: 'SKL WASTE SDN BHD',
  registrationNumber: '200801038953',
  headquarters: {
    line1: 'PT 31127 SETOR JALAN KUALA SELANGOR',
    postcode: '47000',
    city: 'SUNGAI BULOH',
    state: 'SELANGOR DARUL EHSAN',
    country: 'MALAYSIA',
    fullAddress: 'PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.'
  },
  description: 'SKL Waste Sdn Bhd is a Malaysian waste management company focusing on Tong Roro rental, waste collection, transportation and disposal services.',
  serviceAvailabilityDisclaimer: 'Services serve residential, commercial, construction and industrial requirements, subject to confirmed service availability.',
  primaryBusiness: 'Sewaan Tong Roro',
  hero: {
    primaryHeadline: 'SEWA TONG RORO. PENGURUSAN SISA LEBIH MUDAH.',
    supportingDescription: 'Penyelesaian sewaan Tong Roro dan pengurusan sisa untuk keperluan kediaman, komersial, pembinaan dan industri.',
    primaryActionLabel: 'Dapatkan Sebut Harga',
    primaryActionHref: '/#quotation-form',
    secondaryActionLabel: 'Hubungi Mr Hari',
    secondaryActionHref: 'tel:+60166159365'
  }
};
