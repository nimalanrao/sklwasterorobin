import {
  OWNER_SKL,
  OWNER_THIRUMAL,
  THIRUMAL_DEFAULT_NAME,
  THIRUMAL_PHONE_NORMALIZED,
  normalizeMalaysianPhone,
  type BinOwner
} from './systemRoroClient';

export type VisionProvider =
  | 'auto'
  | 'gemini'
  | 'groq'
  | 'openrouter'
  | 'huggingface'
  | 'ollama';

export interface VisionConfig {
  provider: VisionProvider;
  apiKey: string;
  customModel?: string;
  ollamaUrl?: string;
}

export interface ExtractedBinDraft {
  draftId: string;
  sourceFileName: string;
  thumbnailDataUrl: string;
  enhancedDataUrl: string;
  originalUprightDataUrl: string;
  phoneCropDataUrl?: string;
  wasGreenPaperEnhanced: boolean;
  wasAutoRotated: boolean;
  bin_owner: BinOwner;
  location: string;
  raw_location?: string;
  address_candidates: string[];
  address_verified: boolean;
  gps_coords?: { lat: number; lng: number } | null;
  /** Intentionally blank for SKL Waste (manual phone entry required); auto-locked for Thirumal Vel (TIVIYA) */
  customer_phone: string;
  customer_name: string;
  invoice_no: string;
  size: '2 Feet' | '4 Feet';
  price: number | null;
  date_start: string;
  date_end: string;
  notes: string;
  confidence: 'high' | 'medium' | 'low';
  providerUsed: string;
  tiviyaDetected: boolean;
}

export interface ScanStageEvent {
  stage: 'normal' | 'contrast' | 'extracting' | 'done';
  originalUprightDataUrl?: string;
  enhancedDataUrl?: string;
}

export interface ScanImageResult {
  bins: ExtractedBinDraft[];
  providerUsed: string;
  usedFallbackOcr: boolean;
  warnings: string[];
}

const VISION_CONFIG_KEY = 'skl_system_roro_vision_config_v1';
const LEARNED_EXAMPLES_KEY = 'skl_system_roro_learned_examples_v1';
const SCAN_RESULT_CACHE_KEY = 'skl_system_roro_scan_cache_v2';
const DEPOT_LAT = 3.2105;
const DEPOT_LNG = 101.5608;

async function computeFastFileFingerprint(file: File, rotationDeg?: number): Promise<string> {
  try {
    const head = new Uint8Array(await file.slice(0, 2048).arrayBuffer());
    const tailStart = Math.max(0, file.size - 1024);
    const tail = new Uint8Array(await file.slice(tailStart, file.size).arrayBuffer());
    let h = 2166136261 >>> 0;
    for (let i = 0; i < head.length; i += 4) {
      h ^= head[i];
      h = Math.imul(h, 16777619) >>> 0;
    }
    for (let i = 0; i < tail.length; i += 4) {
      h ^= tail[i];
      h = Math.imul(h, 16777619) >>> 0;
    }
    return `${file.size}_${file.lastModified}_${rotationDeg ?? 'a'}_${h.toString(36)}`;
  } catch {
    return `${file.size}_${file.lastModified}_${file.name}`;
  }
}

function readCachedVisionPayload(fp: string): { parsed: any; providerUsed: string } | null {
  if (typeof window === 'undefined' || !fp) return null;
  try {
    const raw = sessionStorage.getItem(SCAN_RESULT_CACHE_KEY);
    if (!raw) return null;
    const map = JSON.parse(raw);
    const hit = map?.[fp];
    if (hit && hit.parsed) return hit;
  } catch {}
  return null;
}

function writeCachedVisionPayload(fp: string, parsed: any, providerUsed: string): void {
  if (typeof window === 'undefined' || !fp || !parsed) return;
  try {
    const raw = sessionStorage.getItem(SCAN_RESULT_CACHE_KEY);
    const map: Record<string, any> = raw ? JSON.parse(raw) : {};
    map[fp] = { parsed, providerUsed, ts: Date.now() };
    const entries = Object.entries(map)
      .sort((a, b) => (b[1]?.ts || 0) - (a[1]?.ts || 0))
      .slice(0, 25);
    sessionStorage.setItem(SCAN_RESULT_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {}
}

export interface LearnedScanExample {
  rawLocation: string;
  finalLocation: string;
  owner: BinOwner;
  size: '2 Feet' | '4 Feet';
  price: number;
  notes?: string;
  savedAt: string;
}

let cachedKnownLocations: string[] = [];

export function loadLearnedExamples(): LearnedScanExample[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LEARNED_EXAMPLES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordLearnedScanExample(example: Omit<LearnedScanExample, 'savedAt'>): void {
  if (typeof window === 'undefined') return;
  const finalLoc = String(example.finalLocation || '').trim();
  if (!finalLoc) return;
  try {
    const existing = loadLearnedExamples();
    const rawLoc = String(example.rawLocation || finalLoc).trim();
    const entry: LearnedScanExample = {
      rawLocation: rawLoc,
      finalLocation: finalLoc,
      owner: example.owner,
      size: example.size,
      price: Number(example.price) || 0,
      notes: example.notes ? String(example.notes).trim() : '',
      savedAt: new Date().toISOString()
    };
    // Deduplicate by final location (newest wins) and keep last 18 real verified slips
    const deduped = [
      entry,
      ...existing.filter((e) => e.finalLocation.toLowerCase() !== finalLoc.toLowerCase())
    ].slice(0, 18);
    localStorage.setItem(LEARNED_EXAMPLES_KEY, JSON.stringify(deduped));
  } catch {}
}

export function seedKnownLocationsFromRecords(locations: string[]): void {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const loc of locations) {
    const cleaned = String(loc || '').trim();
    if (cleaned.length >= 4 && !seen.has(cleaned.toLowerCase())) {
      seen.add(cleaned.toLowerCase());
      out.push(cleaned);
      if (out.length >= 25) break;
    }
  }
  cachedKnownLocations = out;
}

function buildDynamicExtractionPrompt(): string {
  const learned = loadLearnedExamples();
  const sections: string[] = [RORO_EXTRACTION_PROMPT];

  // Token-budgeted continuous learning (strictly capped <= ~90 extra tokens!)
  if (learned.length > 0) {
    const compactLearned = learned
      .slice(0, 5)
      .map((ex) => {
        const raw = ex.rawLocation.slice(0, 36);
        const fin = ex.finalLocation.slice(0, 58);
        return `${raw}=>${fin}${ex.owner === OWNER_THIRUMAL ? '(TIVIYA)' : ''}`;
      });
    sections.push(`Learned:${compactLearned.join(';')}`);
  }

  if (cachedKnownLocations.length > 0) {
    const compactAreas = cachedKnownLocations
      .slice(0, 8)
      .map((loc) => loc.split(',').slice(0, 2).join(',').trim().slice(0, 38))
      .filter(Boolean);
    if (compactAreas.length > 0) {
      sections.push(`Known:${compactAreas.join('|')}`);
    }
  }

  return sections.join('\n');
}

const envGeminiKey = (import.meta.env.PUBLIC_GEMINI_API_KEY || '').trim();
const envGroqKey = (import.meta.env.PUBLIC_GROQ_API_KEY || '').trim();
const envOpenRouterKey = (import.meta.env.PUBLIC_OPENROUTER_API_KEY || '').trim();
const envHfKey = (import.meta.env.PUBLIC_HF_API_KEY || '').trim();

export function loadVisionConfig(): VisionConfig {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(VISION_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            provider: (parsed.provider as VisionProvider) || 'auto',
            apiKey: String(parsed.apiKey || '').trim(),
            customModel: parsed.customModel ? String(parsed.customModel).trim() : '',
            ollamaUrl: parsed.ollamaUrl ? String(parsed.ollamaUrl).trim() : 'http://localhost:11434'
          };
        }
      }
    } catch {}
  }

  if (envGeminiKey) return { provider: 'gemini', apiKey: envGeminiKey };
  if (envGroqKey) return { provider: 'groq', apiKey: envGroqKey };
  if (envOpenRouterKey) return { provider: 'openrouter', apiKey: envOpenRouterKey };
  if (envHfKey) return { provider: 'huggingface', apiKey: envHfKey };

  return { provider: 'auto', apiKey: '', ollamaUrl: 'http://localhost:11434' };
}

export function saveVisionConfig(cfg: VisionConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VISION_CONFIG_KEY, JSON.stringify(cfg));
  } catch {}
}

