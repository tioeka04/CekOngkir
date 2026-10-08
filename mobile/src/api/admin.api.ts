import type { AdminRange, AdminStats } from '../types/api';
import { request } from './client';

export function fetchAdminStats(range: AdminRange): Promise<AdminStats> {
  return request('/admin/stats', { query: { range } });
}
