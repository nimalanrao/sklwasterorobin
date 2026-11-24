export type BinOwner = 'SKL Waste' | 'Thirumal Vel Enterprise';

export const OWNER_SKL: BinOwner = 'SKL Waste';
export const OWNER_THIRUMAL: BinOwner = 'Thirumal Vel Enterprise';
export const THIRUMAL_PHONE_NORMALIZED = '+60176947413';
export const THIRUMAL_PHONE_LOCAL = '17-694 7413';
export const THIRUMAL_DEFAULT_NAME = 'Tiviya';

export interface RoroRecord {
  id: string;
  created_at?: string;
  date_start: string;
  date_end: string;
  bin_owner: BinOwner;
  customer_name?: string;
  customer_phone: string;
  location: string;
  price: number;
  size: '2 Feet' | '4 Feet';
  status: 'Active' | 'Overdue' | 'Completed';
  completed_at?: string | null;
  notes?: string;
}

const supabaseUrl = (import.meta.env.PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';
const TABLE_NAME = 'system_roro_records';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const STORAGE_KEY = 'skl_system_roro_records_v3';

function offsetDateStr(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export function normalizeMalaysianPhone(raw: string): string {
  const digits = String(raw || '').replace(/[^\d]/g, '');
  if (!digits) return '';
  if (digits.startsWith('60')) return `+${digits}`;
  if (digits.startsWith('0')) return `+60${digits.slice(1)}`;
  return `+60${digits}`;
}

export function formatPhoneDisplay(raw: string): string {
  const norm = normalizeMalaysianPhone(raw);
  if (!norm) return '-';
  const local = norm.slice(3);
  if (local.length === 9) {
    return `+60 ${local.slice(0, 2)}-${local.slice(2, 5)} ${local.slice(5)}`;
  }
  if (local.length === 10) {
    return `+60 ${local.slice(0, 2)}-${local.slice(2, 6)} ${local.slice(6)}`;
  }
  return norm;
}

export function buildWazeUrl(location: string): string {
  const cleaned = String(location || '').trim();
  if (!cleaned) return '';
  // Search-only Waze link (without navigate=yes so Waze shows search results instead of auto-starting navigation)
  return `https://waze.com/ul?q=${encodeURIComponent(cleaned)}`;
}

export function buildDriverDispatchText(record: RoroRecord): string {
  const phoneDisplay = formatPhoneDisplay(
    record.bin_owner === OWNER_THIRUMAL ? THIRUMAL_PHONE_NORMALIZED : record.customer_phone
  );
  const wazeUrl = buildWazeUrl(record.location);
  const formatD = (iso: string) => {
    const p = (iso || '').split('T')[0].split('-');
    return p.length === 3 ? `${p[2]}/${p[1]}/${p[0]}` : iso;
  };
  const lines = [
    '*RORO DISPATCH INFO*',
    `Owner: ${record.bin_owner}`,
    `Bin Size: ${record.size}`,
    `Location: ${record.location}`,
    `Waze: ${wazeUrl}`,
    `Customer: ${record.customer_name || (record.bin_owner === OWNER_THIRUMAL ? THIRUMAL_DEFAULT_NAME : '-')}`,
    `Phone: ${phoneDisplay}`,
    `Date: ${formatD(record.date_start)} - ${formatD(record.date_end)}`
  ];
  if (record.notes) {
    lines.push(`Notes: ${record.notes}`);
  }
  return lines.join('\n');
}

export function buildWhatsAppUrl(record: RoroRecord): string {
  const normalized =
    record.bin_owner === OWNER_THIRUMAL
      ? THIRUMAL_PHONE_NORMALIZED
      : normalizeMalaysianPhone(record.customer_phone);
  if (!normalized) return '';
  return `https://wa.me/${normalized}`;
}

function normalizeStatus(raw: string | undefined): 'Active' | 'Overdue' | 'Completed' {
  if (!raw) return 'Active';
  const lower = raw.toLowerCase();
  if (lower === 'completed' || lower === 'selesai tarik') return 'Completed';
  if (lower === 'overdue' || lower === 'tamat tempoh') return 'Overdue';
  return 'Active';
}

function normalizeOwner(raw: string | undefined): BinOwner {
  if (raw && raw.toLowerCase().includes('thirumal')) {
    return OWNER_THIRUMAL;
  }
  return OWNER_SKL;
}

function normalizeRecord(r: any): RoroRecord {
  const owner = normalizeOwner(r.bin_owner);
  return {
    id: String(r.id),
    created_at: r.created_at || new Date().toISOString(),
    date_start: String(r.date_start),
    date_end: String(r.date_end),
    bin_owner: owner,
    customer_name:
      r.customer_name || (owner === OWNER_THIRUMAL ? THIRUMAL_DEFAULT_NAME : undefined),
    customer_phone:
      owner === OWNER_THIRUMAL
        ? THIRUMAL_PHONE_NORMALIZED
        : normalizeMalaysianPhone(r.customer_phone || ''),
    location: String(r.location || ''),
    price: Number(r.price) || 0,
    size: r.size === '4 Feet' ? '4 Feet' : '2 Feet',
    status: normalizeStatus(r.status),
    completed_at: r.completed_at || null,
    notes: r.notes || undefined
  };
}

const defaultRecords: RoroRecord[] = [
  {
    id: 'roro-demo-101',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    date_start: offsetDateStr(-3),
    date_end: offsetDateStr(7),
    bin_owner: OWNER_SKL,
    customer_name: 'Mr. Yusof (Contractor)',
    customer_phone: '+60123456789',
    location: 'Seksyen 7, Shah Alam (Bungalow Site)',
    price: 350,
    size: '4 Feet',
    status: 'Active',
    completed_at: null,
    notes: 'Green gate entrance, morning truck access'
  },
  {
    id: 'roro-demo-102',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    date_start: offsetDateStr(-8),
    date_end: offsetDateStr(2),
    bin_owner: OWNER_THIRUMAL,
    customer_name: THIRUMAL_DEFAULT_NAME,
    customer_phone: THIRUMAL_PHONE_NORMALIZED,
    location: 'Bandar Seri Coalfields, Sungai Buloh',
    price: 260,
    size: '2 Feet',
    status: 'Active',
    completed_at: null,
    notes: 'Concrete rubble and broken tiles'
  },
  {
    id: 'roro-demo-103',
    created_at: new Date(Date.now() - 11 * 86400000).toISOString(),
    date_start: offsetDateStr(-11),
    date_end: offsetDateStr(-1),
    bin_owner: OWNER_SKL,
    customer_name: 'Madam Halimah',
    customer_phone: '+60166159365',
    location: 'Bukit Jelutong, Shah Alam',
    price: 380,
    size: '4 Feet',
    status: 'Overdue',
    completed_at: null,
    notes: 'Requires immediate pickup (exceeded 10 days)'
  }
];

function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
    ...extra
  };
}

