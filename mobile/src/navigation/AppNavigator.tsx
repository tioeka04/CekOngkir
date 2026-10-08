import { useState } from 'react';

import { LoadingView } from '../components/LoadingView';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import { AdminDashboardScreen } from '../screens/AdminDashboardScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ChatScreen } from '../screens/ChatScreen';

type Route = 'chat' | 'admin';

/** Screens available once signed in. Mounted only while a user exists, so state resets on logout. */
function SignedInNavigator({ isAdmin }: { isAdmin: boolean }) {
  const [route, setRoute] = useState<Route>('chat');

  if (route === 'admin' && isAdmin) {
    return <AdminDashboardScreen onBack={() => setRoute('chat')} />;
  }
  return <ChatScreen onOpenAdmin={() => setRoute('admin')} />;
}

/** State-based navigation: auth gate first, then the signed-in screens. */
export function AppNavigator() {
  const { status, user } = useAuth();
  const { t } = useTranslation();

  if (status === 'restoring') return <LoadingView label={t('common.loading')} />;
  if (!user) return <AuthScreen />;
  return <SignedInNavigator isAdmin={user.isAdmin} />;
}
