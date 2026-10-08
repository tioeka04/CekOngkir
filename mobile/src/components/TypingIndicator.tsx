import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '../theme';

export function TypingIndicator({ label }: { label: string }) {
  return (
    <View style={styles.wrapper} accessibilityLiveRegion="polite">
      <View style={styles.bubble}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', alignItems: 'flex-start', marginVertical: 6 },
  bubble: {
    padding: spacing.md,
    borderRadius: radius.lg,
    borderBottomLeftRadius: 2,
    backgroundColor: colors.border,
    opacity: 0.7,
  },
  text: { fontSize: fontSize.body, color: colors.text },
});
