import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import type { Language } from '../i18n';
import { colors, fontSize, fontWeight, radius, TOUCH_TARGET } from '../theme';

const OPTIONS: Language[] = ['id', 'en'];

/** Segmented ID / EN switch. */
export function LanguageToggle() {
  const { language, setLanguage, t } = useTranslation();
  return (
    <View style={styles.row} accessibilityLabel={t('language.toggle')}>
      {OPTIONS.map((option) => {
        const selected = option === language;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={option.toUpperCase()}
            accessibilityState={{ selected }}
            onPress={() => setLanguage(option)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.toUpperCase()}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignSelf: 'center',
    padding: 2,
    borderRadius: radius.pill,
    backgroundColor: colors.field,
  },
  segment: {
    minWidth: TOUCH_TARGET,
    minHeight: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  segmentSelected: { backgroundColor: colors.primary },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: colors.textMuted },
  labelSelected: { color: colors.onPrimary },
});
