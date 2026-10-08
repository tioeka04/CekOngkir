import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, radius, spacing } from '../theme';

export function SuccessBanner({ message }: { message: string }) {
  return (
    <View style={styles.banner} accessibilityLiveRegion="polite">
      <Ionicons name="checkmark-circle" size={18} color={colors.successText} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
  },
  message: { flex: 1, fontSize: fontSize.small, color: colors.successText },
});