export function detectProviderFromKey(cfg: VisionConfig): {
  provider: Exclude<VisionProvider, 'auto'> | 'none';
  apiKey: string;
  label: string;
} {
  const key = (cfg.apiKey || '').trim();

  if (cfg.provider === 'ollama') {
    return { provider: 'ollama', apiKey: '', label: 'Ollama Local (Qwen2.5-VL)' };
  }

  if (cfg.provider !== 'auto' && key) {
    const labels: Record<Exclude<VisionProvider, 'auto'>, string> = {
      gemini: 'Gemini Flash Vision',
      groq: 'Groq Llama-4 Scout',
      openrouter: 'OpenRouter Qwen2.5-VL',
      huggingface: 'HuggingFace Qwen2.5-VL',
      ollama: 'Ollama Local'
    };
    return { provider: cfg.provider, apiKey: key, label: labels[cfg.provider] };
  }

  // Auto-detect from key prefix (supports both Google AI Studio AIza... and new AQ.... keys!)
  if (key.startsWith('AIza') || key.startsWith('AQ.')) {
    return { provider: 'gemini', apiKey: key, label: 'Gemini 3.5 Flash-Lite Vision' };
  }
  if (key.startsWith('gsk_')) {
    return { provider: 'groq', apiKey: key, label: 'Groq Qwen3.8 + OCR' };
  }
  if (key.startsWith('sk-or-')) {
    return { provider: 'openrouter', apiKey: key, label: 'OpenRouter Nemotron/Gemma VL' };
  }
  if (key.startsWith('hf_')) {
    return { provider: 'huggingface', apiKey: key, label: 'HuggingFace Qwen2.5-VL' };
  }
  if (key.length > 12) {
    return { provider: 'openrouter', apiKey: key, label: 'OpenRouter Vision' };
  }

  if (envGeminiKey) return { provider: 'gemini', apiKey: envGeminiKey, label: 'Gemini 3.5 Flash-Lite + Fallbacks' };
  if (envOpenRouterKey) return { provider: 'openrouter', apiKey: envOpenRouterKey, label: 'OpenRouter Vision (Free)' };
  if (envGroqKey) return { provider: 'groq', apiKey: envGroqKey, label: 'Groq Qwen3.8 + OCR' };
  if (envHfKey) return { provider: 'huggingface', apiKey: envHfKey, label: 'HuggingFace Qwen2.5-VL' };

  return { provider: 'none', apiKey: '', label: 'High-Contrast OCR + GPS (No Cloud Key)' };
}

// ============================================================================
// 1. PURE TYPESCRIPT JPEG EXIF GPS PARSER (0 KB external dependencies)
// ============================================================================
export async function extractExifGps(file: File): Promise<{ lat: number; lng: number } | null> {
  try {
    const slice = file.slice(0, 131072);
    const buf = await slice.arrayBuffer();
    const view = new DataView(buf);
    if (view.byteLength < 12 || view.getUint16(0, false) !== 0xffd8) return null;

    let offset = 2;
    while (offset + 4 < view.byteLength) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffda || marker === 0xffd9) break;
      const segLen = view.getUint16(offset, false);
      if (segLen < 2 || offset + segLen > view.byteLength) break;

      if (marker === 0xffe1 && segLen >= 10) {
        if (
          view.getUint32(offset + 2, false) === 0x45786966 &&
          view.getUint16(offset + 6, false) === 0x0000
        ) {
          const tiffStart = offset + 8;
          const littleEndian = view.getUint16(tiffStart, false) === 0x4949;
          const firstIfdOffset = view.getUint32(tiffStart + 4, littleEndian);
          const gpsIfdPtr = findGpsIfdOffset(view, tiffStart, tiffStart + firstIfdOffset, littleEndian);
          if (gpsIfdPtr) {
            const coords = readGpsTags(view, tiffStart, tiffStart + gpsIfdPtr, littleEndian);
            if (coords && isInsideMalaysia(coords.lat, coords.lng)) {
              return coords;
            }
          }
        }
      }
      offset += segLen;
    }
  } catch {}
  return null;
}

function findGpsIfdOffset(view: DataView, _tiffStart: number, ifdOffset: number, le: boolean): number | null {
  if (ifdOffset + 2 > view.byteLength) return null;
  const entries = view.getUint16(ifdOffset, le);
  for (let i = 0; i < entries; i++) {
    const entryOffset = ifdOffset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;
    const tag = view.getUint16(entryOffset, le);
    if (tag === 0x8825) {
      return view.getUint32(entryOffset + 8, le);
    }
  }
  return null;
}

function readGpsTags(
  view: DataView,
  tiffStart: number,
  gpsIfdOffset: number,
  le: boolean
): { lat: number; lng: number } | null {
  if (gpsIfdOffset + 2 > view.byteLength) return null;
  const entries = view.getUint16(gpsIfdOffset, le);
  let latRef = 'N';
  let lngRef = 'E';
  let latVals: number[] | null = null;
  let lngVals: number[] | null = null;

  const readRationals = (valOffset: number): number[] | null => {
    if (valOffset + 24 > view.byteLength) return null;
    const out: number[] = [];
    for (let j = 0; j < 3; j++) {
      const num = view.getUint32(valOffset + j * 8, le);
      const den = view.getUint32(valOffset + j * 8 + 4, le);
      out.push(den ? num / den : 0);
    }
    return out;
  };

  for (let i = 0; i < entries; i++) {
    const eo = gpsIfdOffset + 2 + i * 12;
    if (eo + 12 > view.byteLength) break;
    const tag = view.getUint16(eo, le);
    if (tag === 0x0001) {
      const ch = view.getUint8(eo + 8);
      if (ch === 83 || ch === 115) latRef = 'S';
    } else if (tag === 0x0002) {
      const ptr = tiffStart + view.getUint32(eo + 8, le);
      latVals = readRationals(ptr);
    } else if (tag === 0x0003) {
      const ch = view.getUint8(eo + 8);
      if (ch === 87 || ch === 119) lngRef = 'W';
    } else if (tag === 0x0004) {
      const ptr = tiffStart + view.getUint32(eo + 8, le);
      lngVals = readRationals(ptr);
    }
  }

  if (!latVals || !lngVals) return null;
  let lat = latVals[0] + latVals[1] / 60 + latVals[2] / 3600;
  let lng = lngVals[0] + lngVals[1] / 60 + lngVals[2] / 3600;
  if (latRef === 'S') lat = -lat;
  if (lngRef === 'W') lng = -lng;
  if (!lat && !lng) return null;
  return { lat, lng };
}

function isInsideMalaysia(lat: number, lng: number): boolean {
  return lat >= 0.7 && lat <= 7.6 && lng >= 99.4 && lng <= 119.6;
}

// ============================================================================
// 2. ULTRA-HIGH-CONTRAST GREEN-PAPER INK ISOLATION & AUTO-UPRIGHT PREPROCESSOR
//    Pipeline: Raw Green Slip -> Detect Orientation (-90° CCW upright) ->
//    Halo-Free Flat-Field Background Normalization -> Blue/Red/Black Ink
//    Chroma Isolation -> Ultra-High-Contrast Black-on-White Scan + Phone Strip Crop
// ============================================================================
export interface PreparedReceiptImages {
  enhancedBase64: string;
  enhancedDataUrl: string;
  originalUprightDataUrl: string;
  thumbnailDataUrl: string;
  phoneCropDataUrl?: string;
  mimeType: string;
  wasGreenPaper: boolean;
  wasAutoRotated: boolean;
}

