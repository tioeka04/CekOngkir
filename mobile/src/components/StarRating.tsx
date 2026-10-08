import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, TOUCH_TARGET } from '../theme';

const STARS = [1, 2, 3, 4, 5] as const;

interface StarRatingProps {
  value: number;
  /** Omit for a read-only display. */
  onChange?: (value: number) => void;
  disabled?: boolean;
  size?: number;
  /** Builds the accessibility label for the n-th star. */
  labelFor?: (count: number) => string;
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  size = 24,
  labelFor,
}: StarRatingProps) {
  return (
    <View style={styles.row}>
      {STARS.map((star) => {
        const filled = star <= value;
        const icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? colors.star : colors.starEmpty}
          />
        );
        if (!onChange) return <View key={star}>{icon}</View>;
        return (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={labelFor ? labelFor(star) : String(star)}
            disabled={disabled}
            onPress={() => onChange(star)}
            style={styles.target}
          >
            {icon}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'center' },
  target: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
