export class ApiError extends Error {
  readonly status: number;
  readonly contentType: string;
  readonly isNonJson: boolean;

  constructor(
    message: string,
    options: { status?: number; contentType?: string; isNonJson?: boolean } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status ?? 0;
    this.contentType = options.contentType ?? '';
    this.isNonJson = options.isNonJson ?? false;
  }
}

interface JsonRequestOptions {
  timeoutMs?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

function getFriendlyStatusMessage(status: number, isHtml: boolean, redirected: boolean): string {
  if (status === 401 || status === 403 || redirected) {
    return 'Your session may have expired or requires refreshing. Please reload the page and try again.';
  }
  if (status === 404) {
    return 'The FirstStep reflection service could not be reached right now. Please refresh the page or try again shortly.';
  }
  if (status === 429) {
    return 'FirstStep is experiencing high demand right now. Please pause a moment and try again.';
  }
  if (status === 502 || status === 503 || status === 504) {
    return 'The FirstStep server is temporarily busy or unavailable. Please wait a moment and try again.';
  }
  if (status >= 500) {
    return 'The FirstStep server encountered an unexpected error. Please try again shortly.';
  }
  if (isHtml) {
    return 'The server returned an unexpected page instead of reflection data. Please refresh the page and try again.';
  }
  return 'Unable to complete your request right now. Please try again.';
}

async function parseApiResponse<T>(url: string, response: Response): Promise<T> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  const isJson =
    contentType.includes('application/json') || contentType.includes('+json');

  const rawBody = await response.text();
  const trimmedBody = rawBody.trimStart();
  const looksLikeHtml =
    contentType.includes('text/html') ||
    trimmedBody.startsWith('<!') ||
    trimmedBody.toLowerCase().startsWith('<html');

  // Never blindly call JSON.parse on non-JSON (especially HTML error/proxy/fallback pages)
  if (!isJson) {
    console.error(`[FirstStep API] Expected JSON from ${url} but received non-JSON response`, {
      status: response.status,
      statusText: response.statusText,
      contentType: contentType || '(missing)',
      redirected: response.redirected,
      bodyPreview: trimmedBody.slice(0, 200),
    });

    throw new ApiError(
      getFriendlyStatusMessage(response.status, looksLikeHtml, response.redirected),
      {
        status: response.status,
        contentType,
        isNonJson: true,
      },
    );
  }

  let parsed: unknown;
  try {
    parsed = trimmedBody ? JSON.parse(trimmedBody) : {};
  } catch (parseError) {
    console.error(`[FirstStep API] Invalid JSON body from ${url}`, {
      status: response.status,
      contentType,
      bodyPreview: trimmedBody.slice(0, 200),
      parseError,
    });
    throw new ApiError(
      'Received an unreadable response from the FirstStep server. Please try again.',
      {
        status: response.status,
        contentType,
        isNonJson: true,
      },
    );
  }

  if (!response.ok) {
    const serverMessage =
      parsed &&
      typeof parsed === 'object' &&
      ('error' in parsed || 'message' in parsed)
        ? String(
            (parsed as { error?: unknown; message?: unknown }).error ??
              (parsed as { message?: unknown }).message ??
              '',
          ).trim()
        : '';

    console.error(`[FirstStep API] Request failed for ${url}`, {
      status: response.status,
      serverMessage: serverMessage || response.statusText,
    });

    throw new ApiError(
      serverMessage || getFriendlyStatusMessage(response.status, false, response.redirected),
      {
        status: response.status,
        contentType,
        isNonJson: false,
      },
    );
  }

  return parsed as T;
}

async function requestJson<T>(
  url: string,
  init: RequestInit,
  options: JsonRequestOptions = {},
): Promise<T> {
  const { timeoutMs = 45000, signal: externalSignal } = options;
  const controller = new AbortController();
  let didTimeout = false;

  const timer = window.setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  const handleExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', handleExternalAbort, { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      ...init,
      credentials: 'same-origin',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(init.headers || {}),
        ...(options.headers || {}),
      },
    });

    return await parseApiResponse<T>(url, response);
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    if (err instanceof DOMException && err.name === 'AbortError') {
      if (didTimeout) {
        throw new ApiError(
          'This reflection is taking longer than expected. Please try again in a moment.',
          { status: 504 },
        );
      }
      throw new ApiError('The request was cancelled. Please try again.');
    }
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      throw new ApiError(
        'You appear to be offline. Live FirstStep reflections require an internet connection.',
      );
    }
    throw new ApiError(
      'Unable to reach the FirstStep server right now. Please check your connection and try again.',
    );
  } finally {
    window.clearTimeout(timer);
    if (externalSignal) {
      externalSignal.removeEventListener('abort', handleExternalAbort);
    }
  }
}

export function postJson<T>(
  url: string,
  payload: unknown,
  options?: JsonRequestOptions,
): Promise<T> {
  return requestJson<T>(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    options,
  );
}

export function getJson<T>(url: string, options?: JsonRequestOptions): Promise<T> {
  return requestJson<T>(url, { method: 'GET' }, options);
}
