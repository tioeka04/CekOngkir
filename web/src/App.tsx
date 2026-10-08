import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RedirectIfAuthenticated, RequireAdmin, RequireAuth } from './components/auth/RouteGuards';
import { AuthProvider } from './context/AuthProvider';
import { LanguageProvider } from './context/LanguageProvider';
import { AppShell } from './layouts/AppShell';
import { ChatPage } from './pages/ChatPage';
import { LoginPage } from './pages/LoginPage';

// The dashboard pulls in the charting library, so it is only loaded for admins.
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })));

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<RedirectIfAuthenticated><LoginPage /></RedirectIfAuthenticated>} />
            <Route path="/" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <RequireAdmin>
                    <AppShell>
                      <Suspense fallback={null}>
                        <AdminPage />
                      </Suspense>
                    </AppShell>
                  </RequireAdmin>
                </RequireAuth>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}
