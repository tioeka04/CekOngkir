import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { colors, fontSize, fontWeight, spacing, TOUCH_TARGET } from '../theme';

interface ScreenHeaderProps {
  title: string;
  left: ReactNode;
  right?: ReactNode;
  /** Optional line under the title (e.g. a status indicator). */
  subtitle?: ReactNode;
}

export function ScreenHeader({ title, left, right, subtitle }: ScreenHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>{left}</View>
      <View style={styles.center}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle}
      </View>
      <View style={[styles.side, styles.sideEnd]}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  side: { minWidth: TOUCH_TARGET, alignItems: 'flex-start' },
  sideEnd: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text },
});
