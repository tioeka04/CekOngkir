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

/** A single message in the format expected by chat-completion APIs. */
export interface LlmMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
