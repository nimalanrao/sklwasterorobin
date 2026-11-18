import type { QuotationFormPayload, ContactFormPayload } from './validators';

/**
 * Formats a plain text summary of a quotation request.
 */
export function formatQuotationSummaryText(payload: QuotationFormPayload): string {
  const lines: string[] = [
    '--- SKL WASTE SDN BHD: TONG RORO QUOTATION REQUEST ---',
    `Customer Name: ${payload.customerName.trim()}`,
    `Phone Number: ${payload.phoneNumber.trim()}`,
  ];

  if (payload.customerEmail && payload.customerEmail.trim()) {
    lines.push(`Email: ${payload.customerEmail.trim()}`);
  }

  lines.push(
    `Tong Roro Size: ${payload.tongRoroSize.trim()}`,
    `Delivery Location: ${payload.deliveryLocation.trim()}`,
    `Preferred Delivery Date: ${payload.preferredDeliveryDate.trim()}`,
    `Rental Duration: ${payload.rentalDuration.trim()}`,
    `Waste Type: ${payload.wasteType.trim()}`,
    `Additional Requirements: ${payload.additionalRequirements && payload.additionalRequirements.trim() ? payload.additionalRequirements.trim() : 'None'}`,
    '-------------------------------------------------------',
    'Note: Rental rates are provisional (RM2XX / RM3XX–RM4XX for 10 days). Delivery and collection charges are not confirmed and not claimed included. Final quotation must be confirmed with Mr Hari (+60 16-615 9365).'
  );

  return lines.join('\n');
}

/**
 * Builds a mailto URL for submitting a quotation request via email.
 */
export function buildQuotationMailtoUrl(email: string, payload: QuotationFormPayload): string {
  const subject = `Tong Roro Quotation Request - ${payload.customerName.trim()}`;
  const body = formatQuotationSummaryText(payload);
  const targetEmail = (email || '').trim();

  return `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Formats a plain text summary of a contact enquiry.
 */
export function formatContactSummaryText(payload: ContactFormPayload): string {
  const lines: string[] = [
    '--- SKL WASTE SDN BHD: CONTACT ENQUIRY ---',
    `Name: ${payload.name.trim()}`,
    `Phone: ${payload.phone.trim()}`,
    `Email: ${payload.email && payload.email.trim() ? payload.email.trim() : 'Not provided'}`,
    `Subject: ${payload.subject.trim()}`,
    'Message:',
    payload.message.trim(),
    '------------------------------------------',
    'Contact Person: Mr Hari (+60 16-615 9365 / tongroroservissklwaste@gmail.com)'
  ];

  return lines.join('\n');
}

/**
 * Builds a mailto URL for sending a contact enquiry via email.
 */
export function buildContactMailtoUrl(email: string, payload: ContactFormPayload): string {
  const subject = `Contact Enquiry: ${payload.subject.trim()} - ${payload.name.trim()}`;
  const body = formatContactSummaryText(payload);
  const targetEmail = (email || '').trim();

  return `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Builds a privacy-safe WhatsApp enquiry URL containing ONLY non-PII service parameters.
 * Never includes customer name, phone number, or email address in the query string.
 */
export function buildWhatsAppEnquiryUrl(
  rawNumber: string,
  payload: {
    tongRoroSize?: string;
    deliveryLocation?: string;
    preferredDeliveryDate?: string;
    wasteType?: string;
    rentalDuration?: string;
  }
): string {
  const cleanNumber = (rawNumber || '').replace(/\D/g, '') || '60166159365';
  const size = payload.tongRoroSize && payload.tongRoroSize.trim() ? payload.tongRoroSize.trim() : 'To be confirmed';
  const duration = payload.rentalDuration && payload.rentalDuration.trim() ? payload.rentalDuration.trim() : '10 days';
  const location = payload.deliveryLocation && payload.deliveryLocation.trim() ? payload.deliveryLocation.trim() : 'To be confirmed';
  const date = payload.preferredDeliveryDate && payload.preferredDeliveryDate.trim() ? payload.preferredDeliveryDate.trim() : 'To be confirmed';
  const waste = payload.wasteType && payload.wasteType.trim() ? payload.wasteType.trim() : 'To be confirmed';

  const message = [
    'Salam / Hello Mr Hari (SKL Waste Sdn Bhd), saya ingin mendapatkan sebut harga sewaan Tong Roro:',
    `- Saiz Tong Roro: ${size}`,
    `- Tempoh Sewaan: ${duration}`,
    `- Lokasi Penghantaran: ${location}`,
    `- Tarikh Penghantaran Pilihan: ${date}`,
    `- Jenis Sisa: ${waste}`,
  ].join('\n');

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}
