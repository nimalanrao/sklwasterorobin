export interface WhatsAppInfo {
  url: string;
  rawNumber: string;
  isConfirmed: boolean;
  verificationNote: string;
}

export interface SocialMediaLinks {
  facebook: string;
  instagram: string;
}

export interface ContactInfo {
  mainContactPerson: string;
  telephoneDisplay: string;
  telephoneHref: string;
  email: string;
  emailHref: string;
  whatsapp: WhatsAppInfo;
  address: string;
  socials: SocialMediaLinks;
}

export const contactData: ContactInfo = {
  mainContactPerson: 'Mr Hari',
  telephoneDisplay: '+60 16-615 9365',
  telephoneHref: 'tel:+60166159365',
  email: 'tongroroservissklwaste@gmail.com',
  emailHref: 'mailto:tongroroservissklwaste@gmail.com',
  whatsapp: {
    url: 'https://wa.me/60166159365',
    rawNumber: '60166159365',
    isConfirmed: false,
    verificationNote: 'WhatsApp availability on +60 16-615 9365 is pending confirmation. Only activate WhatsApp link once confirmed.'
  },
  address: 'PT 31127 SETOR JALAN KUALA SELANGOR, 47000 SUNGAI BULOH, SELANGOR DARUL EHSAN, MALAYSIA.',
  socials: {
    facebook: 'https://www.facebook.com/profile.php?id=61596740341410',
    instagram: 'https://www.instagram.com/sklwasteroro/'
  }
};