export function getLocalRecords(): RoroRecord[] {
  if (typeof window === 'undefined') return defaultRecords;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRecords));
      return [...defaultRecords];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeRecord) : [...defaultRecords];
  } catch (e) {
    console.error('Error reading localStorage:', e);
    return [...defaultRecords];
  }
}

export function saveLocalRecords(records: RoroRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error('Error saving localStorage:', e);
  }
}

export interface FetchResult {
  records: RoroRecord[];
  source: 'supabase' | 'local';
  tableMissing?: boolean;
}

export async function fetchAllRecords(): Promise<FetchResult> {
  if (!isSupabaseConfigured) {
    return { records: getLocalRecords(), source: 'local' };
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE_NAME}?select=*&order=created_at.desc`,
      { method: 'GET', headers: getHeaders() }
    );

    if (res.ok) {
      const rawData = (await res.json()) as any[];
      const data = rawData.map(normalizeRecord);
      saveLocalRecords(data);
      return { records: data, source: 'supabase' };
    }

    const errText = await res.text();
    const tableMissing = res.status === 404 || errText.includes('PGRST205');
    return { records: getLocalRecords(), source: 'local', tableMissing };
  } catch (err) {
    console.warn('Supabase unreachable, using local cache:', err);
    return { records: getLocalRecords(), source: 'local' };
  }
}

export async function createRoroRecord(record: RoroRecord): Promise<{ synced: boolean }> {
  const local = getLocalRecords();
  const next = [record, ...local.filter((r) => r.id !== record.id)];
  saveLocalRecords(next);

  if (!isSupabaseConfigured) return { synced: false };

  try {
    const payload = {
      id: record.id,
      created_at: record.created_at || new Date().toISOString(),
      date_start: record.date_start,
      date_end: record.date_end,
      bin_owner: record.bin_owner,
      customer_name: record.customer_name || null,
      customer_phone: record.customer_phone,
      location: record.location,
      price: record.price,
      size: record.size,
      status: record.status,
      completed_at: record.completed_at || null,
      notes: record.notes || null
    };

    const res = await fetch(`${supabaseUrl}/rest/v1/${TABLE_NAME}`, {
      method: 'POST',
      headers: getHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify(payload)
    });
    return { synced: res.ok };
  } catch (err) {
    console.warn('Supabase insert fallback to local:', err);
    return { synced: false };
  }
}

export async function updateRoroRecord(record: RoroRecord): Promise<{ synced: boolean }> {
  const local = getLocalRecords();
  const next = local.map((r) => (r.id === record.id ? record : r));
  saveLocalRecords(next);

  if (!isSupabaseConfigured) return { synced: false };

  try {
    const payload = {
      date_start: record.date_start,
      date_end: record.date_end,
      bin_owner: record.bin_owner,
      customer_name: record.customer_name || null,
      customer_phone: record.customer_phone,
      location: record.location,
      price: record.price,
      size: record.size,
      status: record.status,
      completed_at: record.completed_at || null,
      notes: record.notes || null
    };

    const res = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(record.id)}`,
      {
        method: 'PATCH',
        headers: getHeaders({ Prefer: 'return=minimal' }),
        body: JSON.stringify(payload)
      }
    );
    return { synced: res.ok };
  } catch (err) {
    console.warn('Supabase update fallback to local:', err);
    return { synced: false };
  }
}

