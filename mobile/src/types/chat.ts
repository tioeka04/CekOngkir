import type { ShippingResult } from './api';

/** View model for one rendered chat entry (a user bubble, a bot bubble or a result card). */
export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  shipping: ShippingResult | null;
  createdAt: string;
}
