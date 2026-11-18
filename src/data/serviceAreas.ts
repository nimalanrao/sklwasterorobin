export interface ServiceAreaItem {
  id: string;
  name: string;
  region: string;
  isConfirmed: boolean;
  statusLabel: string;
  notes: string;
}

export const serviceAreasData: ServiceAreaItem[] = [
  {
    id: 'desa-coalfields',
    name: 'Desa Coalfields',
    region: 'Sungai Buloh / Ijok, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'bandar-seri-coalfields',
    name: 'Bandar Seri Coalfields',
    region: 'Sungai Buloh, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'sungai-buloh',
    name: 'Sungai Buloh',
    region: 'Petaling / Gombak, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Company headquarters vicinity; specific drop-off site accessibility pending confirmation.'
  },
  {
    id: 'paya-jaras',
    name: 'Paya Jaras',
    region: 'Sungai Buloh, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'bukit-jelutong',
    name: 'Bukit Jelutong',
    region: 'Shah Alam, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'bukit-beruntung',
    name: 'Bukit Beruntung',
    region: 'Rawang / Hulu Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'kundang',
    name: 'Kundang',
    region: 'Rawang / Kuang, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'puncak-alam',
    name: 'Puncak Alam',
    region: 'Kuala Selangor, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'aman-putri',
    name: 'Aman Putri',
    region: 'Sungai Buloh, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'tasik-puteri',
    name: 'Tasik Puteri',
    region: 'Rawang, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'saujana-utama',
    name: 'Saujana Utama',
    region: 'Sungai Buloh / Kuala Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'subang',
    name: 'Subang',
    region: 'Petaling, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  },
  {
    id: 'rawang',
    name: 'Rawang',
    region: 'Gombak, Selangor',
    isConfirmed: false,
    statusLabel: 'Pending Verification',
    notes: 'Service coverage and delivery access pending operational verification with Mr Hari.'
  }
];

export const serviceAreaDisclaimer: string =
  'All 13 listed service locations are pending operational verification. Service availability, drop-off site accessibility, road weight limits, and delivery/collection charges for each location must be confirmed directly with Mr Hari (+60 16-615 9365) prior to booking confirmation.';
