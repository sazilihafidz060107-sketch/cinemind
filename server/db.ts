import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export type AllowedRole = 'bph_inti' | 'bph_sekretaris' | 'bph_bendahara' | 'admin_medinfo';

export const ALLOWED_ROLES: AllowedRole[] = [
  'bph_inti',
  'bph_sekretaris',
  'bph_bendahara',
  'admin_medinfo',
];

export interface UserEntity {
  id: string;
  nim: string;
  name: string;
  password: string; // bcrypt hash
  role: AllowedRole;
  is_first_login: boolean;
  title: string;
  class_code?: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

const DB_FILE = path.resolve(process.cwd(), 'server-users.json');

// In-Memory & File Persistent Database
class UserDatabase {
  private users: UserEntity[] = [];

  constructor() {
    this.loadDatabase();
    if (this.users.length === 0) {
      this.runSeeder();
    }
  }

  private loadDatabase() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.users = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading database file, initializing fresh:', e);
      this.users = [];
    }
  }

  private saveDatabase() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database to file:', e);
    }
  }

  /**
   * CRITICAL SECURITY SEEDER:
   * Password awal yang di-seed disamakan dengan nama role masing-masing,
   * lalu WAJIB di-hash menggunakan algoritma bcrypt (salt 10 rounds).
   * Plaintext tidak pernah disimpan.
   */
  public runSeeder() {
    console.log('[SEEDER] Menjalankan Database Seeder Akun Pengurus Cinemind...');

    const seedRoster = [
      {
        id: 'usr-bph-1',
        nim: '1525020016',
        name: 'Aisyah Liuy Wulandari',
        role: 'bph_inti' as AllowedRole,
        title: 'Ketua Himpunan Cinemind',
        class_code: 'P PRDC',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-bph-2',
        nim: '1525020028',
        name: 'Hafidz Sazili',
        role: 'bph_inti' as AllowedRole,
        title: 'Wakil Ketua Himpunan',
        class_code: 'P VMC',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-sekre-1',
        nim: '1525020042',
        name: 'Aileen Izza Salim',
        role: 'bph_sekretaris' as AllowedRole,
        title: 'Sekretaris Himpunan',
        class_code: 'P CDA',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-benda-1',
        nim: '1525020052',
        name: 'Abdan Syakuro Dwi Indrako',
        role: 'bph_bendahara' as AllowedRole,
        title: 'Bendahara I Himpunan',
        class_code: 'P CDA',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-benda-2',
        nim: '1525020041',
        name: 'Zazkya Shelomita Anjani',
        role: 'bph_bendahara' as AllowedRole,
        title: 'Bendahara II Himpunan',
        class_code: 'P PRDC',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      },
      {
        id: 'usr-medinfo-1',
        nim: '1525020030',
        name: 'Muhammad Hilman Al Ghazy',
        role: 'admin_medinfo' as AllowedRole,
        title: 'Kepala Divisi Media & Informasi',
        class_code: 'P CDA',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      },
    ];

    const timestamp = new Date().toISOString();

    this.users = seedRoster.map((item) => {
      // Password awal sama persis dengan nama role: contoh "bph_bendahara"
      const initialPlainPassword = item.role;
      // Wajib hash dengan bcrypt (cost 10)
      const hashedPassword = bcrypt.hashSync(initialPlainPassword, 10);

      return {
        id: item.id,
        nim: item.nim,
        name: item.name,
        password: hashedPassword,
        role: item.role,
        is_first_login: true, // Default: true (wajib ganti password pada login pertama)
        title: item.title,
        class_code: item.class_code,
        avatar: item.avatar,
        created_at: timestamp,
        updated_at: timestamp,
      };
    });

    this.saveDatabase();
    console.log(`[SEEDER] Berhasil menyemai ${this.users.length} akun pengurus resmi dengan password ter-hash bcrypt.`);
  }

  public findByNim(nim: string): UserEntity | undefined {
    return this.users.find((u) => u.nim === nim.trim());
  }

  public findById(id: string): UserEntity | undefined {
    return this.users.find((u) => u.id === id);
  }

  public getAll(): UserEntity[] {
    return [...this.users];
  }

  public updatePassword(userId: string, newHashedPassword: string): boolean {
    const user = this.findById(userId);
    if (!user) return false;

    user.password = newHashedPassword;
    user.is_first_login = false; // Status diubah menjadi false setelah sukses ganti kata sandi
    user.updated_at = new Date().toISOString();

    this.saveDatabase();
    return true;
  }

  public resetAllToSeeder() {
    this.runSeeder();
  }
}

export const db = new UserDatabase();