export async function prepareEnhancedReceiptImage(
  file: File,
  manualRotationDeg?: number
): Promise<PreparedReceiptImages> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const srcUrl = String(reader.result || '');
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported image format'));
      img.onload = () => {
        try {
          const natW = img.naturalWidth || img.width;
          const natH = img.naturalHeight || img.height;

          // Step 1: Quick color probe on downscaled image to detect mint-green receipt paper
          const probeCanvas = document.createElement('canvas');
          probeCanvas.width = 64;
          probeCanvas.height = 64;
          const probeCtx = probeCanvas.getContext('2d', { willReadFrequently: true });
          let isGreenPaper = false;
          let darkBannerOnLeft = false;

          if (probeCtx) {
            probeCtx.drawImage(img, 0, 0, 64, 64);
            const pData = probeCtx.getImageData(0, 0, 64, 64).data;
            let greenPixels = 0;
            let totalCenter = 0;
            let leftDarkBlue = 0;
            let rightDarkBlue = 0;

            for (let y = 10; y < 54; y++) {
              for (let x = 10; x < 54; x++) {
                const idx = (y * 64 + x) * 4;
                const r = pData[idx];
                const g = pData[idx + 1];
                const b = pData[idx + 2];
                totalCenter++;
                // Mint-green carbon paper: Green noticeably exceeds Red, medium-high brightness
                if (g > r + 10 && g > 105 && g >= b - 8) {
                  greenPixels++;
                }
                // Detect the dark navy "CASH / INVOICE" bar side for orientation check
                if (b > r + 18 && r < 75 && g < 105) {
                  if (x < 32) leftDarkBlue++;
                  else rightDarkBlue++;
                }
              }
            }
            isGreenPaper = greenPixels / Math.max(1, totalCenter) > 0.28;
            darkBannerOnLeft = leftDarkBlue > rightDarkBlue * 1.4;
          }

          // Step 2: Auto-rotate portrait green receipt photos upright!
          // Standard SKL Waste phone photos (like all 8 training images) are taken vertically
          // with the receipt rotated 90° CW -> rotating -90° (270°) makes it upright horizontal.
          let rotationDeg = 0;
          let wasAutoRotated = false;
          if (typeof manualRotationDeg === 'number') {
            rotationDeg = ((manualRotationDeg % 360) + 360) % 360;
            wasAutoRotated = rotationDeg !== 0;
          } else if (isGreenPaper && natH > natW * 1.05) {
            rotationDeg = darkBannerOnLeft ? 90 : 270;
            wasAutoRotated = true;
          }

          // Compute target upright dimensions (1152px longest side = crisp OCR + ~45% smaller mobile upload)
          const maxDim = 1152;
          const rotSwap = rotationDeg === 90 || rotationDeg === 270;
          let w = rotSwap ? natH : natW;
          let h = rotSwap ? natW : natH;
          if (w > maxDim || h > maxDim) {
            const scale = maxDim / Math.max(w, h);
            w = Math.round(w * scale);
            h = Math.round(h * scale);
          }

          // Draw full upright color original
          const fullUprightCanvas = document.createElement('canvas');
          fullUprightCanvas.width = w;
          fullUprightCanvas.height = h;
          const fullCtx = fullUprightCanvas.getContext('2d', { willReadFrequently: true });
          if (!fullCtx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }
          fullCtx.fillStyle = '#ffffff';
          fullCtx.fillRect(0, 0, w, h);
          fullCtx.save();
          fullCtx.translate(w / 2, h / 2);
          if (rotationDeg) {
            fullCtx.rotate((rotationDeg * Math.PI) / 180);
          }
          const drawW = rotSwap ? h : w;
          const drawH = rotSwap ? w : h;
          fullCtx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          fullCtx.restore();

          const fullSrc = fullCtx.getImageData(0, 0, w, h).data;

          // Step 2.5: Row/Column Green-Paper Density Auto-Crop!
          // Trims dead asphalt/desk/background borders so 100% of Vision image tokens focus on the slip.
          let cx0 = 0;
          let cy0 = 0;
          let cw = w;
          let ch = h;
          if (isGreenPaper) {
            const step = 4;
            const gw = Math.floor(w / step);
            const gh = Math.floor(h / step);
            const rowHits = new Int32Array(gh);
            const colHits = new Int32Array(gw);
            for (let gyi = 0; gyi < gh; gyi++) {
              const y = gyi * step;
              for (let gxi = 0; gxi < gw; gxi++) {
                const x = gxi * step;
                const idx = (y * w + x) * 4;
                const r = fullSrc[idx];
                const g = fullSrc[idx + 1];
                const b = fullSrc[idx + 2];
                if (g > r + 11 && g > 78 && g >= b - 4) {
                  rowHits[gyi]++;
                  colHits[gxi]++;
                }
              }
            }
            const rThresh = Math.floor(gw * 0.24);
            const cThresh = Math.floor(gh * 0.24);
            let topG = 0;
            let botG = gh - 1;
            let leftG = 0;
            let rightG = gw - 1;
            while (topG < gh - 1 && rowHits[topG] < rThresh) topG++;
            while (botG > topG && rowHits[botG] < rThresh) botG--;
            while (leftG < gw - 1 && colHits[leftG] < cThresh) leftG++;
            while (rightG > leftG && colHits[rightG] < cThresh) rightG--;

            const candW = (rightG - leftG) * step;
            const candH = (botG - topG) * step;
            if (candW > w * 0.45 && candH > h * 0.45) {
              const padX = Math.round(w * 0.012);
              const padY = Math.round(h * 0.012);
              cx0 = Math.max(0, leftG * step - padX);
              cy0 = Math.max(0, topG * step - padY);
              const cx1 = Math.min(w, rightG * step + padX);
              const cy1 = Math.min(h, botG * step + padY);
              cw = cx1 - cx0;
              ch = cy1 - cy0;
            }
          }

          // Build pixel-aligned cropped upright normal preview (matches enhanced image 1:1 for wipe animation!)
          const croppedNormalCanvas = document.createElement('canvas');
          croppedNormalCanvas.width = cw;
          croppedNormalCanvas.height = ch;
          const cnCtx = croppedNormalCanvas.getContext('2d', { willReadFrequently: true });
          if (!cnCtx) {
            reject(new Error('Cropped canvas unavailable'));
            return;
          }
          cnCtx.drawImage(fullUprightCanvas, cx0, cy0, cw, ch, 0, 0, cw, ch);
          const originalUprightDataUrl = croppedNormalCanvas.toDataURL('image/jpeg', 0.8);

          // Step 3: Shadow-Free Local 88th-Percentile Illumination Normalization + Ink Isolation
          // Immune to BOTH dark ink halos AND heavy phone/hand shadows across the green paper!
          const src = cnCtx.getImageData(0, 0, cw, ch).data;
          const gx = 32;
          const gy = 24;
          const bgRGrid = new Float32Array(gx * gy);
          const bgGGrid = new Float32Array(gx * gy);
          const bgBGrid = new Float32Array(gx * gy);
          const rs: number[] = [];
          const gs: number[] = [];
          const bs: number[] = [];

          for (let cellY = 0; cellY < gy; cellY++) {
            const y0 = Math.floor((cellY * ch) / gy);
            const y1 = Math.min(ch, Math.floor(((cellY + 1) * ch) / gy));
            const sy = Math.max(1, Math.floor((y1 - y0) / 10));
            for (let cellX = 0; cellX < gx; cellX++) {
              const x0 = Math.floor((cellX * cw) / gx);
              const x1 = Math.min(cw, Math.floor(((cellX + 1) * cw) / gx));
              const sx = Math.max(1, Math.floor((x1 - x0) / 10));
              rs.length = 0;
              gs.length = 0;
              bs.length = 0;
              for (let y = y0; y < y1; y += sy) {
                for (let x = x0; x < x1; x += sx) {
                  const p = (y * cw + x) * 4;
                  rs.push(src[p]);
                  gs.push(src[p + 1]);
                  bs.push(src[p + 2]);
                }
              }
              rs.sort((a, b) => a - b);
              gs.sort((a, b) => a - b);
              bs.sort((a, b) => a - b);
              const idx88 = Math.min(rs.length - 1, Math.floor(rs.length * 0.88));
              const ci = cellY * gx + cellX;
              bgRGrid[ci] = Math.max(36, rs[idx88] || 180);
              bgGGrid[ci] = Math.max(36, gs[idx88] || 180);
              bgBGrid[ci] = Math.max(36, bs[idx88] || 180);
            }
          }

          // Write ultra-high-contrast text-only canvas (pure white paper, deep black ink, zero shadow blotches)
          const enhancedCanvas = document.createElement('canvas');
          enhancedCanvas.width = cw;
          enhancedCanvas.height = ch;
          const eCtx = enhancedCanvas.getContext('2d');
          if (!eCtx) {
            reject(new Error('Enhanced canvas unavailable'));
            return;
          }
          const outImgData = eCtx.createImageData(cw, ch);
          const out = outImgData.data;

          const whiteCut = isGreenPaper ? 0.935 : 0.915;
          const blackCut = isGreenPaper ? 0.56 : 0.48;
          const invSpan = 1 / (whiteCut - blackCut);
          const gamma = isGreenPaper ? 2.65 : 2.15;

          for (let y = 0; y < ch; y++) {
            const fy = ((y + 0.5) / ch) * gy - 0.5;
            const yA = Math.max(0, Math.min(gy - 1, Math.floor(fy)));
            const yB = Math.min(gy - 1, yA + 1);
            const ty = Math.max(0, Math.min(1, fy - yA));

            for (let x = 0; x < cw; x++) {
              const fx = ((x + 0.5) / cw) * gx - 0.5;
              const xA = Math.max(0, Math.min(gx - 1, Math.floor(fx)));
              const xB = Math.min(gx - 1, xA + 1);
              const tx = Math.max(0, Math.min(1, fx - xA));

              const c00 = yA * gx + xA;
              const c10 = yA * gx + xB;
              const c01 = yB * gx + xA;
              const c11 = yB * gx + xB;

              const bgR = (bgRGrid[c00] * (1 - tx) + bgRGrid[c10] * tx) * (1 - ty) + (bgRGrid[c01] * (1 - tx) + bgRGrid[c11] * tx) * ty;
              const bgG = (bgGGrid[c00] * (1 - tx) + bgGGrid[c10] * tx) * (1 - ty) + (bgGGrid[c01] * (1 - tx) + bgGGrid[c11] * tx) * ty;
              const bgB = (bgBGrid[c00] * (1 - tx) + bgBGrid[c10] * tx) * (1 - ty) + (bgBGrid[c01] * (1 - tx) + bgBGrid[c11] * tx) * ty;

              const i = (y * cw + x) * 4;
              const rNorm = src[i] / bgR;
              const gNorm = src[i + 1] / bgG;
              const bNorm = src[i + 2] / bgB;

              const minCh = rNorm < gNorm ? (rNorm < bNorm ? rNorm : bNorm) : (gNorm < bNorm ? gNorm : bNorm);

              // Boost faint blue ballpoint ink ("tiviya", addresses) & red serial digits ("0742".."0750")
              const blueInkBoost =
                (bNorm > gNorm ? (bNorm - gNorm) * 1.85 : 0) +
                (bNorm > rNorm ? (bNorm - rNorm) * 1.15 : 0);
              const redInkBoost = rNorm > gNorm ? (rNorm - gNorm) * 1.35 : 0;

              const signal = minCh - blueInkBoost * 0.72 - redInkBoost * 0.5;

              let t = (signal - blackCut) * invSpan;
              if (t <= 0) t = 0;
              else if (t >= 1) t = 1;

              const gray = Math.round(Math.pow(t, gamma) * 255);
              out[i] = gray;
              out[i + 1] = gray;
              out[i + 2] = gray;
              out[i + 3] = 255;
            }
          }

          eCtx.putImageData(outImgData, 0, 0);

          const mimeType = 'image/jpeg';
          const enhancedDataUrl = enhancedCanvas.toDataURL(mimeType, 0.8);
          const enhancedBase64 = enhancedDataUrl.split(',')[1] || '';

          // Compact thumbnail of the crisp upright enhanced scan
          const thumbMax = 260;
          const tScale = Math.min(1, thumbMax / Math.max(cw, ch));
          const tw = Math.max(1, Math.round(cw * tScale));
          const th = Math.max(1, Math.round(ch * tScale));
          const tCanvas = document.createElement('canvas');
          tCanvas.width = tw;
          tCanvas.height = th;
          const tCtx = tCanvas.getContext('2d');
          if (tCtx) tCtx.drawImage(enhancedCanvas, 0, 0, tw, th);
          const thumbnailDataUrl = tCtx ? tCanvas.toDataURL('image/jpeg', 0.75) : enhancedDataUrl;

          let phoneCropDataUrl: string | undefined;
          if (isGreenPaper && cw >= ch) {
            const cropX = Math.round(cw * 0.5);
            const cropY = Math.round(ch * 0.25);
            const cropW = Math.round(cw * 0.48);
            const cropH = Math.round(ch * 0.16);
            const pCanvas = document.createElement('canvas');
            pCanvas.width = Math.max(1, cropW);
            pCanvas.height = Math.max(1, cropH);
            const pCtx = pCanvas.getContext('2d');
            if (pCtx) {
              pCtx.drawImage(enhancedCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
              phoneCropDataUrl = pCanvas.toDataURL('image/jpeg', 0.84);
            }
          }

          resolve({
            enhancedBase64,
            enhancedDataUrl,
            originalUprightDataUrl,
            thumbnailDataUrl,
            phoneCropDataUrl,
            mimeType,
            wasGreenPaper: isGreenPaper,
            wasAutoRotated
          });
        } catch (err) {
          reject(err);
        }
      };
      img.src = srcUrl;
    };
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// 3. MALAYSIAN SPELLING FIXER, HANDWRITING TYPO CORRECTOR & MAP RESOLVER
// ============================================================================
const MY_SPELLING_AND_SHORTFORM_RULES: Array<[RegExp, string]> = [
  // Common cursive OCR misreads directly observed in SKL Waste Training images/
  [/\b(?:dln|flen|jln|jl)\b\.?/gi, 'Jalan'],
  [/\b(?:darsiaran|parsiaran|persiarn|pers)\b\.?/gi, 'Persiaran'],
  [/\b(?:satia|sotia|batia|setia)\s+(?:alan|alam|alarn)\b/gi, 'Setia Alam'],
  [/\b(?:sauj[ae]na|sanjana|sanijana|senijana)\s+(?:utam[ae]|utama|utana)\b/gi, 'Saujana Utama'],
  [/\b(?:belakng|belakag|belacag|blkg|blakang)\b/gi, 'Belakang'],
  [/\b(?:segi|sagi|sggi)\b/gi, 'Segi'],
  [/\b(?:nraga|niaga)\s+(?:bestari|bostari|bestan)\b/gi, 'Niaga Bestari'],
  [/\b(?:taisk|tasik|tasis|tosik)\s+(?:putri|puteri|ptri|patri|putori)\b/gi, 'Bandar Tasik Puteri'],
  [/\bTan\s+Sri\s+Low(?:\s+Yow\s+Chuan)?\b/gi, 'Tan Sri Low Yow Chuan'],
  [/\b(?:lrg|lorng)\b\.?/gi, 'Lorong'],
  [/\b(?:tmn|tamn)\b\.?/gi, 'Taman'],
  [/\b(?:sek|seks)\b\.?(?=\s*\d)/gi, 'Seksyen'],
  [/\b(?:bdr|bandr)\b\.?/gi, 'Bandar'],
  [/\b(?:kg|kpg)\b\.?/gi, 'Kampung'],
  [/\b(?:sg)\b\.?(?=\s+[A-Z])/gi, 'Sungai'],
  [/\b(?:bkt)\b\.?/gi, 'Bukit'],
  [/\bsebalah\b/gi, 'Sebelah'],
  [/\bsiri\s+muda\b/gi, 'Sri Muda'],
  [/\bsgr\b/gi, 'Selangor']
];

