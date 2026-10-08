import { Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useTranslation } from '../context/LanguageContext';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import type { ShippingOption } from '../types/api';
import { getCourierLogo } from '../utils/courierLogos';
import { formatCurrency } from '../utils/formatCurrency';

export function CourierRow({ option }: { option: ShippingOption }) {
  const { t } = useTranslation();
  const logo = getCourierLogo(option.courier);

  return (
    <View style={styles.row}>
      <View style={styles.meta}>
        <View style={styles.logoBox}>
          {logo ? (
            <Image source={logo} style={styles.logo} resizeMode="contain" />
          ) : (
            <Ionicons name="cube-outline" size={18} color={colors.primary} />
          )}
        </View>
        <View style={styles.texts}>
          <Text style={styles.name}>{option.courier}</Text>
          <Text style={styles.service}>
            {option.service} • {t('shipping.estimate', { etd: option.etd })}
          </Text>
        </View>
      </View>
      <Text style={styles.price}>{formatCurrency(option.cost)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primaryBorder,
    backgroundColor: colors.primarySoft,
  },
  meta: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  logoBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  logo: { width: '100%', height: '100%' },
  texts: { marginLeft: spacing.sm, flexShrink: 1 },
  name: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: colors.text },
  service: { fontSize: fontSize.micro, color: colors.textMuted, marginTop: 2 },
  price: { fontSize: 13, fontWeight: fontWeight.heavy, color: colors.primary },
});
