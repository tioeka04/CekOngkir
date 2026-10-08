import type { ImageSourcePropType } from 'react-native';

const MATCHERS: { keys: string[]; logo: ImageSourcePropType }[] = [
  { keys: ['anteraja'], logo: require('../../assets/logos/anteraja.jpg') as ImageSourcePropType },
  { keys: ['jne'], logo: require('../../assets/logos/jne.jpg') as ImageSourcePropType },
  { keys: ['jnt', 'jt'], logo: require('../../assets/logos/jnt.png') as ImageSourcePropType },
  { keys: ['sicepat'], logo: require('../../assets/logos/sicepat.jpg') as ImageSourcePropType },
  { keys: ['tiki'], logo: require('../../assets/logos/tiki.jpg') as ImageSourcePropType },
  { keys: ['pos'], logo: require('../../assets/logos/pos.png') as ImageSourcePropType },
];

/** Returns the bundled logo for a courier name, or null when unknown. */
export function getCourierLogo(courier: string): ImageSourcePropType | null {
  const normalized = courier.toLowerCase().replace(/[^a-z0-9]/g, '');
  const match = MATCHERS.find(({ keys }) => keys.some((key) => normalized.includes(key)));
  return match ? match.logo : null;
}
