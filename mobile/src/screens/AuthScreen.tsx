import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { LanguageToggle } from '../components/LanguageToggle';
import { SuccessBanner } from '../components/SuccessBanner';
import { TextField } from '../components/TextField';
import { useTranslation } from '../context/LanguageContext';
import { useAuthForm } from '../hooks/useAuthForm';
import { colors, fontSize, fontWeight, radius, shadows, spacing, TOUCH_TARGET } from '../theme';

export function AuthScreen() {
  const { t } = useTranslation();
  const form = useAuthForm();
  const { values, fieldErrors, isRegister } = form;
  const errorFor = (field: keyof typeof fieldErrors) => {
    const key = fieldErrors[field];
    return key ? t(key) : undefined;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <View style={styles.hero}>
              <View style={styles.logo}>
                <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.onPrimary} />
              </View>
              <Text style={styles.title}>CekOngkirAI</Text>
              <Text style={styles.subtitle}>
                {t(isRegister ? 'auth.subtitleRegister' : 'auth.subtitleLogin')}
              </Text>
            </View>

            <View style={styles.body}>
              {form.registered ? <SuccessBanner message={t('auth.registerSuccess')} /> : null}
              {form.errorText ? <ErrorBanner message={form.errorText} /> : null}

              {isRegister ? (
                <>
                  <TextField
                    label={t('auth.fullName')}
                    icon="person-outline"
                    placeholder={t('auth.fullNamePlaceholder')}
                    value={values.fullName}
                    onChangeText={(text) => form.setField('fullName', text)}
                    error={errorFor('fullName')}
                    autoComplete="name"
                  />
                  <TextField
                    label={t('auth.phone')}
                    icon="call-outline"
                    placeholder={t('auth.phonePlaceholder')}
                    keyboardType="phone-pad"
                    value={values.phone}
                    onChangeText={(text) => form.setField('phone', text)}
                    error={errorFor('phone')}
                    autoComplete="tel"
                  />
                </>
              ) : null}

              <TextField
                label={t('auth.email')}
                icon="mail-outline"
                placeholder={t('auth.emailPlaceholder')}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                autoComplete="email"
                value={values.email}
                onChangeText={(text) => form.setField('email', text)}
                error={errorFor('email')}
              />
              <TextField
                label={t('auth.password')}
                icon="lock-closed-outline"
                placeholder={t('auth.passwordPlaceholder')}
                secureTextEntry
                autoCapitalize="none"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={values.password}
                onChangeText={(text) => form.setField('password', text)}
                error={errorFor('password')}
              />

              <Button
                label={t(isRegister ? 'auth.submitRegister' : 'auth.submitLogin')}
                icon="chevron-forward"
                loading={form.submitting}
                onPress={() => void form.submit()}
              />

              <Pressable
                accessibilityRole="button"
                onPress={form.toggleMode}
                style={styles.switch}
              >
                <Text style={styles.switchText}>
                  {t(isRegister ? 'auth.switchToLogin' : 'auth.switchToRegister')}
                </Text>
              </Pressable>
              <LanguageToggle />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: {
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
    ...shadows.floating,
  },
  hero: { alignItems: 'center', padding: spacing.xxl, backgroundColor: colors.primary },
  logo: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.onPrimaryOverlay,
  },
  title: { fontSize: fontSize.heading, fontWeight: fontWeight.bold, color: colors.onPrimary },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    color: colors.onPrimaryMuted,
  },
  body: { padding: 28, gap: 14 },
  switch: { minHeight: TOUCH_TARGET, alignItems: 'center', justifyContent: 'center' },
  switchText: { fontSize: 13, fontWeight: fontWeight.bold, color: colors.primary },
});
