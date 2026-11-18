export interface FormsIntegrationConfig {
  isBackendConfigured: boolean;
  quotationEndpointUrl: string;
  contactEndpointUrl: string;
  recipientEmail: string;
  recipientName: string;
  integrationRequirementNote: string;
}

export const formsConfig: FormsIntegrationConfig = {
  isBackendConfigured: false,
  quotationEndpointUrl: import.meta.env.PUBLIC_QUOTATION_WEBHOOK_URL ?? '',
  contactEndpointUrl: import.meta.env.PUBLIC_CONTACT_WEBHOOK_URL ?? '',
  recipientEmail: 'tongroroservissklwaste@gmail.com',
  recipientName: 'Mr Hari',
  integrationRequirementNote:
    'Phase 1 static architecture: configure PUBLIC_QUOTATION_WEBHOOK_URL / PUBLIC_CONTACT_WEBHOOK_URL or connect a serverless email/API endpoint for automated submission. Until configured, validated enquiries dispatch via email (mailto:tongroroservissklwaste@gmail.com), clipboard copy, or direct telephone call (+60 16-615 9365).'
};
