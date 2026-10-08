import { StyleSheet, Text, View } from 'react-native';

import { useTranslation } from '../context/LanguageContext';
import { useRating } from '../hooks/useRating';
import { colors, fontSize, fontWeight, spacing } from '../theme';
import { errorMessage } from '../utils/errorMessage';
import { StarRating } from './StarRating';

/** Asks for a 1-5 star review once per result card. */
export function RatingPrompt({ routeLabel }: { routeLabel: string }) {
  const { t } = useTranslation();
  const { rating, status, error, rate } = useRating(routeLabel);

  return (
    <View style={styles.container}>
      {status === 'done' ? (
        <Text style={styles.thanks}>{t('shipping.rateThanks')}</Text>
      ) : (
        <>
          <Text style={styles.label}>
            {status === 'submitting' ? t('shipping.rateSaving') : t('shipping.ratePrompt')}
          </Text>
          <StarRating
            value={rating}
            onChange={(value) => void rate(value)}
            disabled={status === 'submitting'}
            labelFor={(count) => t('shipping.rateStar', { count })}
          />
          {error ? <Text style={styles.error}>{errorMessage(error, t)}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  label: { fontSize: fontSize.micro, fontWeight: fontWeight.semibold, color: colors.textMuted },
  thanks: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.accent },
  error: { fontSize: fontSize.caption, color: colors.danger, textAlign: 'center' },
});