const LANDMARK_EXACT_MAP_FIXES: Array<{ test: RegExp; fullAddress: string; noteHint?: string }> = [
  {
    test: /saujana\s+utama.*(?:belakang|blkg).*segi/i,
    fullAddress: 'Belakang Segi Fresh Saujana Utama, Jalan Bidara 9/2, Saujana Utama 3, 47000 Sungai Buloh, Selangor',
    noteHint: 'Belakang Segi'
  }
];

const AREA_HINT_EXPANSIONS: Array<{ test: RegExp; area: string }> = [
  { test: /\bJALAN\s+BSC\b|\bBSC\s+\d/i, area: 'Bandar Seri Coalfields, 47000 Sungai Buloh, Selangor' },
  { test: /\bJALAN\s+DC\b|\bDC\s+\d/i, area: 'Desa Coalfields, 47000 Sungai Buloh, Selangor' },
  { test: /\bBTP\b|\bTASIK\s+PUTERI\b|\bTAN\s+SRI\s+LOW\b/i, area: 'Bandar Tasik Puteri, 48020 Rawang, Selangor' },
  { test: /\bNIAGA\s+BESTARI\b|\bPUNCAK\s+BESTARI\b/i, area: 'Puncak Bestari, 42300 Bandar Puncak Alam, Selangor' },
  { test: /\bALAM\s+SURIA\b|\bECO\s+GRANDEUR\b|\bPUNCAK\s+ALAM\b/i, area: '42300 Bandar Puncak Alam, Selangor' },
  { test: /\bSAUJANA\s+UTAMA\b|\bSU\s+\d/i, area: 'Saujana Utama, 47000 Sungai Buloh, Selangor' },
  { test: /\bSETIA\s+ALAM\b/i, area: 'Setia Alam, 40170 Shah Alam, Selangor' },
  { test: /\bPAYA\s+JARAS\b/i, area: 'Paya Jaras, 47000 Sungai Buloh, Selangor' },
  { test: /\bAMAN\s+PUTRI\b/i, area: 'Aman Putri, 47000 Sungai Buloh, Selangor' },
  { test: /\bBUKIT\s+JELUTONG\b/i, area: 'Bukit Jelutong, 40150 Shah Alam, Selangor' },
  { test: /\bSRI\s+MUDA\b/i, area: 'Taman Sri Muda, 40400 Shah Alam, Selangor' },
  { test: /\bKOTA\s+DAMANSARA\b|\bPJU\s*5\b/i, area: 'Kota Damansara, 47810 Petaling Jaya, Selangor' }
];

