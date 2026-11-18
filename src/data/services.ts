export interface WasteServiceItem {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  availabilityNote: string;
  isPrimary: boolean;
}

export const primaryService: WasteServiceItem = {
  id: 'sewaan-tong-roro',
  name: 'Sewaan Tong Roro',
  nameEn: 'Tong Roro Rental',
  description: 'Sewa tong roro bersaiz 2 Kaki dan 4 Kaki untuk tempoh sewaan standard 10 hari bagi pengurusan sisa kediaman, tapak pembinaan, perindustrian dan komersial.',
  availabilityNote: 'Perkhidmatan teras SKL Waste Sdn Bhd, tertakluk kepada pengesahan ketersediaan dan lokasi penghantaran.',
  isPrimary: true
};

export const secondaryServices: WasteServiceItem[] = [
  {
    id: 'kutipan-sampah',
    name: 'Kutipan sampah',
    nameEn: 'Waste Collection',
    description: 'Perkhidmatan kutipan sisa pepejal berjadual atau atas permintaan dari premis kediaman, tapak projek, atau kawasan perniagaan.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'pelupusan-sisa',
    name: 'Pelupusan sisa',
    nameEn: 'Waste Disposal',
    description: 'Pengendalian pelupusan sisa pepejal dan sisa am di pusat pelupusan berlesen mengikut piawaian alam sekitar tempatan.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'pengangkutan-sampah',
    name: 'Pengangkutan sampah',
    nameEn: 'Waste Transportation',
    description: 'Pengangkutan dan pemindahan sisa binaan, pukal, dan sisa am menggunakan lori dan kelengkapan pengangkutan khusus.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'sisa-pembinaan',
    name: 'Sisa pembinaan',
    nameEn: 'Construction Waste',
    description: 'Pengurusan sisa bahan binaan berat seperti batu bata, konkrit, plaster, simen, dan serpihan struktur tapak pembinaan.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'sisa-pengubahsuaian',
    name: 'Sisa pengubahsuaian',
    nameEn: 'Renovation Waste',
    description: 'Pembersihan sisa kerja ubah suai rumah atau kedai termasuk jubin, kayu, siling kapur, dan sisa perabot terpakai.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'sisa-perindustrian',
    name: 'Sisa perindustrian',
    nameEn: 'Industrial Waste',
    description: 'Pengurusan sisa pepejal bukan toksik dan sisa operasi harian kilang, gudang, serta bengkel industri.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'sampah-pukal',
    name: 'Sampah pukal',
    nameEn: 'Bulky Waste',
    description: 'Pelupusan barangan bersaiz besar seperti perabot usang, tilam, barangan perkakas, dan sisa peralatan rumah tangga.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'sisa-taman',
    name: 'Sisa taman',
    nameEn: 'Garden Waste',
    description: 'Kutipan sisa landskap, cantasan pokok, dahan, daun kering, dan kerja pembersihan kawasan lapang atau kebun.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  },
  {
    id: 'pembersihan-tapak',
    name: 'Pembersihan tapak',
    nameEn: 'Site Clearance',
    description: 'Kerja pembersihan tapak sebelum atau selepas projek pembinaan dan pengubahsuaian bagi memastikan persekitaran selamat dan bersih.',
    availabilityNote: 'Subject to confirmed service availability.',
    isPrimary: false
  }
];

export const allServices: WasteServiceItem[] = [primaryService, ...secondaryServices];
