export interface IndustryItem {
  id: string;
  name: string;
  description: string;
  typicalWasteTypes: string[];
}

export const industriesData: IndustryItem[] = [
  {
    id: 'resorts-and-hotels',
    name: 'Resorts and hotels',
    description: 'Bulk disposal for hospitality premises, renovation debris, garden landscape maintenance, and large-scale refurbishment projects.',
    typicalWasteTypes: ['Bulky furniture', 'Landscape trimmings', 'Room refit debris', 'Packaging waste']
  },
  {
    id: 'factories-and-warehouses',
    name: 'Factories and warehouses',
    description: 'Heavy-duty non-hazardous solid waste management, timber pallets, storage clear-outs, and production site waste disposal.',
    typicalWasteTypes: ['Wooden pallets', 'Cardboard & wrapping', 'Scrap materials', 'General industrial dry waste']
  },
  {
    id: 'colleges-and-universities',
    name: 'Colleges and universities',
    description: 'Campus maintenance waste, campus facility renovation debris, student accommodation clearances, and seasonal cleanups.',
    typicalWasteTypes: ['Dormitory clearances', 'Campus pruning & garden waste', 'Desks & institutional furniture', 'Renovation rubble']
  },
  {
    id: 'shopping-centres',
    name: 'Shopping centres',
    description: 'Retail fit-out waste removal, tenant handover debris, bulky packaging disposal, and scheduled mall maintenance.',
    typicalWasteTypes: ['Shop fitting debris', 'Drywall & partition boards', 'Packaging & cartons', 'Commercial display fixtures']
  },
  {
    id: 'building-construction',
    name: 'Building construction',
    description: 'High-volume debris disposal for commercial and civil construction sites, concrete rubble, steel offcuts, and excavation clearing.',
    typicalWasteTypes: ['Concrete & brick rubble', 'Timber formwork', 'Metal offcuts', 'Packaging & cement bags']
  },
  {
    id: 'house-construction',
    name: 'House construction',
    description: 'Tong Roro bins suited for residential development, home extensions, roof replacements, and perimeter wall construction.',
    typicalWasteTypes: ['Masonry & tiles', 'Roofing materials', 'Plaster & sand debris', 'Wood offcuts']
  },
  {
    id: 'hospitals',
    name: 'Hospitals',
    description: 'Management of non-clinical general waste, administrative facility cleanups, building maintenance, and grounds upkeep.',
    typicalWasteTypes: ['General non-clinical waste', 'Administrative paper & cartons', 'Facility maintenance scrap', 'Landscape cuttings']
  },
  {
    id: 'offices',
    name: 'Offices',
    description: 'Office relocation clearances, interior redesign debris, broken office furniture, partition disposal, and general spring cleanings.',
    typicalWasteTypes: ['Desks & chairs', 'Carpet & acoustic ceiling tiles', 'Partition panels', 'Archival paper & cardboard']
  },
  {
    id: 'food-and-beverage-industries',
    name: 'Food and beverage industries',
    description: 'Non-hazardous dry packaging waste, kitchen refit debris, crate disposal, and restaurant renovation scrap.',
    typicalWasteTypes: ['Secondary packaging & crates', 'Kitchen refurbishment debris', 'Pallet scraps', 'Dry non-putrescible waste']
  },
  {
    id: 'condominiums-and-apartments',
    name: 'Condominiums and apartments',
    description: 'Joint Management Body (JMB) and Management Corporation (MC) bulk waste disposal, resident renovation debris, and estate maintenance.',
    typicalWasteTypes: ['Resident renovation debris', 'Discarded bulky furniture', 'Common area garden trimmings', 'Maintenance scraps']
  }
];

export const industriesDisclaimer: string =
  'SKL Waste Sdn Bhd provides waste management solutions tailored for these commercial and industrial sectors, subject to confirmed service availability and site assessment. The categories listed represent industry sectors suited for our Tong Roro bins; no specific client names or proprietary client relationships are claimed or implied.';
