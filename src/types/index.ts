export type UserRole = 'bph_inti' | 'bph_sekretaris' | 'bph_bendahara' | 'admin_medinfo';

export interface User {
  id: string;
  nim: string;
  name: string;
  role: UserRole;
  title: string;
  classCode?: string;
  avatar?: string;
  is_first_login?: boolean;
  token?: string;
}

export interface Member {
  id: string;
  nim: string;
  name: string;
  batch: string; // e.g., '2023', '2024', '2025'
  division: 'BPH' | 'Media & Informasi' | 'Produksi Film' | 'Pengembangan SDM' | 'Hubungan Eksternal';
  status: 'Aktif' | 'Demisioner' | 'Magang';
  phone?: string;
  email?: string;
}

export type LetterClassification = 
  | 'INT'       // Internal
  | 'EKS'       // Eksternal
  | 'MANDAT'    // Surat Mandat
  | 'TUGAS'     // Surat Tugas
  | 'IZIN'      // Surat Permohonan Izin / Lokasi
  | 'PENGANTAR' // Surat Pengantar
  | 'UNDANGAN'  // Surat Undangan
  | 'SK'        // Surat Keputusan;

export interface Letter {
  id: string;
  letterNumber: string;
  sequenceNumber: number;
  classificationCode: LetterClassification;
  recipient: string;
  recipientAddress?: string;
  subject: string;
  letterDate: string; // ISO or YYYY-MM-DD
  content: string;
  closing?: string;
  signerName: string;
  signerRole: string;
  signerNim: string;
  secondarySignerName?: string;
  secondarySignerRole?: string;
  secondarySignerNim?: string;
  signatureImageUrl: string;
  secondarySignatureImageUrl?: string;
  hasKop: boolean;
  status: 'Diterbitkan' | 'Draft' | 'Diarsipkan';
  createdAt: string;
}

export interface FinanceTransaction {
  id: string;
  transactionDate: string;
  type: 'in' | 'out'; // in = debit / pemasukan, out = kredit / pengeluaran
  amount: number;
  category: string;
  description: string;
  recordedBy: string;
  receiptNote?: string;
}

export interface FilmWork {
  id: string;
  title: string;
  director: string;
  producer?: string;
  dop?: string;
  productionHouse?: string; // Rumah produksi / Production House
  year: number;
  duration: string; // e.g. "18 Menit"
  genre: string;
  synopsis: string;
  embedUrl: string; // YouTube embed / watch url
  thumbnailUrl: string;
  featured?: boolean;
  festivalAwards?: string[];
  createdAt?: number; // Timestamp pembuatan / unggahan
}

export interface Officer {
  id: string;
  name: string;
  roleTitle: string;
  division: 'Pembina' | 'Badan Pengurus Harian' | 'Divisi Kajian dan Akademik' | 'Divisi Karya dan Produksi' | 'Divisi Jaringan dan Kemitraan' | 'Divisi Media dan Informasi';
  nim?: string;
  classCode?: string;
  avatar?: string;
  tupoksi: string[];
  proker?: string[];
  level: 0 | 1 | 2 | 3; // 0: Pembina, 1: BPH Inti, 2: Kepala Divisi, 3: Staff Divisi
  phone?: string;
  email?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Warta Kegiatan' | 'Workshop & Sinema' | 'Rilis Karya' | 'Festival' | 'Pengumuman';
  author: string;
  publishDate: string;
  summary: string;
  content: string;
  thumbnailUrl: string;
  readTime: string;
  createdAt?: number; // Timestamp pembuatan / rilis
}
