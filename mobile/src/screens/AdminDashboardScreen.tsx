import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { IconButton } from '../components/IconButton';
import { LoadingView } from '../components/LoadingView';
import { RangeSelector } from '../components/RangeSelector';
import { ScreenHeader } from '../components/ScreenHeader';
import { StarRating } from '../components/StarRating';
import { StatCard } from '../components/StatCard';
import { useTranslation } from '../context/LanguageContext';
import { useAdminStats } from '../hooks/useAdminStats';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import { errorMessage } from '../utils/errorMessage';
import { formatDate } from '../utils/formatTime';

export function AdminDashboardScreen({ onBack }: { onBack: () => void }) {
  const { t, language } = useTranslation();
  const { range, setRange, stats, loading, error, retry } = useAdminStats();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('admin.title')}
        left={<IconButton icon="arrow-back" onPress={onBack} accessibilityLabel={t('admin.back')} />}
      />

      {loading && !stats ? (
        <LoadingView label={t('common.loading')} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <RangeSelector value={range} onChange={setRange} />
          {error ? (
            <ErrorBanner
              message={errorMessage(error, t)}
              actionLabel={t('common.retry')}
              onAction={retry}
            />
          ) : null}

          {stats ? (
            <>
              <View style={styles.metrics}>
                <StatCard label={t('admin.totalUsers')} value={String(stats.totalUsers)} />
                <StatCard label={t('admin.activeUsers')} value={String(stats.activeUsers)} />
                <StatCard label={t('admin.totalSearches')} value={String(stats.totalSearches)} />
              </View>
              <View style={styles.metrics}>
                <StatCard
                  label={t('admin.avgRating')}
                  value={`${stats.ratings.average.toFixed(1)} (${stats.ratings.total})`}
                />
              </View>

              <Text style={styles.section}>{t('admin.topRoutes')}</Text>
              <View style={styles.block}>
                {stats.topRoutes.length === 0 ? (
                  <EmptyState message={t('admin.noRoutes')} />
                ) : (
                  stats.topRoutes.map((item) => (
                    <View key={item.route} style={styles.line}>
                      <Text style={styles.route}>{item.route}</Text>
                      <Text style={styles.count}>{item.count}x</Text>
                    </View>
                  ))
                )}
              </View>

              <Text style={styles.section}>{t('admin.recentReviews')}</Text>
              <View style={styles.block}>
                {stats.recentReviews.length === 0 ? (
                  <EmptyState message={t('admin.noReviews')} />
                ) : (
                  stats.recentReviews.map((review) => (
                    <View key={review.id} style={styles.review}>
                      <View style={styles.reviewHead}>
                        <StarRating value={review.rating} size={14} />
                        <Text style={styles.date}>{formatDate(review.createdAt, language)}</Text>
                      </View>
                      <Text style={styles.comment}>{review.comment || t('admin.noComment')}</Text>
                    </View>
                  ))
                )}
              </View>
            </>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  metrics: { flexDirection: 'row', gap: spacing.md },
  section: {
    marginTop: spacing.sm,
    fontSize: fontSize.body,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  block: {
    padding: spacing.md,
    gap: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  route: { flex: 1, fontSize: fontSize.small, fontWeight: fontWeight.medium, color: colors.text },
  count: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: colors.primary },
  review: { gap: spacing.xs, paddingBottom: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.divider },
  reviewHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date: { fontSize: fontSize.micro, color: colors.textMuted },
  comment: { fontSize: fontSize.small, fontStyle: 'italic', color: colors.text },
});
