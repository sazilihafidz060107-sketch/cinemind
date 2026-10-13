-- ====================================================================
-- SKEMA DATABASE USERS SIM CINEMIND (POSTGRESQL / MYSQL / SQLITE)
-- Himpunan Mahasiswa Kajian Film, Televisi, dan Media (KFTM)
-- ====================================================================

-- Definisi Enum Role Khusus Pengurus Himpunan
-- Diizinkan hanya: bph_inti, bph_sekretaris, bph_bendahara, admin_medinfo
CREATE TYPE user_role AS ENUM (
  'bph_inti',
  'bph_sekretaris',
  'bph_bendahara',
  'admin_medinfo'
);

-- Tabel Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  nim VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL, -- Wajib berupa bcrypt hash (cost 10)
  role VARCHAR(30) NOT NULL,      -- bph_inti | bph_sekretaris | bph_bendahara | admin_medinfo
  is_first_login BOOLEAN NOT NULL DEFAULT TRUE,
  title VARCHAR(100),             -- Contoh: "Wakil Ketua Himpunan"
  class_code VARCHAR(20),         -- Contoh: "P VMC"
  avatar VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index untuk performa pencarian autentikasi berdasarkan NIM
CREATE UNIQUE INDEX idx_users_nim ON users (nim);
CREATE INDEX idx_users_role ON users (role);
