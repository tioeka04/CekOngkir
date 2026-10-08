import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors, spacing } from '../theme';

interface LoadingViewProps {
  /** Accessibility description of what is loading. */
  label: string;
}

export function LoadingView({ label }: LoadingViewProps) {
  return (
    <View style={styles.container} accessibilityLabel={label} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
});
