import { User, UserRole } from '../types';

export interface LoginResponse {
  message?: string;
  token?: string;
  user?: User;
  require_password_change?: boolean;
  status_code?: number;
  temporary_token?: string;
  error?: string;
}

export interface ChangePasswordResponse {
  message?: string;
  token?: string;
  user?: User;
  error?: string;
}

export const AuthApi = {
  /**
   * POST /api/login
   */
  async login(nim: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nim: nim.trim(), password: password.trim() }),
      });

      const data = await response.json();

      // Menangani status 428 Precondition Required (Force Change Password)
      if (response.status === 428 || data.require_password_change) {
        return {
          require_password_change: true,
          status_code: 428,
          temporary_token: data.temporary_token,
          user: data.user,
          message: data.message,
        };
      }

      if (!response.ok) {
        return {
          error: data.error || `Login gagal dengan status ${response.status}`,
          status_code: response.status,
        };
      }

      return {
        token: data.token,
        user: data.user,
        message: data.message,
        status_code: 200,
      };
    } catch (err: any) {
      console.error('Network error during login:', err);
      return { error: 'Gagal terhubung ke server autentikasi API.' };
    }
  },

  /**
   * POST /api/change-password
   */
  async changePassword(password_baru: string, temporary_token: string): Promise<ChangePasswordResponse> {
    try {
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${temporary_token}`,
        },
        body: JSON.stringify({
          password_baru: password_baru.trim(),
          temporary_token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || 'Gagal mengubah kata sandi.' };
      }

      return {
        message: data.message,
        token: data.token,
        user: data.user,
      };
    } catch (err: any) {
      console.error('Network error during change password:', err);
      return { error: 'Gagal terhubung ke server saat menyimpan kata sandi baru.' };
    }
  },

  /**
   * GET /api/me
   */
  async getMe(token: string): Promise<User | null> {
    try {
      const response = await fetch('/api/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return null;
      const data = await response.json();
      return data.user;
    } catch {
      return null;
    }
  },

  /**
   * GET /api/roster
   */
  async getRoster(): Promise<any[]> {
    try {
      const response = await fetch('/api/roster');
      if (!response.ok) return [];
      const data = await response.json();
      return data.users || [];
    } catch {
      return [];
    }
  },

  /**
   * POST /api/reset-seeder
   */
  async resetSeeder(): Promise<boolean> {
    try {
      const response = await fetch('/api/reset-seeder', { method: 'POST' });
      return response.ok;
    } catch {
      return false;
    }
  },
};
