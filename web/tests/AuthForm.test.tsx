import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../src/api/http-client';
import { AuthForm } from '../src/components/auth/AuthForm';
import { AuthContext, type AuthContextValue } from '../src/context/auth-context';
import { LanguageProvider } from '../src/context/LanguageProvider';

function renderForm(overrides: Partial<AuthContextValue> = {}) {
  const auth: AuthContextValue = {
    status: 'anonymous',
    user: null,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue('ok'),
    logout: vi.fn(),
    ...overrides,
  };
  render(
    <LanguageProvider>
      <AuthContext.Provider value={auth}>
        <AuthForm />
      </AuthContext.Provider>
    </LanguageProvider>,
  );
  return auth;
}

describe('AuthForm', () => {
  it('asks for missing fields instead of calling the API', async () => {
    const auth = renderForm();
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    expect(screen.getByRole('alert')).toHaveTextContent(/lengkapi/i);
    expect(auth.login).not.toHaveBeenCalled();
  });

  it('logs in with the typed credentials', async () => {
    const auth = renderForm();
    await userEvent.type(screen.getByLabelText(/email/i), 'tio@mail.com');
    await userEvent.type(screen.getByLabelText(/kata sandi/i), 'secret123');
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    expect(auth.login).toHaveBeenCalledWith('tio@mail.com', 'secret123');
  });

  it('shows the server error message when login fails', async () => {
    renderForm({ login: vi.fn().mockRejectedValue(new ApiError(401, 'UNAUTHORIZED', 'Invalid login')) });
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.c');
    await userEvent.type(screen.getByLabelText(/kata sandi/i), 'x');
    await userEvent.click(screen.getByRole('button', { name: /^masuk$/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid login');
  });

  it('switches to the registration form', async () => {
    renderForm();
    await userEvent.click(screen.getByRole('button', { name: /daftar di sini/i }));
    expect(screen.getByLabelText(/nama lengkap/i)).toBeInTheDocument();
  });
});
