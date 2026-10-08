import { describe, expect, it, vi } from 'vitest';
import { CityResolver, pickBestDestination } from '../src/modules/shipping/city-resolver';
import type { Destination } from '../src/modules/shipping/rajaongkir.client';

const destination = (id: number, cityName: string, districtName = ''): Destination => ({
  id,
  label: cityName,
  cityName,
  districtName,
  subdistrictName: '',
});

describe('pickBestDestination', () => {
  const list = [
    destination(1, 'SURABAYA BARAT'),
    destination(2, 'SURABAYA'),
    destination(3, 'KOTA SURABAYA'),
  ];

  it('prefers an exact city match', () => {
    expect(pickBestDestination(list, 'surabaya')?.id).toBe(2);
  });

  it('falls back to the shortest city that starts with the term', () => {
    expect(pickBestDestination([list[0]!, list[2]!], 'surabaya')?.id).toBe(1);
  });

  it('falls back to a partial match on district names', () => {
    const result = pickBestDestination([destination(9, 'BANDUNG', 'COBLONG')], 'coblong');
    expect(result?.id).toBe(9);
  });

  it('returns null instead of guessing when nothing matches', () => {
    expect(pickBestDestination(list, 'atlantis')).toBeNull();
    expect(pickBestDestination([], 'surabaya')).toBeNull();
  });
});

describe('CityResolver', () => {
  it('expands aliases and uses the friendly display name', async () => {
    const searchDestinations = vi.fn().mockResolvedValue([destination(5, 'SURABAYA')]);
    const resolver = new CityResolver({ searchDestinations });

    expect(await resolver.resolve('sby')).toEqual({ id: 5, name: 'Surabaya' });
    expect(searchDestinations).toHaveBeenCalledWith('Surabaya');
  });

  it('strips the "Kota" prefix and caches repeated lookups', async () => {
    const searchDestinations = vi.fn().mockResolvedValue([destination(7, 'MALANG')]);
    const resolver = new CityResolver({ searchDestinations });

    await resolver.resolve('Kota Malang');
    await resolver.resolve('malang');

    expect(searchDestinations).toHaveBeenCalledTimes(1);
  });

  it('returns null for unknown cities', async () => {
    const resolver = new CityResolver({ searchDestinations: vi.fn().mockResolvedValue([]) });
    expect(await resolver.resolve('Gotham')).toBeNull();
  });
});
