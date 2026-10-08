import type { ShippingPreference, ShippingResult } from '../../types/domain';
import type { CityResolver } from './city-resolver';
import type { RajaOngkirClient } from './rajaongkir.client';
import type { SearchLogRepository } from './search-log.repository';
import { sortByPreference } from './shipping-sorter';

export interface QuoteRequest {
  userId: string;
  origin: string;
  destination: string;
  weightKg: number;
  preference: ShippingPreference;
}

export type QuoteOutcome =
  | { kind: 'success'; result: ShippingResult }
  | { kind: 'city_not_found'; cityName: string }
  | { kind: 'no_rates' };

/** Orchestrates a rate lookup: resolve both cities → fetch rates → sort → log. */
export class ShippingService {
  constructor(
    private readonly cities: Pick<CityResolver, 'resolve'>,
    private readonly rates: Pick<RajaOngkirClient, 'calculateCost'>,
    private readonly searchLogs: Pick<SearchLogRepository, 'record'>,
  ) {}

  async quote(request: QuoteRequest): Promise<QuoteOutcome> {
    const [origin, destination] = await Promise.all([
      this.cities.resolve(request.origin),
      this.cities.resolve(request.destination),
    ]);
    if (!origin) return { kind: 'city_not_found', cityName: request.origin };
    if (!destination) return { kind: 'city_not_found', cityName: request.destination };

    const weightGram = Math.round(request.weightKg * 1000);
    const options = await this.rates.calculateCost(origin.id, destination.id, weightGram);
    if (options.length === 0) return { kind: 'no_rates' };

    void this.searchLogs.record({
      userId: request.userId,
      origin: origin.name,
      destination: destination.name,
      weightKg: request.weightKg,
      preference: request.preference,
    });

    return {
      kind: 'success',
      result: {
        originName: origin.name,
        destinationName: destination.name,
        weightKg: request.weightKg,
        preference: request.preference,
        options: sortByPreference(options, request.preference),
      },
    };
  }
}