export async function deleteRoroRecord(id: string): Promise<{ synced: boolean }> {
  const local = getLocalRecords();
  const next = local.filter((r) => r.id !== id);
  saveLocalRecords(next);

  if (!isSupabaseConfigured) return { synced: false };

  try {
    const res = await fetch(
      `${supabaseUrl}/rest/v1/${TABLE_NAME}?id=eq.${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: getHeaders({ Prefer: 'return=minimal' })
      }
    );
    return { synced: res.ok };
  } catch (err) {
    console.warn('Supabase delete fallback to local:', err);
    return { synced: false };
  }
}

export const SUPABASE_SETUP_SQL = `CREATE TABLE IF NOT EXISTS public.system_roro_records (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    date_start DATE NOT NULL,
    date_end DATE NOT NULL,
    bin_owner TEXT NOT NULL DEFAULT 'SKL Waste' CHECK (bin_owner IN ('SKL Waste', 'Thirumal Vel Enterprise')),
    customer_name TEXT,
    customer_phone TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0,
    size TEXT NOT NULL CHECK (size IN ('2 Feet', '4 Feet')),
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Overdue', 'Completed')),
    completed_at TIMESTAMPTZ,
    notes TEXT
);

ALTER TABLE public.system_roro_records ADD COLUMN IF NOT EXISTS customer_phone TEXT NOT NULL DEFAULT '';
ALTER TABLE public.system_roro_records ADD COLUMN IF NOT EXISTS bin_owner TEXT NOT NULL DEFAULT 'SKL Waste';

ALTER TABLE public.system_roro_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read all system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon insert system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon update system_roro_records" ON public.system_roro_records;
DROP POLICY IF EXISTS "Allow anon delete system_roro_records" ON public.system_roro_records;

CREATE POLICY "Allow anon read all system_roro_records"
ON public.system_roro_records FOR SELECT USING (true);

CREATE POLICY "Allow anon insert system_roro_records"
ON public.system_roro_records FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anon update system_roro_records"
ON public.system_roro_records FOR UPDATE USING (true);

CREATE POLICY "Allow anon delete system_roro_records"
ON public.system_roro_records FOR DELETE USING (true);`;
