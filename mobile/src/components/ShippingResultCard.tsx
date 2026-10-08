import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '../context/LanguageContext';
import { colors, fontSize, fontWeight, shadows, spacing } from '../theme';
import type { ShippingResult } from '../types/api';
import { CourierRow } from './CourierRow';
import { RatingPrompt } from './RatingPrompt';
import type { IconName } from './icons';

function DetailBox({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.detailBox}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <View style={styles.detailTexts}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

export function ShippingResultCard({ result }: { result: ShippingResult }) {
  const { t } = useTranslation();
  const { options } = result;

  return (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <View style={styles.city}>
          <Text style={styles.cityLabel}>{t('shipping.origin')}</Text>
          <Text style={styles.cityName}>{result.originName}</Text>
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.icon} style={styles.arrow} />
        <View style={[styles.city, styles.cityEnd]}>
          <Text style={styles.cityLabel}>{t('shipping.destination')}</Text>
          <Text style={styles.cityName}>{result.destinationName}</Text>
        </View>
      </View>

      <View style={styles.detailGrid}>
        <DetailBox icon="scale-outline" label={t('shipping.weight')} value={`${result.weightKg} kg`} />
        <DetailBox
          icon="pulse-outline"
          label={t('shipping.options')}
          value={t('shipping.optionsFound', { count: options.length })}
        />
      </View>

      {options.length === 0 ? (
        <Text style={styles.empty}>{t('shipping.noOptions')}</Text>
      ) : (
        <View style={styles.options}>
          {options.map((option) => (
            <CourierRow key={`${option.courier}-${option.service}`} option={option} />
          ))}
        </View>
      )}

      <RatingPrompt routeLabel={`${result.originName} → ${result.destinationName}`} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 290,
    padding: spacing.lg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    ...shadows.soft,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  city: { flex: 1 },
  cityEnd: { alignItems: 'flex-end' },
  arrow: { marginHorizontal: spacing.sm },
  cityLabel: {
    fontSize: fontSize.micro,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  cityName: { marginTop: 2, fontSize: 13, fontWeight: fontWeight.bold, color: colors.text },
  detailGrid: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  detailBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: 10,
    backgroundColor: colors.background,
  },
  detailTexts: { marginLeft: 6 },
  detailLabel: { fontSize: fontSize.micro, color: colors.textMuted, textTransform: 'uppercase' },
  detailValue: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.text },
  options: { gap: spacing.sm, marginTop: spacing.xs },
  empty: { fontSize: fontSize.small, color: colors.textMuted, textAlign: 'center' },
});
