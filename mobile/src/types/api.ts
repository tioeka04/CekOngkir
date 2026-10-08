/** Types mirroring docs/API.md. Keep in sync with the backend contract. */

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  isAdmin: boolean;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /** Unix seconds. */
  expiresAt: number;
}

export type ShippingPreference = 'cheapest' | 'fastest' | 'best_value' | 'all';

export interface ShippingOption {
  courier: string;
  service: string;
  description: string;
  /** Rupiah. */
  cost: number;
  etd: string;
}

export interface ShippingResult {
  originName: string;
  destinationName: string;
  weightKg: number;
  preference: ShippingPreference;
  options: ShippingOption[];
}

export interface ChatTurn {
  id: string;
  sessionId: string;
  userMessage: string;
  /** May be empty when `shipping` is set. */
  botReply: string;
  shipping: ShippingResult | null;
  createdAt: string;
}

export interface ChatSessionSummary {
  sessionId: string;
  title: string;
  lastMessageAt: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  session: AuthSession;
}

export interface ChatReply {
  sessionId: string;
  reply: string;
  shipping: ShippingResult | null;
}

export interface ReviewInput {
  rating: number;
  comment?: string;
}

export type AdminRange = 'today' | 'week' | 'month' | 'year' | 'all';

export type RatingStar = '1' | '2' | '3' | '4' | '5';

export interface AdminStats {
  range: string;
  totalUsers: number;
  activeUsers: number;
  totalSearches: number;
  topRoutes: { route: string; count: number }[];
  ratings: {
    average: number;
    total: number;
    breakdown: Record<RatingStar, number>;
  };
  recentReviews: { id: string; rating: number; comment: string; createdAt: string }[];
}

/** Codes from the API contract plus client-side failures (network, timeout). */
export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNKNOWN';
