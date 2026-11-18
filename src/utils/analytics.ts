import { analyticsConfig } from '../data/seo';

export type CanonicalConversionEventName =
  | 'phone_click'
  | 'email_click'
  | 'whatsapp_click'
  | 'quote_form_start'
  | 'generate_lead'
  | 'select_tong_roro'
  | 'contact_cta_click'
  | 'service_area_Filter'
  | 'service_area_filter';

export type LegacyConversionEventName =
  | 'telephone_click'
  | 'quotation_form_submit'
  | 'contact_form_submit'
  | 'product_select'
  | 'primary_cta_click';

export type ConversionEventName = CanonicalConversionEventName | LegacyConversionEventName;

export type EventMetadata = Record<string, string | number | boolean>;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

export const EVENT_ALIAS_MAP: Record<string, CanonicalConversionEventName> = {
  telephone_click: 'phone_click',
  quotation_form_submit: 'generate_lead',
  contact_form_submit: 'generate_lead',
  product_select: 'select_tong_roro',
  primary_cta_click: 'contact_cta_click'
};

const PROHIBITED_PII_KEYS = new Set([
  'name',
  'customername',
  'phone',
  'phonenumber',
  'email',
  'customeremail',
  'address',
  'deliverylocation',
  'location',
  'message',
  'additionalrequirements',
  'additionalnotes',
  'requirements',
  'note',
  'websiteurl'
]);

// 400ms module-scope deduplication guard
let lastEventKey = '';
let lastEventTimestamp = 0;

function sanitizeMetadata(metadata?: EventMetadata): Record<string, string | number | boolean> {
  if (!metadata) return {};
  const clean: Record<string, string | number | boolean> = {};
  for (const [key, val] of Object.entries(metadata)) {
    const normalizedKey = key.toLowerCase().replace(/[^a-z]/g, '');
    if (!PROHIBITED_PII_KEYS.has(normalizedKey)) {
      if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
        clean[key] = val;
      }
    }
  }
  return clean;
}

export function trackConversionEvent(
  eventName: ConversionEventName,
  metadata?: EventMetadata
): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const canonicalEvent = EVENT_ALIAS_MAP[eventName] ?? (eventName as CanonicalConversionEventName);
  const safeMetadata = sanitizeMetadata(metadata);

  // Deduplication check (400ms window on identical event + identifier)
  const dedupIdentifier = String(
    metadata?.label ?? metadata?.product_id ?? metadata?.method ?? metadata?.destination ?? ''
  );
  const eventKey = `${canonicalEvent}::${dedupIdentifier}`;
  if (eventKey === lastEventKey && now - lastEventTimestamp < 400) {
    return;
  }
  lastEventKey = eventKey;
  lastEventTimestamp = now;

  // Localhost test mode detection
  const isLocalhost =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    safeMetadata.test_mode = true;
  }

  const payload: Record<string, unknown> = {
    event: canonicalEvent,
    original_event: eventName,
    ...safeMetadata,
    timestamp: new Date().toISOString()
  };

  // 1. Push to Google Tag Manager dataLayer if active
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }

  // 2. Push to GA4 gtag if active
  if (typeof window.gtag === 'function') {
    window.gtag('event', canonicalEvent, safeMetadata);

    // 3. Google Ads Conversion firing on generate_lead
    if (
      canonicalEvent === 'generate_lead' &&
      analyticsConfig.googleAdsId &&
      analyticsConfig.googleAdsConversionLabel
    ) {
      window.gtag('event', 'conversion', {
        send_to: `${analyticsConfig.googleAdsId}/${analyticsConfig.googleAdsConversionLabel}`,
        value: 1.0,
        currency: 'MYR'
      });
    }
  }

  // 4. Dispatch custom browser event for in-page listener hooks
  try {
    const customEvt = new CustomEvent('skl:conversion', {
      detail: {
        eventName: canonicalEvent,
        originalEventName: eventName,
        metadata: safeMetadata,
        timestamp: payload.timestamp
      }
    });
    window.dispatchEvent(customEvt);
  } catch {
    // Ignore environments where CustomEvent might fail
  }
}
