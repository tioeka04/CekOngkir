import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, fontSize, fontWeight, radius, spacing } from '../theme';
import type { IconName } from './icons';

interface TextFieldProps extends TextInputProps {
  label: string;
  icon: IconName;
  error?: string;
}

export function TextField({ label, icon, error, ...inputProps }: TextFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.box, error ? styles.boxError : null]}>
        <Ionicons name={icon} size={18} color={colors.textMuted} />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.textMuted}
          accessibilityLabel={label}
          {...inputProps}
        />
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 6 },
  label: { fontSize: fontSize.small, fontWeight: fontWeight.bold, color: colors.text },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.field,
    backgroundColor: colors.field,
  },
  boxError: { borderColor: colors.danger },
  input: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    fontSize: fontSize.body,
    color: colors.text,
  },
  error: { fontSize: fontSize.caption, color: colors.danger },
});
