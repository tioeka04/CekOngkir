import { UpstreamError } from './errors';

interface JsonRequestOptions {
  method?: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;
  timeoutMs?: number;
}

/** fetch() wrapper that adds a timeout and converts any failure into an UpstreamError. */
export async function requestJson<T>(
  service: string,
  url: string,
  { method = 'GET', headers, body, timeoutMs = 10_000 }: JsonRequestOptions = {},
): Promise<T> {
  try {
    const response = await fetch(url, {
      method,
      headers,
      body,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok) {
      throw new Error(`${service} responded with HTTP ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    throw new UpstreamError(service, error);
  }
}
