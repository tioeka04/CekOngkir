import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, fontWeight } from '../theme';

interface AvatarProps {
  name: string;
  size?: number;
}

export function Avatar({ name, size = 40 }: AvatarProps) {
  const initial = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <View
      accessibilityElementsHidden
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={styles.initial}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  initial: {
    color: colors.onPrimary,
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
  },
});
