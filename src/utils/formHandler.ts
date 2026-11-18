export type SubmissionResult = {
  ok: boolean;
  mode: 'webhook' | 'unconfigured';
  message: string;
};

/**
 * Submits form enquiry payload to a webhook endpoint if configured.
 *
 * NOTE: Phase 1 static deployment architecture does not have a default active backend webhook.
 * This function ONLY performs a POST request when `endpointUrl` is non-empty.
 * When `endpointUrl` is empty or unconfigured, it honestly returns `{ ok: false, mode: 'unconfigured' }`
 * so the client UI can direct the user to transparent dispatch channels (email mailto, phone call, copy).
 * It NEVER simulates a fake successful server submission.
 */
export async function submitEnquiryForm(
  endpointUrl: string,
  payload: Record<string, unknown>
): Promise<SubmissionResult> {
  const trimmedUrl = endpointUrl ? endpointUrl.trim() : '';

  if (trimmedUrl.length === 0) {
    return {
      ok: false,
      mode: 'unconfigured',
      message: 'No webhook endpoint is configured for automated form submissions. Please dispatch your enquiry via direct email, telephone, or copy the formatted details.',
    };
  }

  try {
    const response = await fetch(trimmedUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      return {
        ok: false,
        mode: 'webhook',
        message: `Submission failed with server status ${response.status} (${response.statusText || 'Error'}).`,
      };
    }

    return {
      ok: true,
      mode: 'webhook',
      message: 'Enquiry submitted successfully via webhook.',
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown network error';
    return {
      ok: false,
      mode: 'webhook',
      message: `Failed to submit enquiry to webhook endpoint: ${errorMessage}`,
    };
  }
}
