import { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ErrorBanner } from '../components/ErrorBanner';
import { IconButton } from '../components/IconButton';
import { LoadingView } from '../components/LoadingView';
import { MessageBubble } from '../components/MessageBubble';
import { ScreenHeader } from '../components/ScreenHeader';
import { ShippingResultCard } from '../components/ShippingResultCard';
import { TypingIndicator } from '../components/TypingIndicator';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { MAX_MESSAGE_LENGTH, useChat } from '../hooks/useChat';
import { useChatSessions } from '../hooks/useChatSessions';
import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import type { ChatMessage } from '../types/chat';
import { errorMessage } from '../utils/errorMessage';
import { formatTime } from '../utils/formatTime';
import { SessionsDrawer } from './SessionsDrawer';

interface ChatScreenProps {
  onOpenAdmin: () => void;
}

export function ChatScreen({ onOpenAdmin }: ChatScreenProps) {
  const { t, language } = useTranslation();
  const { user, logout } = useAuth();
  const history = useChatSessions();
  const chat = useChat({ onMessageSent: () => void history.refresh() });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);

  if (!user) return null;
  const scrollToEnd = () => listRef.current?.scrollToEnd({ animated: true });

  const renderMessage = ({ item }: { item: ChatMessage }) =>
    item.shipping ? (
      <View style={styles.cardRow}>
        <ShippingResultCard result={item.shipping} />
      </View>
    ) : (
      <MessageBubble role={item.role} text={item.text} time={formatTime(item.createdAt, language)} />
    );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader
        title={t('chat.headerTitle')}
        left={
          <IconButton
            icon="menu-outline"
            accessibilityLabel={t('chat.openHistory')}
            onPress={() => setDrawerOpen(true)}
          />
        }
        right={
          <IconButton
            icon="log-out-outline"
            color={colors.danger}
            accessibilityLabel={t('chat.logout')}
            onPress={() => void logout()}
          />
        }
        subtitle={
          <View style={styles.status}>
            <View style={styles.dot} />
            <Text style={styles.statusLabel}>{t('chat.online')}</Text>
          </View>
        }
      />

      {chat.loadingSession ? (
        <LoadingView label={t('common.loading')} />
      ) : (
        <FlatList
          ref={listRef}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={chat.messages}
          keyExtractor={(message) => message.id}
          renderItem={renderMessage}
          onContentSizeChange={scrollToEnd}
          ListHeaderComponent={
            <MessageBubble
              role="bot"
              text={t('chat.greeting', { name: user.fullName || t('common.guest') })}
            />
          }
          ListFooterComponent={chat.sending ? <TypingIndicator label={t('chat.thinking')} /> : null}
        />
      )}

      {chat.error ? (
        <View style={styles.errorWrap}>
          <ErrorBanner
            message={errorMessage(chat.error, t)}
            actionLabel={t('common.dismiss')}
            onAction={chat.dismissError}
          />
        </View>
      ) : null}

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder={t('chat.placeholder')}
            placeholderTextColor={colors.textMuted}
            accessibilityLabel={t('chat.placeholder')}
            value={chat.input}
            onChangeText={chat.setInput}
            editable={!chat.sending}
            maxLength={MAX_MESSAGE_LENGTH}
            onSubmitEditing={() => void chat.send()}
            returnKeyType="send"
          />
          <IconButton
            icon="send"
            size={20}
            color={colors.primary}
            accessibilityLabel={t('chat.send')}
            onPress={() => void chat.send()}
          />
        </View>
      </KeyboardAvoidingView>

      {drawerOpen ? (
        <SessionsDrawer
          user={user}
          sessions={history.sessions}
          loading={history.loading}
          error={history.error}
          activeSessionId={chat.sessionId}
          onRetry={() => void history.refresh()}
          onSelect={(id) => {
            setDrawerOpen(false);
            void chat.openSession(id);
          }}
          onNewChat={() => {
            setDrawerOpen(false);
            chat.startNewChat();
          }}
          onOpenAdmin={() => {
            setDrawerOpen(false);
            onOpenAdmin();
          }}
          onClose={() => setDrawerOpen(false)}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  list: { flex: 1, backgroundColor: colors.background },
  listContent: { padding: spacing.lg },
  cardRow: { width: '100%', alignItems: 'flex-start', marginVertical: 6 },
  status: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dot: {
    width: 6,
    height: 6,
    marginRight: spacing.xs,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  statusLabel: { fontSize: fontSize.caption, fontWeight: fontWeight.bold, color: colors.accent },
  errorWrap: { padding: spacing.sm, backgroundColor: colors.background },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.field,
    fontSize: fontSize.body,
    color: colors.text,
  },
});
