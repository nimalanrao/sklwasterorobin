export interface QuotationFormPayload {
  customerName: string;
  phoneNumber: string;
  customerEmail?: string;
  tongRoroSize: string;
  deliveryLocation: string;
  preferredDeliveryDate: string;
  rentalDuration: string;
  wasteType: string;
  additionalRequirements: string;
  websiteUrl?: string;
}

export interface ContactFormPayload {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  message: string;
  websiteUrl?: string;
}

/**
 * Validates an optional email address.
 * Returns true if empty/undefined, or if non-empty and matches standard email format.
 */
export function isValidOptionalEmail(value?: string): boolean {
  if (!value || !value.trim()) {
    return true;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/**
 * Validates phone number format by stripping non-digits and checking for 9 to 15 digits.
 */
export function isValidPhoneFormat(raw?: string): boolean {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

/**
 * Validates the quotation form payload.
 * Validates honeypot websiteUrl, non-empty customerName, phoneNumber (9–15 digits),
 * optional customerEmail format, tongRoroSize, deliveryLocation, preferredDeliveryDate,
 * rentalDuration, and wasteType.
 */
export function validateQuotationPayload(payload: QuotationFormPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (payload.websiteUrl && payload.websiteUrl.trim().length > 0) {
    errors.push('Automated spam check triggered. Submission blocked.');
  }

  if (!payload.customerName || !payload.customerName.trim()) {
    errors.push('Customer name is required.');
  }

  if (!isValidPhoneFormat(payload.phoneNumber)) {
    errors.push('Please enter a valid Malaysian or international phone number (9–15 digits).');
  }

  if (!isValidOptionalEmail(payload.customerEmail)) {
    errors.push('Please enter a valid email address.');
  }

  if (!payload.tongRoroSize || !payload.tongRoroSize.trim()) {
    errors.push('Tong Roro size is required.');
  }

  if (!payload.deliveryLocation || !payload.deliveryLocation.trim()) {
    errors.push('Delivery location is required.');
  }

  if (!payload.preferredDeliveryDate || !payload.preferredDeliveryDate.trim()) {
    errors.push('Preferred delivery date is required.');
  }

  if (!payload.rentalDuration || !payload.rentalDuration.trim()) {
    errors.push('Rental duration is required.');
  }

  if (!payload.wasteType || !payload.wasteType.trim()) {
    errors.push('Waste type is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates the contact form payload.
 * Validates honeypot websiteUrl, non-empty name, phone (9–15 digits),
 * optional email format, subject, and message.
 */
export function validateContactPayload(payload: ContactFormPayload): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (payload.websiteUrl && payload.websiteUrl.trim().length > 0) {
    errors.push('Automated spam check triggered. Submission blocked.');
  }

  if (!payload.name || !payload.name.trim()) {
    errors.push('Name is required.');
  }

  if (!isValidPhoneFormat(payload.phone)) {
    errors.push('Please enter a valid Malaysian or international phone number (9–15 digits).');
  }

  if (!isValidOptionalEmail(payload.email)) {
    errors.push('Please enter a valid email address.');
  }

  if (!payload.subject || !payload.subject.trim()) {
    errors.push('Subject is required.');
  }

  if (!payload.message || !payload.message.trim()) {
    errors.push('Message is required.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
