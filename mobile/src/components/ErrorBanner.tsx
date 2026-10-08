import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing, TOUCH_TARGET } from '../theme';

interface ErrorBannerProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/** Inline error with an optional action (retry or dismiss). */
export function ErrorBanner({ message, actionLabel, onAction }: ErrorBannerProps) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Ionicons name="alert-circle" size={18} color={colors.dangerText} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          onPress={onAction}
          style={styles.action}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
  },
  message: { flex: 1, fontSize: fontSize.small, color: colors.dangerText },
  action: { minHeight: TOUCH_TARGET, justifyContent: 'center', paddingHorizontal: spacing.xs },
  actionLabel: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    color: colors.dangerText,
  },
});
