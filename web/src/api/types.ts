/** Types mirroring the REST contract documented in docs/API.md. */

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
  expiresAt: number;
}

export interface AuthPayload {
  user: User;
  session: AuthSession;
}

export type ShippingPreference = 'cheapest' | 'fastest' | 'best_value' | 'all';

export interface ShippingOption {
  courier: string;
  service: string;
  description: string;
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
  botReply: string;
  shipping: ShippingResult | null;
  createdAt: string;
}

export interface ChatSessionSummary {
  sessionId: string;
  title: string;
  lastMessageAt: string;
}

export interface ChatReply {
  sessionId: string;
  reply: string;
  shipping: ShippingResult | null;
}

export type StatsRange = 'today' | 'week' | 'month' | 'year' | 'all';

export interface AdminStats {
  range: StatsRange;
  totalUsers: number;
  activeUsers: number;
  totalSearches: number;
  topRoutes: { route: string; count: number }[];
  ratings: {
    average: number;
    total: number;
    breakdown: Record<'1' | '2' | '3' | '4' | '5', number>;
  };
  recentReviews: { id: string; rating: number; comment: string; createdAt: string }[];
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}
