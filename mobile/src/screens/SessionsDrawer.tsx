import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { IconButton } from '../components/IconButton';
import { LanguageToggle } from '../components/LanguageToggle';
import { LoadingView } from '../components/LoadingView';
import { useTranslation } from '../context/LanguageContext';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import type { ChatSessionSummary, User } from '../types/api';
import { errorMessage } from '../utils/errorMessage';
import { formatDate } from '../utils/formatTime';

interface SessionsDrawerProps {
  user: User;
  sessions: ChatSessionSummary[];
  loading: boolean;
  error: unknown;
  activeSessionId: string;
  onRetry: () => void;
  onSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onOpenAdmin: () => void;
  onClose: () => void;
}

/** Slide-over panel listing past chats, with new-chat and admin shortcuts. */
export function SessionsDrawer(props: SessionsDrawerProps) {
  const { user, sessions, loading, error, activeSessionId } = props;
  const { t, language } = useTranslation();

  return (
    <View style={styles.overlay}>
      <Pressable
        style={styles.scrim}
        onPress={props.onClose}
        accessibilityRole="button"
        accessibilityLabel={t('sessions.close')}
      />
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {t('sessions.title')}
          </Text>
          <IconButton icon="close" onPress={props.onClose} accessibilityLabel={t('sessions.close')} />
        </View>

        <View style={styles.actions}>
          <Button label={t('sessions.newChat')} icon="add" onPress={props.onNewChat} />
          {user.isAdmin ? (
            <Button
              label={t('sessions.admin')}
              icon="stats-chart"
              variant="success"
              onPress={props.onOpenAdmin}
            />
          ) : null}
        </View>

        {error ? (
          <ErrorBanner
            message={errorMessage(error, t)}
            actionLabel={t('common.retry')}
            onAction={props.onRetry}
          />
        ) : null}

        {loading ? (
          <LoadingView label={t('common.loading')} />
        ) : (
          <ScrollView style={styles.list}>
            {sessions.length === 0 && !error ? <EmptyState message={t('sessions.empty')} /> : null}
            {sessions.map((item) => (
              <Pressable
                key={item.sessionId}
                accessibilityRole="button"
                onPress={() => props.onSelect(item.sessionId)}
                style={[styles.item, item.sessionId === activeSessionId && styles.itemActive]}
              >
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.itemTime}>{formatDate(item.lastMessageAt, language)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Avatar name={user.fullName} />
          <View style={styles.profile}>
            <Text style={styles.name} numberOfLines={1}>
              {user.fullName || t('common.guest')}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {user.email}
            </Text>
          </View>
        </View>
        <LanguageToggle />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 10, flexDirection: 'row' },
  scrim: { flex: 1, backgroundColor: colors.scrim },
  panel: {
    width: 290,
    padding: 20,
    gap: spacing.md,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    backgroundColor: colors.background,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: fontSize.title, fontWeight: fontWeight.bold, color: colors.text },
  actions: { gap: 10 },
  list: { flex: 1 },
  item: {
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  itemActive: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  itemTitle: { fontSize: 13, fontWeight: fontWeight.semibold, color: colors.text },
  itemTime: { marginTop: spacing.xs, fontSize: fontSize.micro, color: colors.textMuted },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderRadius: radius.sm,
  },
  profile: { flex: 1 },
  name: { fontSize: fontSize.body, fontWeight: fontWeight.bold, color: colors.text },
  email: { marginTop: 2, fontSize: fontSize.caption, color: colors.textMuted },
});
