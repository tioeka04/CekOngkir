import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, radius, spacing } from '../theme';

interface MessageBubbleProps {
  role: 'user' | 'bot';
  text: string;
  time?: string;
}

export function MessageBubble({ role, text, time }: MessageBubbleProps) {
  const isUser = role === 'user';
  return (
    <View style={[styles.wrapper, isUser ? styles.alignEnd : styles.alignStart]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        <Text style={[styles.text, isUser ? styles.textUser : styles.textBot]}>{text}</Text>
        {time ? (
          <Text style={[styles.time, isUser ? styles.timeUser : styles.timeBot]}>{time}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%', marginVertical: 6 },
  alignEnd: { alignItems: 'flex-end' },
  alignStart: { alignItems: 'flex-start' },
  bubble: { maxWidth: '78%', padding: spacing.md, borderRadius: radius.lg },
  bubbleUser: { backgroundColor: colors.primary, borderBottomRightRadius: 2 },
  bubbleBot: { backgroundColor: colors.border, borderBottomLeftRadius: 2 },
  text: { fontSize: fontSize.body, lineHeight: 20 },
  textUser: { color: colors.onPrimary },
  textBot: { color: colors.text },
  time: { fontSize: fontSize.micro, alignSelf: 'flex-end', marginTop: spacing.xs },
  timeUser: { color: colors.onPrimaryFaint },
  timeBot: { color: colors.textMuted },
});
