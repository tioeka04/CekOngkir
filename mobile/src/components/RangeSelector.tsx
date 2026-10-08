import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import { colors, fontSize, fontWeight, radius, spacing, TOUCH_TARGET } from '../theme';
import type { AdminRange } from '../types/api';

const RANGES: AdminRange[] = ['today', 'week', 'month', 'year', 'all'];

interface RangeSelectorProps {
  value: AdminRange;
  onChange: (range: AdminRange) => void;
}

export function RangeSelector({ value, onChange }: RangeSelectorProps) {
  const { t } = useTranslation();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {RANGES.map((range) => {
        const selected = range === value;
        const label = t(`admin.range.${range}`);
        return (
          <Pressable
            key={range}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
            onPress={() => onChange(range)}
            style={[styles.chip, selected && styles.chipSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingBottom: spacing.lg },
  chip: {
    minHeight: TOUCH_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { borderColor: colors.primary, backgroundColor: colors.primary },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.semibold, color: colors.text },
  labelSelected: { color: colors.onPrimary },
});