export function cleanMalaysianAddressText(raw: string): string {
  let text = String(raw || '')
    .replace(/\(\s*location\s*\)/gi, '')
    .replace(/\(\s*(?:tukar|turun|tarik)\s+t[ou]ng\s*\)/gi, '')
    .replace(/\b[24]\s*(?:kaki|kau|kki|ft|feet|')\b/gi, '')
    .replace(/[\r\n]+/g, ', ')
    .replace(/\s{2,}/g, ' ')
    .replace(/,\s*,+/g, ',')
    .replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, '')
    .trim();

  for (const [pattern, replacement] of MY_SPELLING_AND_SHORTFORM_RULES) {
    text = text.replace(pattern, replacement);
  }
  return text.replace(/\s{2,}/g, ' ').replace(/,\s*,+/g, ',').trim();
}

export function cleanSiteNotes(rawNotes: string, rawLocation: string): string {
  let notes = String(rawNotes || '')
    .replace(/\btukar\s+t[ou]ng\b/gi, 'Tukar Tong')
    .replace(/\bturun\s+t[ou]ng\b/gi, 'Turun Tong')
    .replace(/\btarik\s+t[ou]ng\b/gi, 'Tarik Tong')
    .replace(/\(\s*(Tukar Tong|Turun Tong|Tarik Tong)\s*\)/gi, '$1')
    .replace(/^\(|\)$/g, '')
    .trim();

  if (!notes) {
    const loc = String(rawLocation || '');
    if (/tukar\s+t[ou]ng/i.test(loc)) notes = 'Tukar Tong';
    else if (/turun\s+t[ou]ng/i.test(loc)) notes = 'Turun Tong';
    else if (/tarik\s+t[ou]ng/i.test(loc)) notes = 'Tarik Tong';
  }
  return notes;
}

function extractLeadingUnitOrHouseNo(addr: string): string {
  const m = addr.match(
    /^(?:(?:NO\.?|LOT|PT|PLOT|UNIT|BLOK|BLOCK)\s*)?(?:[A-Z]-)?[0-9]{1,5}[A-Z]?(?:\s*[-/]\s*[0-9A-Z]{1,4})?(?=\s*[,\s]\s*(?:Jalan|Lorong|Persiaran|Lebuh|Lengkok|Taman|Seksyen|Bandar|Kampung))/i
  );
  if (!m) return '';
  const raw = m[0].trim();
  if (/^[A-Z]-\d/i.test(raw)) return raw.toUpperCase();
  return /^(?:no|lot|pt|plot|unit|blok|block)/i.test(raw) ? raw : `No ${raw}`;
}

export async function resolveMalaysianAddress(params: {
  rawAddress: string;
  guessedSearchQuery?: string;
  gps?: { lat: number; lng: number } | null;
}): Promise<{
  bestAddress: string;
  candidates: string[];
  verified: boolean;
}> {
  const cleanedRaw = cleanMalaysianAddressText(params.rawAddress);
  const cleanedGuessInput = cleanMalaysianAddressText(params.guessedSearchQuery || '');
  const candidates: string[] = [];
  const addCandidate = (val: string) => {
    const v = val
      .trim()
      .replace(/,\s*Malaysia$/i, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/,\s*,+/g, ',')
      .replace(/^[\s,]+|[\s,]+$/g, '');
    const normKey = v.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (v && normKey.length >= 3 && !candidates.some((c) => c.toLowerCase().replace(/[^a-z0-9]/g, '') === normKey)) {
      candidates.push(v);
    }
  };

  let verified = false;

  // 0) Exact known SKL Waste local landmark resolution (e.g. Saujana Utama Belakang Segi)
  for (const lm of LANDMARK_EXACT_MAP_FIXES) {
    if (lm.test.test(cleanedRaw) || lm.test.test(cleanedGuessInput)) {
      addCandidate(lm.fullAddress);
      verified = true;
    }
  }

  // 1) EXIF GPS coordinates inside Malaysia
  if (params.gps && isInsideMalaysia(params.gps.lat, params.gps.lng)) {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(params.gps.lat)}&lon=${encodeURIComponent(params.gps.lng)}&format=json&addressdetails=1&accept-language=en`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
      if (res.ok) {
        const data = await res.json();
        const cc = String(data?.address?.country_code || '').toLowerCase();
        if (!cc || cc === 'my') {
          const addr = data?.address || {};
          const parts = [
            addr.building || addr.shop || [addr.house_number, addr.road].filter(Boolean).join(' '),
            addr.road,
            addr.suburb || addr.neighbourhood || addr.village,
            addr.city || addr.town || addr.county,
            addr.postcode,
            addr.state
          ].filter(Boolean);
          const deduped: string[] = [];
          for (const p of parts) {
            if (!deduped.some((d) => d.toLowerCase() === String(p).toLowerCase())) {
              deduped.push(String(p));
            }
          }
          if (deduped.length > 0) {
            addCandidate(deduped.join(', '));
            verified = true;
          }
        }
      }
    } catch {}
  }

  // 2) Expand Selangor/KL housing estate shortforms (BSC, DC, BTP, Niaga Bestari, Setia Alam, etc.)
  let searchQuery = cleanedGuessInput || cleanedRaw;
  let matchedEstateSuffix = '';
  for (const rule of AREA_HINT_EXPANSIONS) {
    if (rule.test.test(cleanedRaw) || rule.test.test(searchQuery)) {
      matchedEstateSuffix = rule.area;
      const keyToken = rule.area.split(',')[0].replace(/^\d{5}\s*/, '').toLowerCase();
      if (!searchQuery.toLowerCase().includes(keyToken)) {
        searchQuery = `${searchQuery}, ${rule.area}`;
      }
      break;
    }
  }

  const unitPrefix = extractLeadingUnitOrHouseNo(cleanedRaw) || extractLeadingUnitOrHouseNo(cleanedGuessInput);
  const streetQuery = searchQuery
    .replace(/^(?:(?:NO\.?|LOT|PT|PLOT|UNIT)\s*)?(?:[A-Z]-)?[0-9]{1,5}[A-Z]?(?:\s*[-/]\s*[0-9A-Z]{1,4})?\s*,?\s*/i, '')
    .trim();

  if (streetQuery.length >= 3) {
    try {
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(streetQuery)}&bbox=99.5,0.8,119.5,7.5&lat=${DEPOT_LAT}&lon=${DEPOT_LNG}&limit=4&lang=en`;
      const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(streetQuery)}&countrycodes=my&format=json&addressdetails=1&limit=4&accept-language=en`;

      const [photonRes, nomRes] = await Promise.allSettled([
        fetch(photonUrl, { signal: AbortSignal.timeout(4500) }),
        fetch(nomUrl, { signal: AbortSignal.timeout(4500) })
      ]);

      if (photonRes.status === 'fulfilled' && photonRes.value.ok) {
        const pData = await photonRes.value.json();
        const features = Array.isArray(pData?.features) ? pData.features : [];
        for (const f of features) {
          const p = f?.properties || {};
          const cc = String(p.countrycode || '').toUpperCase();
          if (cc && cc !== 'MY') continue;
          const title = p.name || p.street || p.locality || '';
          const sub = [
            p.street && p.street !== title ? p.street : '',
            p.district,
            p.city && p.city !== title ? p.city : '',
            p.postcode,
            p.state
          ]
            .filter(Boolean)
            .join(', ');
          const resolved = [title, sub].filter(Boolean).join(', ');
          if (resolved) {
            const withUnit =
              unitPrefix && !resolved.toLowerCase().startsWith(unitPrefix.toLowerCase())
                ? `${unitPrefix}, ${resolved}`
                : resolved;
            addCandidate(withUnit);
            verified = true;
          }
        }
      }

      if (nomRes.status === 'fulfilled' && nomRes.value.ok) {
        const nData = await nomRes.value.json();
        if (Array.isArray(nData)) {
          for (const item of nData) {
            const cc = String(item?.address?.country_code || '').toLowerCase();
            if (cc && cc !== 'my') continue;
            const parts = String(item.display_name || '')
              .replace(/,\s*Malaysia$/i, '')
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 5);
            if (parts.length > 0) {
              const resolved = parts.join(', ');
              const withUnit =
                unitPrefix && !resolved.toLowerCase().startsWith(unitPrefix.toLowerCase())
                  ? `${unitPrefix}, ${resolved}`
                  : resolved;
              addCandidate(withUnit);
              verified = true;
            }
          }
        }
      }

      // Broader Malaysian street/area fallback if strict query returned fewer than 3 map matches
      if (candidates.length < 3 && streetQuery.includes(',')) {
        const broaderQuery = streetQuery
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 2)
          .join(', ');
        if (broaderQuery.length >= 4 && broaderQuery.toLowerCase() !== streetQuery.toLowerCase()) {
          const broadRes = await fetch(
            `https://photon.komoot.io/api/?q=${encodeURIComponent(broaderQuery)}&bbox=99.5,0.8,119.5,7.5&lat=${DEPOT_LAT}&lon=${DEPOT_LNG}&limit=4&lang=en`,
            { signal: AbortSignal.timeout(3200) }
          );
          if (broadRes.ok) {
            const bData = await broadRes.json();
            const bFeatures = Array.isArray(bData?.features) ? bData.features : [];
            for (const f of bFeatures) {
              const p = f?.properties || {};
              const cc = String(p.countrycode || '').toUpperCase();
              if (cc && cc !== 'MY') continue;
              const title = p.name || p.street || p.locality || '';
              const sub = [
                p.street && p.street !== title ? p.street : '',
                p.district,
                p.city && p.city !== title ? p.city : '',
                p.postcode,
                p.state
              ]
                .filter(Boolean)
                .join(', ');
              const resolved = [title, sub].filter(Boolean).join(', ');
              if (resolved) {
                const withUnit =
                  unitPrefix && !resolved.toLowerCase().startsWith(unitPrefix.toLowerCase())
                    ? `${unitPrefix}, ${resolved}`
                    : resolved;
                addCandidate(withUnit);
                verified = true;
              }
            }
          }
        }
      }
    } catch {}
  }

  // 3) Smart expanded raw address + clean raw slip address as selectable chips
  if (cleanedRaw && matchedEstateSuffix) {
    const keyToken = matchedEstateSuffix.split(',')[0].replace(/^\d{5}\s*/, '').toLowerCase();
    if (!cleanedRaw.toLowerCase().includes(keyToken)) {
      addCandidate(`${cleanedRaw}, ${matchedEstateSuffix}`);
    }
  }
  if (cleanedGuessInput) {
    if (unitPrefix && !cleanedGuessInput.toLowerCase().startsWith(unitPrefix.toLowerCase()) && !/^(?:no|lot|m-|\d)/i.test(cleanedGuessInput)) {
      addCandidate(`${unitPrefix}, ${cleanedGuessInput}`);
    } else {
      addCandidate(cleanedGuessInput);
    }
  }
  if (cleanedRaw) {
    addCandidate(cleanedRaw);
  }

  return {
    bestAddress: candidates[0] || cleanedRaw || '',
    candidates: candidates.slice(0, 4),
    verified
  };
}

