import { requestJson } from '../../lib/http';
import type { ShippingOption } from '../../types/domain';

const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
const SERVICE_NAME = 'RajaOngkir';
const COURIERS = ['jne', 'pos', 'tiki', 'sicepat', 'anteraja'];

export interface Destination {
  id: number;
  label: string;
  cityName: string;
  districtName: string;
  subdistrictName: string;
}

interface RawDestination {
  id: number;
  label?: string;
  city_name?: string;
  district_name?: string;
  subdistrict_name?: string;
}

interface RawCost {
  name: string;
  service: string;
  description?: string;
  cost: number;
  etd?: string;
}

/** Thin HTTP client for the RajaOngkir (Komerce) shipping API. */
export class RajaOngkirClient {
  constructor(private readonly apiKey: string) {}

  async searchDestinations(query: string): Promise<Destination[]> {
    const params = new URLSearchParams({ search: query, limit: '100' });
    const body = await requestJson<{ data?: RawDestination[] }>(
      SERVICE_NAME,
      `${BASE_URL}/destination/domestic-destination?${params}`,
      { headers: { key: this.apiKey, accept: 'application/json' } },
    );

    return (body.data ?? []).map((item) => ({
      id: item.id,
      label: item.label ?? '',
      cityName: item.city_name ?? '',
      districtName: item.district_name ?? '',
      subdistrictName: item.subdistrict_name ?? '',
    }));
  }

  async calculateCost(
    originId: number,
    destinationId: number,
    weightGram: number,
  ): Promise<ShippingOption[]> {
    const form = new URLSearchParams({
      origin: String(originId),
      destination: String(destinationId),
      weight: String(weightGram),
      courier: COURIERS.join(':'),
    });
    const body = await requestJson<{ data?: RawCost[] }>(
      SERVICE_NAME,
      `${BASE_URL}/calculate/domestic-cost`,
      {
        method: 'POST',
        headers: { key: this.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form.toString(),
      },
    );

    return (body.data ?? []).map((item) => ({
      courier: item.name,
      service: item.service,
      description: item.description ?? '',
      cost: item.cost,
      etd: item.etd ?? '',
    }));
  }
}
