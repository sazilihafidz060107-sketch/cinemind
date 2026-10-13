import { Letter, LetterClassification } from '../types';

export const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

export const CLASSIFICATION_LABELS: Record<LetterClassification, { label: string; desc: string }> = {
  INT: { label: 'Surat Internal (INT)', desc: 'Komunikasi antar divisi & pengurus internal himpunan' },
  EKS: { label: 'Surat Eksternal (EKS)', desc: 'Surat ke pihak kampus, BEM, ormawa lain, atau sponsor' },
  MANDAT: { label: 'Surat Mandat (MANDAT)', desc: 'Pemberian mandat wewenang perwakilan organisasi' },
  TUGAS: { label: 'Surat Tugas (TUGAS)', desc: 'Penugasan kru syuting, delegasi lomba / festival' },
  IZIN: { label: 'Permohonan Izin (IZIN)', desc: 'Izin lokasi syuting, peminjaman ruang screening' },
  PENGANTAR: { label: 'Surat Pengantar (PENGANTAR)', desc: 'Pengantar proposal, berkas administrasi' },
  UNDANGAN: { label: 'Surat Undangan (UNDANGAN)', desc: 'Undangan rapat kerja, screening, premier film' },
  SK: { label: 'Surat Keputusan (SK)', desc: 'Ketetapan organisasi, pengangkatan panitia, hasil musker' },
};

/**
 * Calculates next sequence number safely (pessimistic increment pattern).
 */
export function getNextSequenceNumber(existingLetters: Letter[], targetYear?: number): number {
  const currentYear = targetYear || new Date().getFullYear();
  // Filter letters created or dated in the same year
  const lettersInYear = existingLetters.filter(l => {
    const year = new Date(l.letterDate || l.createdAt).getFullYear();
    return year === currentYear;
  });

  if (lettersInYear.length === 0) return 1;

  const maxSeq = Math.max(...lettersInYear.map(l => l.sequenceNumber || 0));
  return maxSeq + 1;
}

/**
 * Formats sequence number to 3 digits (e.g. 1 -> "001", 12 -> "012")
 */
export function formatSequenceNumber(num: number): string {
  return String(num).padStart(3, '0');
}

/**
 * Formulates the official letter number per standard administrative guideline:
 * e.g., 001/INT/BPH-CINEMIND/X/2026
 */
export function generateLetterNumber(
  seq: number,
  classification: LetterClassification,
  dateStr?: string
): string {
  const date = dateStr ? new Date(dateStr) : new Date();
  const month = date.getMonth() + 1;
  const romanMonth = ROMAN_MONTHS[month] || 'X';
  const year = date.getFullYear() || 2026;
  const formattedSeq = formatSequenceNumber(seq);

  return `${formattedSeq}/${classification}/BPH-CINEMIND/${romanMonth}/${year}`;
}