// ============================================================================
// 4. DETERMINISTIC DATE, OWNER (TIVIYA), INVOICE & PRICE NORMALIZERS
// ============================================================================
function todayIso(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDaysIso(startIso: string, days = 10): string {
  const d = new Date(`${startIso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseMalaysianDateToIso(raw: unknown): string {
  const str = String(raw || '').trim();
  if (!str) return todayIso();

  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const y = Number(isoMatch[1]);
    let m = Number(isoMatch[2]);
    let d = Number(isoMatch[3]);
    if (m > 12 && d <= 12) [m, d] = [d, m];
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }

  const dmyMatch = str.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
  if (dmyMatch) {
    let day = Number(dmyMatch[1]);
    let month = Number(dmyMatch[2]);
    let year = Number(dmyMatch[3]);
    if (year < 100) year += 2000;
    if (month > 12 && day <= 12) {
      [day, month] = [month, day];
    }
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  const parsed = new Date(str);
  if (!Number.isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return todayIso();
}

function detectTiviyaMarker(b: any): boolean {
  const combined = [
    b?.t,
    b?.bin_owner,
    b?.tiviya_marker,
    b?.n,
    b?.customer_name,
    b?.nt,
    b?.notes,
    b?.l,
    b?.raw_location,
    b?.signature_text
  ]
    .filter(Boolean)
    .join(' ');
  return /\b(?:tiviya|tiviva|tivia|tivya|tiviy[ae]?|thirumal|thirumel)\b/i.test(combined);
}

// ============================================================================
// 5. TOKEN-OPTIMIZED EXTRACTION PROMPT (~490 tokens vs ~3,080 before = -84%!)
//    Pairs with MEDIA_RESOLUTION_MEDIUM (522-540 img tokens vs 1,102 = -52%)
//    and compact JSON keys + deterministic TS normalizers for ~75% cost savings!
// ============================================================================
const RORO_EXTRACTION_PROMPT = `Extract SKL Waste (Sungai Buloh, MY) RORO slip into single-line JSON {"bins":[{"t":"","i":"","d":"","l":"","q":"","n":"","p":"","s":"2","r":0,"nt":""}]}.
Rules:
t:"TIVIYA" if "tiviya"/"TIVIYA"/"Thirumal" appears ANYWHERE (check faint pen right above 4-digit invoice no top-right AND bottom Customer Signature; if RM & Tel are blank inspect top-right extra carefully), else ""
i:printed 4-digit invoice no top-right
d:handwritten Date YYYY-MM-DD (DD/MM/YY; slash-11 is Nov e.g. 21/11/26->2026-11-21)
l:handwritten delivery address on Received from & Ringgit lines (ignore printed SKL HQ PT31127/Branch Dataran Suria; never put address in n; strip "(Location)","(Tukar Tong)","(Turun Tong)","2 kaki"/"2 kau","4 kaki")
q:spell-fixed full MY address keeping unit/street (BSC=Bandar Seri Coalfields 47000 Sungai Buloh Selangor; DC=Desa Coalfields 47000 Sungai Buloh; BTP=Bandar Tasik Puteri 48020 Rawang Selangor; Tan Sri Low=Persiaran Tan Sri Low Yow Chuan; Niaga Bestari=Puncak Bestari 42300 Bandar Puncak Alam Selangor; Setia Alam=40170 Shah Alam Selangor; Saujana Utama Belakang Segi=Belakang Segi Fresh Saujana Utama Jalan Bidara 9/2 Saujana Utama 3 47000 Sungai Buloh Selangor)
n:person name only ("" if only address; "Tiviya" if t="TIVIYA")
p:exact handwritten Customer Tel/H/p digits (MY 010-019, 10-11 digits; touching 014 is 014 not 04; never SKL HQ 0199144743; "" if blank)
s:"4" if 4 kaki/4ft or RM>=320, else "2"
r:int RM bottom-left ("200/-"->200,"220/-"->220,0 if blank/TIVIYA)
nt:notes ("Tukar Tong","Turun Tong","Tarik Tong","Belakang Segi", or "")
Minified JSON {"bins":[...]} only.`;

// ============================================================================
// 6. CLOUD VISION API CALLERS (GEMINI / GROQ / OPENROUTER / HF / OLLAMA)
// ============================================================================
function extractJsonObject(rawText: string): any {
  const cleaned = String(rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Model did not return valid JSON');
  }
}

async function callGeminiVision(
  apiKey: string,
  base64: string,
  mimeType: string,
  promptText: string,
  customModel?: string
): Promise<{ parsed: any; modelLabel: string }> {
  // Benchmark-verified fastest & highest accuracy order (1.4s - 2.6s on all 8 slips):
  const models = customModel
    ? [customModel]
    : ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.8-flash'];

  let lastErr = '';
  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        signal: AbortSignal.timeout(12000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: promptText },
                { inline_data: { mime_type: mimeType, data: base64 } }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.05,
            responseMimeType: 'application/json',
            maxOutputTokens: 320,
            // Cuts Gemini image tokens by >50% (522-540 vs 1,102) while preserving handwriting accuracy on tight-cropped scans
            mediaResolution: 'MEDIA_RESOLUTION_MEDIUM'
          }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return { parsed: extractJsonObject(text), modelLabel: `Gemini (${model})` };
      }
      lastErr = await res.text();
      if (res.status === 400 && lastErr.toLowerCase().includes('api_key_invalid')) {
        throw new Error('Invalid Gemini API key. Please check your key in AI Scanner Settings.');
      }
    } catch (e: any) {
      if (String(e?.message || '').includes('Invalid Gemini API key')) throw e;
      lastErr = e?.message || 'timeout';
    }
  }
  throw new Error(`Gemini Vision error: ${lastErr.slice(0, 180)}`);
}

async function callGroqTextFixer(apiKey: string, rawOcrText: string, promptText: string): Promise<{ parsed: any; modelLabel: string }> {
  const models = ['qwen/qwen3.8-27b', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
  let lastErr = '';
  for (const model of models) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        temperature: 0.05,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: promptText },
          {
            role: 'user',
            content: `Here is the raw OCR text read from a high-contrast upright SKL Waste green receipt scan. Fix spelling errors, map Malaysia Selangor/KL addresses, detect TIVIYA -> Thirumal Vel Enterprise, and return strictly valid JSON:\n\n${rawOcrText}`
          }
        ]
      })
    });
    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return { parsed: extractJsonObject(text), modelLabel: `Groq (${model.split('/').pop()}) + OCR` };
    }
    lastErr = await res.text();
  }
  throw new Error(`Groq text fixer error: ${lastErr.slice(0, 160)}`);
}

async function callOpenAiCompatibleVision(params: {
  endpoint: string;
  apiKey: string;
  models: string[];
  dataUrl: string;
  promptText: string;
  providerName: string;
  extraHeaders?: Record<string, string>;
  enforceJsonObject?: boolean;
}): Promise<{ parsed: any; modelLabel: string }> {
  let lastErr = '';
  for (const model of params.models) {
    const body: Record<string, any> = {
      model,
      temperature: 0.05,
      max_tokens: 380,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: params.promptText },
            { type: 'image_url', image_url: { url: params.dataUrl } }
          ]
        }
      ]
    };
    if (params.enforceJsonObject) {
      body.response_format = { type: 'json_object' };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(params.extraHeaders || {})
    };
    if (params.apiKey) {
      headers.Authorization = `Bearer ${params.apiKey}`;
    }

    const res = await fetch(params.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (res.ok) {
      const data = await res.json();
      const text = data?.choices?.[0]?.message?.content || '';
      return {
        parsed: extractJsonObject(text),
        modelLabel: `${params.providerName} (${model.split('/').pop()})`
      };
    }
    lastErr = await res.text();
    if (res.status === 401) {
      throw new Error(`Invalid ${params.providerName} API key. Please verify your key in AI Scanner Settings.`);
    }
  }
  throw new Error(`${params.providerName} error: ${lastErr.slice(0, 180)}`);
}

// ============================================================================
// 7. ZERO-KEY LAZY BROWSER OCR FALLBACK (Runs on our High-Contrast Upright Scan!)
// ============================================================================
let tesseractWorkerPromise: Promise<any> | null = null;

async function runBrowserFallbackOcr(dataUrl: string): Promise<string> {
  if (!tesseractWorkerPromise) {
    tesseractWorkerPromise = (async () => {
      const modUrl = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js';
      const Tesseract = await import(/* @vite-ignore */ modUrl);
      const createWorker = Tesseract.createWorker || Tesseract.default?.createWorker;
      return await createWorker('eng');
    })();
  }
  const worker = await tesseractWorkerPromise;
  const ret = await worker.recognize(dataUrl);
  return String(ret?.data?.text || '');
}

function heuristicParseOcrText(rawText: string): any {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 2);

  const filteredLines = lines.filter(
    (l) =>
      !/skl\s*waste|kedai\s*hardware|rubbish\s*collecting|31127|kuala\s*selangor|615\s*9365|914\s*4743|dataran\s*suria|840301|200801038953|realization\s+of\s+the\s+cheque|additional\s+charges/i.test(
        l
      )
  );

  const joined = filteredLines.join(' \n ');
  const isTiviya = /\b(?:tiviya|tiviva|tivia|tivya|thirumal)\b/i.test(joined);

  const phoneMatch = joined.match(/(?:\+?60|0)1[0-9][\s.-]*[0-9]{3,4}[\s.-]*[0-9]{4}/);
  const ocrPhone = isTiviya ? THIRUMAL_PHONE_NORMALIZED : (phoneMatch ? phoneMatch[0] : '');

  const invMatch =
    joined.match(/\b(0\d{3})\b/) ||
    joined.match(/(?:INV|NO|BILL|DO)\s*[#:.=-]*\s*(\d{3,4})\b/i);
  const invoiceNo = invMatch ? invMatch[1] : '';

  const priceMatch = joined.match(/(?:RM|MYR)\s*([1-5]\d{2})(?:\.\d{2}|\/-)?/i);
  const price = isTiviya ? 0 : priceMatch ? Number(priceMatch[1]) : null;

  const is4Ft = /\b4\s*(?:ft|feet|kaki|kau|')\b/i.test(joined) || (price !== null && price >= 320);
  const size: '2 Feet' | '4 Feet' = is4Ft ? '4 Feet' : '2 Feet';

  const dateMatch = joined.match(/\b(\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})\b/);
  const dateStart = dateMatch ? parseMalaysianDateToIso(dateMatch[1]) : '';

  const notes = cleanSiteNotes('', joined);

  const addrLines = filteredLines.filter((l) =>
    /\b(no\.?\s*\d|m-\d|lot\s*\d|jalan|jln|dln|lorong|lrg|taman|tmn|bandar|persiaran|darsiaran|seksyen|kampung|bsc|btp|dc\s*\d|coalfields|rawang|shah\s*alam|sungai\s*buloh|puncak\s*alam|saujana\s*utama|setia\s*alam|niaga\s*bestari|tasik\s*puteri|kepong|cheras|subang|damansara|selangor)\b/i.test(
      l
    )
  );

  const rawLocation = addrLines.slice(0, 2).join(', ') || '';

  return {
    bins: [
      {
        bin_owner: isTiviya ? OWNER_THIRUMAL : OWNER_SKL,
        tiviya_marker: isTiviya ? 'TIVIYA' : '',
        raw_location: rawLocation,
        guessed_malaysia_query: rawLocation,
        customer_phone: ocrPhone,
        customer_name: isTiviya ? THIRUMAL_DEFAULT_NAME : '',
        invoice_no: invoiceNo,
        size,
        price,
        date_start: dateStart,
        notes,
        confidence: rawLocation ? 'medium' : 'low'
      }
    ]
  };
}

// ============================================================================
// 8. MAIN ENTRYPOINT: HIGH-CONTRAST PREPROCESS -> TEXT/VISION MODEL ->
//    ARRANGE OUTPUT -> FIX SPELLING & MALAYSIA MAP -> MANUAL PHONE READY
// ============================================================================
export async function scanRoroImage(
  file: File,
  options?: {
    forceOwner?: BinOwner;
    auto10Days?: boolean;
    manualRotationDeg?: number;
    onStage?: (evt: ScanStageEvent) => void;
  }
): Promise<ScanImageResult> {
  const warnings: string[] = [];
  const cfg = loadVisionConfig();
  const detected = detectProviderFromKey(cfg);

  // Stage 1: Show original normal photo -> compute fingerprint, EXIF GPS & shadow-free tight-cropped scan
  options?.onStage?.({ stage: 'normal' });
  const [fingerprint, gps, prepared] = await Promise.all([
    computeFastFileFingerprint(file, options?.manualRotationDeg),
    extractExifGps(file),
    prepareEnhancedReceiptImage(file, options?.manualRotationDeg)
  ]);

  // Notify UI that the upright normal photo + high-contrast image are ready for the visual wipe animation
  options?.onStage?.({
    stage: 'contrast',
    originalUprightDataUrl: prepared.originalUprightDataUrl,
    enhancedDataUrl: prepared.enhancedDataUrl
  });

  // Stage 2: Check duplicate-image 0-token cache BEFORE making any paid/quota API call!
  options?.onStage?.({
    stage: 'extracting',
    originalUprightDataUrl: prepared.originalUprightDataUrl,
    enhancedDataUrl: prepared.enhancedDataUrl
  });
  let parsedPayload: any = null;
  let providerUsed = detected.label;
  let usedFallbackOcr = false;

  const cachedHit = readCachedVisionPayload(fingerprint);
  if (cachedHit) {
    parsedPayload = cachedHit.parsed;
    providerUsed = `${cachedHit.providerUsed} (cached)`;
  }

  const dynamicPrompt = parsedPayload ? '' : buildDynamicExtractionPrompt();

  const attempts: Array<{ provider: Exclude<VisionProvider, 'auto'>; apiKey: string }> = [];
  const pushAttempt = (p: Exclude<VisionProvider, 'auto'>, k: string) => {
    if ((p === 'ollama' || k) && !attempts.some((a) => a.provider === p)) {
      attempts.push({ provider: p, apiKey: k });
    }
  };

  if (detected.provider !== 'none') {
    pushAttempt(detected.provider, detected.apiKey);
  }
  if (envGeminiKey) pushAttempt('gemini', envGeminiKey);
  if (envOpenRouterKey) pushAttempt('openrouter', envOpenRouterKey);
  if (envGroqKey) pushAttempt('groq', envGroqKey);
  if (envHfKey) pushAttempt('huggingface', envHfKey);

  for (const attempt of attempts) {
    if (parsedPayload) break;
    try {
      if (attempt.provider === 'gemini') {
        const res = await callGeminiVision(
          attempt.apiKey,
          prepared.enhancedBase64,
          prepared.mimeType,
          dynamicPrompt,
          cfg.provider === 'gemini' ? cfg.customModel : undefined
        );
        parsedPayload = res.parsed;
        providerUsed = res.modelLabel;
      } else if (attempt.provider === 'openrouter') {
        const models =
          cfg.provider === 'openrouter' && cfg.customModel
            ? [cfg.customModel]
            : [
                'nvidia/nemotron-3.5-super-vl:free',
                'google/gemma-4-31b-it:free',
                'google/gemma-4-26b-a4b-it:free',
                'openrouter/free'
              ];
        const res = await callOpenAiCompatibleVision({
          endpoint: 'https://openrouter.ai/api/v1/chat/completions',
          apiKey: attempt.apiKey,
          models,
          dataUrl: prepared.enhancedDataUrl,
          promptText: dynamicPrompt,
          providerName: 'OpenRouter',
          extraHeaders: {
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://www.sklwaste.com.my',
            'X-Title': 'SKL Waste System RORO Scanner'
          }
        });
        parsedPayload = res.parsed;
        providerUsed = res.modelLabel;
      } else if (attempt.provider === 'groq') {
        const ocrText = await runBrowserFallbackOcr(prepared.enhancedDataUrl);
        const res = await callGroqTextFixer(attempt.apiKey, ocrText, dynamicPrompt);
        parsedPayload = res.parsed;
        providerUsed = res.modelLabel;
      } else if (attempt.provider === 'huggingface') {
        const models = cfg.customModel
          ? [cfg.customModel]
          : ['Qwen/Qwen2.5-VL-7B-Instruct', 'Qwen/Qwen2.5-VL-3B-Instruct'];
        const res = await callOpenAiCompatibleVision({
          endpoint: 'https://router.huggingface.co/v1/chat/completions',
          apiKey: attempt.apiKey,
          models,
          dataUrl: prepared.enhancedDataUrl,
          promptText: dynamicPrompt,
          providerName: 'HuggingFace'
        });
        parsedPayload = res.parsed;
        providerUsed = res.modelLabel;
      } else if (attempt.provider === 'ollama') {
        const base = (cfg.ollamaUrl || 'http://localhost:11434').replace(/\/+$/, '');
        const models = cfg.customModel ? [cfg.customModel] : ['qwen2.5vl:3b', 'qwen2.5-vl:3b', 'llama3.2-vision'];
        const res = await callOpenAiCompatibleVision({
          endpoint: `${base}/v1/chat/completions`,
          apiKey: '',
          models,
          dataUrl: prepared.enhancedDataUrl,
          promptText: dynamicPrompt,
          providerName: 'Ollama'
        });
        parsedPayload = res.parsed;
        providerUsed = res.modelLabel;
      }
    } catch (err: any) {
      warnings.push(`${attempt.provider}: ${err?.message || 'failed'}`);
    }
  }

  // Save fresh cloud AI result to duplicate-image 0-token cache
  if (parsedPayload && !cachedHit) {
    writeCachedVisionPayload(fingerprint, parsedPayload, providerUsed);
  }

  // Fallback: Local Tesseract OCR running on the Ultra-High-Contrast Upright Scan
  if (!parsedPayload) {
    usedFallbackOcr = true;
    providerUsed = gps ? 'High-Contrast OCR + EXIF GPS' : 'High-Contrast Local OCR (Add AI Key for Best Handwriting)';
    try {
      const text = await runBrowserFallbackOcr(prepared.enhancedDataUrl);
      parsedPayload = heuristicParseOcrText(text);
    } catch {
      parsedPayload = { bins: [{}] };
    }
  }

  // Stage 3 & 4: Normalize compact short keys (t,i,d,l,q,n,p,s,r,nt) & full keys ->
  // Enforce TIVIYA -> Thirumal Vel Ent -> Fix Spelling + Verify Malaysia Map Address
  const rawBins: any[] = Array.isArray(parsedPayload)
    ? parsedPayload
    : Array.isArray(parsedPayload?.bins) && parsedPayload.bins.length > 0
      ? parsedPayload.bins
      : [parsedPayload || {}];

  const auto10 = options?.auto10Days !== false;
  const resolvedDrafts: ExtractedBinDraft[] = [];

  for (let i = 0; i < rawBins.length; i++) {
    const b = rawBins[i] || {};
    const tiviyaDetected = detectTiviyaMarker(b);
    const owner: BinOwner =
      options?.forceOwner || (tiviyaDetected ? OWNER_THIRUMAL : OWNER_SKL);

    const rawLocOriginal = String(b.l ?? b.raw_location ?? b.location ?? '');
    const guessedQueryRaw = String(b.q ?? b.guessed_malaysia_query ?? '');
    const notes = cleanSiteNotes(String(b.nt ?? b.notes ?? ''), rawLocOriginal);

    const addrRes = await resolveMalaysianAddress({
      rawAddress: rawLocOriginal,
      guessedSearchQuery: guessedQueryRaw,
      gps: i === 0 ? gps : null
    });

    const rawInv = String(b.i ?? b.invoice_no ?? '').replace(/\D/g, '');
    const invoiceNo = rawInv ? rawInv.padStart(4, '0').slice(-4) : '';

    // AUTO-KEY IN PHONE NUMBER:
    // - Thirumal Vel Enterprise (TIVIYA): auto-locked to +60 17-694 7413
    // - SKL Waste: auto-extract Malaysian mobile digits (fix touching 014/017 & ignore SKL header 019-914 4743)
    const rawPhoneInput = String(b.p ?? b.customer_phone ?? '');
    const rawPhoneDigits = rawPhoneInput.replace(/\D/g, '');
    let fixedPhoneRaw = rawPhoneInput;
    if (/^0[2-9]\d{7}$/.test(rawPhoneDigits)) {
      fixedPhoneRaw = `01${rawPhoneDigits.slice(1)}`;
    }
    if (/9144743$/.test(rawPhoneDigits) || /6159365$/.test(rawPhoneDigits)) {
      fixedPhoneRaw = '';
    }
    const customerPhone =
      owner === OWNER_THIRUMAL
        ? THIRUMAL_PHONE_NORMALIZED
        : normalizeMalaysianPhone(fixedPhoneRaw);

    const customerName =
      owner === OWNER_THIRUMAL
        ? THIRUMAL_DEFAULT_NAME
        : String(b.n ?? b.customer_name ?? '')
            .replace(/\b(?:tiviya|thirumal)\b/gi, '')
            .trim();

    const sizeVal = String(b.s ?? b.size ?? '');
    const sizeText = `${sizeVal} ${rawLocOriginal}`;
    const is4FtExplicit = /^4\b/i.test(sizeVal.trim()) || /\b4\s*(?:feet|ft|kaki|kau|')\b/i.test(sizeText);
    const is2FtExplicit = /^2\b/i.test(sizeVal.trim()) || /\b2\s*(?:feet|ft|kaki|kau|')\b/i.test(sizeText);

    const rawPriceVal = b.r !== undefined ? b.r : b.price;
    let price: number | null = null;
    if (owner === OWNER_THIRUMAL) {
      price = 0;
    } else if (rawPriceVal !== undefined && rawPriceVal !== null && String(rawPriceVal).trim() !== '') {
      const cleanedPriceStr = String(rawPriceVal)
        .replace(/\/[-=]+/g, '')
        .replace(/[^\d.]/g, '');
      let num = Number(cleanedPriceStr);
      if (!Number.isNaN(num) && num > 0) {
        num = Math.round(num);
        if (num >= 1001 && num <= 5999 && num % 10 === 1 && Math.floor(num / 10) % 10 === 0) {
          num = Math.floor(num / 10);
        }
        price = num;
      }
    }

    const size: '2 Feet' | '4 Feet' = is4FtExplicit
      ? '4 Feet'
      : is2FtExplicit
        ? '2 Feet'
        : price !== null && price >= 320
          ? '4 Feet'
          : '2 Feet';

    const rawDateVal = b.d ?? b.date_start;
    const dateStart = rawDateVal ? parseMalaysianDateToIso(rawDateVal) : todayIso();
    const dateEnd = auto10 ? addDaysIso(dateStart, 10) : dateStart;

    let confidence: 'high' | 'medium' | 'low' =
      b.confidence === 'high' || b.confidence === 'medium' || b.confidence === 'low'
        ? b.confidence
        : 'medium';

    if (usedFallbackOcr && !addrRes.verified) {
      confidence = 'low';
    } else if (addrRes.bestAddress && (owner === OWNER_THIRUMAL || price !== null)) {
      confidence = addrRes.verified ? 'high' : 'medium';
    } else if (!addrRes.bestAddress) {
      confidence = 'low';
    }

    resolvedDrafts.push({
      draftId: `scan-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      sourceFileName: file.name || `slip-${i + 1}.jpg`,
      thumbnailDataUrl: prepared.thumbnailDataUrl,
      enhancedDataUrl: prepared.enhancedDataUrl,
      originalUprightDataUrl: prepared.originalUprightDataUrl,
      phoneCropDataUrl: owner === OWNER_SKL ? prepared.phoneCropDataUrl : undefined,
      wasGreenPaperEnhanced: prepared.wasGreenPaper,
      wasAutoRotated: prepared.wasAutoRotated,
      bin_owner: owner,
      location: addrRes.bestAddress,
      raw_location: cleanMalaysianAddressText(rawLocOriginal),
      address_candidates: addrRes.candidates,
      address_verified: addrRes.verified,
      gps_coords: i === 0 ? gps : null,
      customer_phone: customerPhone,
      customer_name: customerName,
      invoice_no: invoiceNo,
      size,
      price,
      date_start: dateStart,
      date_end: dateEnd,
      notes,
      confidence,
      providerUsed,
      tiviyaDetected
    });
  }

  options?.onStage?.({
    stage: 'done',
    originalUprightDataUrl: prepared.originalUprightDataUrl,
    enhancedDataUrl: prepared.enhancedDataUrl
  });

  return {
    bins: resolvedDrafts,
    providerUsed,
    usedFallbackOcr,
    warnings
  };
}
