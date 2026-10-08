import { describe, expect, it } from 'vitest';
import { translate } from '../src/i18n/translate';
import { getCourierLogo } from '../src/utils/courier';
import { formatRupiah } from '../src/utils/format';

describe('formatRupiah', () => {
  it('uses Indonesian thousand separators', () => {
    expect(formatRupiah(25000)).toBe('Rp 25.000');
  });
});

describe('getCourierLogo', () => {
  it('matches couriers regardless of case and punctuation', () => {
    expect(getCourierLogo('JNE')).toBe('/logos/jne.jpg');
    expect(getCourierLogo('J&T Express')).toBe('/logos/jnt.png');
    expect(getCourierLogo('Si Cepat')).toBe('/logos/sicepat.jpg');
  });

  it('returns null for unknown couriers', () => {
    expect(getCourierLogo('Unknown Express')).toBeNull();
  });
});

describe('translate', () => {
  it('returns the text for the chosen language', () => {
    expect(translate('id', 'nav.logout')).toBe('Keluar');
    expect(translate('en', 'nav.logout')).toBe('Log out');
  });

  it('fills placeholders', () => {
    expect(translate('en', 'shipping.found', { count: 3 })).toBe('3 found');
  });
});
