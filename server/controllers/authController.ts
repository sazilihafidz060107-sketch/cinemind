import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, ALLOWED_ROLES, AllowedRole } from '../db';
import { JWT_SECRET, AuthRequest } from '../middleware/authMiddleware';

export const AuthController = {
  /**
   * POST /api/login
   * Menerima nim dan password.
   * Verifikasi hash bcrypt, validasi role, cek is_first_login.
   */
  async login(req: Request, res: Response) {
    try {
      const { nim, password } = req.body;

      if (!nim || !password) {
        return res.status(400).json({ error: 'NIM dan kata sandi wajib diisi.' });
      }

      const user = db.findByNim(nim.toString());
      if (!user) {
        return res.status(401).json({ error: 'NIM atau kata sandi tidak terdaftar di sistem pengurus.' });
      }

      // Verifikasi hash bcrypt
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'NIM atau kata sandi tidak cocok.' });
      }

      // Role Validation: Pastikan role adalah salah satu dari 4 role resmi
      if (!ALLOWED_ROLES.includes(user.role)) {
        return res.status(403).json({ 
          error: 'Akses Ditolak (403 Forbidden): Hanya pengurus resmi (bph_inti, bph_sekretaris, bph_bendahara, admin_medinfo) yang diizinkan mengakses SIM.' 
        });
      }

      // Force Change Password Flow:
      // Jika is_first_login bernilai TRUE, JANGAN berikan token akses dashboard!
      // Kembalikan HTTP 428 Precondition Required dengan temporary token khusus.
      if (user.is_first_login) {
        const temporaryToken = jwt.sign(
          { 
            id: user.id, 
            nim: user.nim, 
            role: user.role, 
            purpose: 'first_login_change' 
          },
          JWT_SECRET,
          { expiresIn: '1h' }
        );

        return res.status(428).json({
          require_password_change: true,
          status_code: 428,
          temporary_token: temporaryToken,
          message: 'Akun Anda baru pertama kali masuk. Demi standar keamanan kepengurusan, Anda diwajibkan mengganti kata sandi awal sebelum dapat mengakses SIM.',
          user: {
            id: user.id,
            nim: user.nim,
            name: user.name,
            role: user.role,
            title: user.title,
            is_first_login: true,
          },
        });
      }

      // Jika bukan login pertama (is_first_login === false), berikan token JWT dashboard valid
      const dashboardToken = jwt.sign(
        { 
          id: user.id, 
          nim: user.nim, 
          role: user.role, 
          name: user.name,
          purpose: 'dashboard_access'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Login berhasil.',
        token: dashboardToken,
        user: {
          id: user.id,
          nim: user.nim,
          name: user.name,
          role: user.role,
          title: user.title,
          class_code: user.class_code,
          avatar: user.avatar,
          is_first_login: false,
        },
      });

    } catch (error: any) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan internal server saat proses login.' });
    }
  },

  /**
   * POST /api/change-password
   * Meminta password_baru.
   * Hash password baru, simpan ke database, ubah is_first_login menjadi false.
   * Lalu berikan JWT dashboard token yang valid.
   */
  async changePassword(req: Request, res: Response) {
    try {
      const { password_baru, temporary_token } = req.body;
      const authHeader = req.headers['authorization'];
      const token = temporary_token || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);

      if (!token) {
        return res.status(401).json({ error: 'Token autentikasi tidak valid atau tidak disediakan.' });
      }

      let decoded: any;
      try {
        decoded = jwt.verify(token, JWT_SECRET);
      } catch (e) {
        return res.status(401).json({ error: 'Sesi token kedaluwarsa. Silakan login kembali.' });
      }

      const user = db.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ error: 'Data pengurus tidak ditemukan.' });
      }

      // Validasi password baru
      if (!password_baru || typeof password_baru !== 'string') {
        return res.status(400).json({ error: 'Kata sandi baru wajib diisi.' });
      }

      if (password_baru.length < 6) {
        return res.status(400).json({ error: 'Kata sandi baru minimal 6 karakter demi keamanan akun.' });
      }

      // Tidak boleh sama dengan password default nama role
      if (password_baru.trim() === user.role) {
        return res.status(400).json({ 
          error: `Kata sandi baru tidak boleh sama dengan kata sandi awal bawaan sistem (${user.role}). Harap pilih kata sandi yang unik.` 
        });
      }

      // Hash password baru dengan bcrypt (cost 10)
      const newHashedPassword = bcrypt.hashSync(password_baru.trim(), 10);

      // Simpan ke database dan ubah is_first_login menjadi false
      const success = db.updatePassword(user.id, newHashedPassword);
      if (!success) {
        return res.status(500).json({ error: 'Gagal memperbarui kata sandi di database.' });
      }

      // Terbitkan JWT Dashboard Token yang valid
      const dashboardToken = jwt.sign(
        { 
          id: user.id, 
          nim: user.nim, 
          role: user.role, 
          name: user.name,
          purpose: 'dashboard_access'
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({
        message: 'Kata sandi baru berhasil disimpan. Akun Anda telah siap digunakan.',
        token: dashboardToken,
        user: {
          id: user.id,
          nim: user.nim,
          name: user.name,
          role: user.role,
          title: user.title,
          class_code: user.class_code,
          avatar: user.avatar,
          is_first_login: false,
        },
      });

    } catch (error: any) {
      console.error('Change password error:', error);
      return res.status(500).json({ error: 'Terjadi kesalahan sistem saat menyimpan kata sandi baru.' });
    }
  },

  /**
   * GET /api/me
   * Memeriksa profil user aktif
   */
  async me(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ error: 'Sesi tidak valid.' });
    }

    const user = db.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        nim: user.nim,
        name: user.name,
        role: user.role,
        title: user.title,
        class_code: user.class_code,
        avatar: user.avatar,
        is_first_login: user.is_first_login,
      },
    });
  },

  /**
   * POST /api/reset-seeder
   * Reset database akun ke seeder awal (untuk pengujian ulang)
   */
  async resetSeeder(req: Request, res: Response) {
    db.resetAllToSeeder();
    return res.status(200).json({ 
      message: 'Database berhasil di-reset ke kondisi seeder awal dengan password bcrypt.',
      roster: db.getAll().map((u) => ({
        nim: u.nim,
        name: u.name,
        role: u.role,
        default_password: u.role,
        is_first_login: u.is_first_login,
      }))
    });
  },

  /**
   * GET /api/roster
   * Mengambil daftar akun pengurus yang di-seed (tanpa hash password) untuk helper UI pengujian
   */
  async getRoster(req: Request, res: Response) {
    const list = db.getAll().map((u) => ({
      id: u.id,
      nim: u.nim,
      name: u.name,
      role: u.role,
      title: u.title,
      is_first_login: u.is_first_login,
      avatar: u.avatar,
    }));
    return res.status(200).json({ users: list });
  }
};
