import type { Session, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { UnauthorizedError, ValidationError } from '../../lib/errors';
import type { AuthSession, User } from '../../types/domain';

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface LoginResult {
  user: User;
  session: AuthSession;
}

/** Authentication on top of Supabase Auth. Admin rights are decided here, from ADMIN_EMAILS. */
export class AuthService {
  private readonly adminEmails: ReadonlySet<string>;

  constructor(
    private readonly auth: SupabaseClient,
    adminEmails: string[],
  ) {
    this.adminEmails = new Set(adminEmails.map((email) => email.toLowerCase()));
  }

  async register({ email, password, fullName, phone }: RegisterInput): Promise<void> {
    const { error } = await this.auth.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, phone } },
    });
    if (error) throw new ValidationError(error.message);
  }

  async login(email: string, password: string): Promise<LoginResult> {
    const { data, error } = await this.auth.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      throw new UnauthorizedError(error?.message ?? 'Invalid email or password');
    }
    return this.toLoginResult(data.user, data.session);
  }

  /** Exchanges a refresh token for a fresh access token (and a rotated refresh token). */
  async refresh(refreshToken: string): Promise<LoginResult> {
    const { data, error } = await this.auth.auth.refreshSession({ refresh_token: refreshToken });
    if (error || !data.session || !data.user) throw new UnauthorizedError('Session expired, please sign in again');
    return this.toLoginResult(data.user, data.session);
  }

  /** Validates an access token with Supabase and returns the user it belongs to. */
  async verifyToken(accessToken: string): Promise<User> {
    const { data, error } = await this.auth.auth.getUser(accessToken);
    if (error || !data.user) throw new UnauthorizedError('Invalid or expired token');
    return this.toUser(data.user);
  }

  private toLoginResult(user: SupabaseUser, session: Session): LoginResult {
    return {
      user: this.toUser(user),
      session: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: session.expires_at ?? 0,
      },
    };
  }

  private toUser(user: SupabaseUser): User {
    const email = user.email ?? '';
    return {
      id: user.id,
      email,
      fullName: String(user.user_metadata?.full_name ?? user.user_metadata?.display_name ?? ''),
      phone: user.user_metadata?.phone ? String(user.user_metadata.phone) : null,
      isAdmin: this.adminEmails.has(email.toLowerCase()),
    };
  }
}
