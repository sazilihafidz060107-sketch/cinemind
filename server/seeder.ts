/**
 * CINEMIND SEEDER SCRIPT
 * 
 * Spesifikasi Seeding:
 * - Skema tabel users: id, nim, password, role, is_first_login, created_at, updated_at
 * - Diizinkan hanya: bph_inti, bph_sekretaris, bph_bendahara, admin_medinfo
 * - Password awal disamakan dengan nama role (e.g. "bph_bendahara")
 * - CRITICAL SECURITY: Password di-hash menggunakan algoritma bcrypt (10 salt rounds).
 */

import { db } from './db';

console.log('====================================================');
console.log('   MENJALANKAN DATABASE SEEDER AKUN PENGURUS CINEMIND');
console.log('====================================================');

db.runSeeder();

const users = db.getAll();
console.log(`\nBerhasil menyemai ${users.length} akun pengurus ke database:`);
users.forEach((u, i) => {
  console.log(`\n[${i + 1}] Nama   : ${u.name}`);
  console.log(`    NIM    : ${u.nim}`);
  console.log(`    Role   : ${u.role}`);
  console.log(`    Default Password: "${u.role}"`);
  console.log(`    Hash (bcrypt)   : ${u.password.substring(0, 28)}...`);
  console.log(`    is_first_login  : ${u.is_first_login}`);
});

console.log('\n====================================================');
console.log('Seeder selesai. Password plaintext TIDAK PERNAH disimpan.');
console.log('====================================================');
