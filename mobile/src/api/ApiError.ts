import type { ApiErrorCode } from '../types/api';

/** Typed error for every failed request, including network and timeout failures. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;

  constructor(status: number, code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const KNOWN_CODES: readonly ApiErrorCode[] = [
  'VALIDATION_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'RATE_LIMITED',
  'UPSTREAM_ERROR',
  'INTERNAL_ERROR',
];

function isKnownCode(value: unknown): value is ApiErrorCode {
  return KNOWN_CODES.some((code) => code === value);
}

/** Builds an ApiError from a non-2xx response body of shape `{ error: { code, message } }`. */
export function parseApiError(status: number, body: unknown): ApiError {
  if (typeof body === 'object' && body !== null && 'error' in body) {
    const { error } = body as { error: unknown };
    if (typeof error === 'object' && error !== null) {
      const { code, message } = error as { code?: unknown; message?: unknown };
      return new ApiError(
        status,
        isKnownCode(code) ? code : 'UNKNOWN',
        typeof message === 'string' ? message : 'Request failed',
      );
    }
  }
  return new ApiError(status, 'UNKNOWN', 'Request failed');
}
