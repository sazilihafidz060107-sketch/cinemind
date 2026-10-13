import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Eye, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Upload, 
  Sparkles, 
  PenTool, 
  RotateCcw,
  ShieldCheck,
  Info
} from 'lucide-react';
import { Letter, LetterClassification } from '../../types';
import { 
  generateLetterNumber, 
  getNextSequenceNumber, 
  CLASSIFICATION_LABELS,
  formatSequenceNumber,
  ROMAN_MONTHS
} from '../../utils/letterNumber';
import { generateOfficialLetterPDF, formatDateIndonesian } from '../../utils/pdfGenerator';
import { SAMPLE_SIGNATURE_AILEEN, SAMPLE_SIGNATURE_HAFIDZ } from '../../data/initialData';

interface SimLetterGeneratorProps {
  existingLetters: Letter[];
  onSaveLetter: (letter: Letter) => void;
  onNavigateToArchive: () => void;
}

export const SimLetterGenerator: React.FC<SimLetterGeneratorProps> = ({
  existingLetters,
  onSaveLetter,
  onNavigateToArchive,
}) => {
  // Today date formatted YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];

  // Form State
  const [classification, setClassification] = useState<LetterClassification>('INT');
  const [letterDate, setLetterDate] = useState<string>(today);
  const [recipient, setRecipient] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('Tempat');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [closing, setClosing] = useState<string>(
    'Demikian surat ini kami sampaikan. Atas perhatian, dukungan, dan kerja sama yang diberikan, kami ucapkan terima kasih.'
  );

  // Signer configuration
  const [hasSecondarySigner, setHasSecondarySigner] = useState<boolean>(true);
  const [signerRole, setSignerRole] = useState<string>('Sekretaris,');
  const [signerName, setSignerName] = useState<string>('Aileen Izza Salim');
  const [signerNim, setSignerNim] = useState<string>('1525020042');
  const [signatureUrl, setSignatureUrl] = useState<string>(SAMPLE_SIGNATURE_AILEEN);

  const [secondarySignerRole, setSecondarySignerRole] = useState<string>('Mengetahui,\nWakil Ketua Himpunan,');
  const [secondarySignerName, setSecondarySignerName] = useState<string>('Hafidz Sazili');
  const [secondarySignerNim, setSecondarySignerNim] = useState<string>('1525020028');
  const [secondarySignatureUrl, setSecondarySignatureUrl] = useState<string>(SAMPLE_SIGNATURE_HAFIDZ);

  // Status & Validation
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [successGeneratedLetter, setSuccessGeneratedLetter] = useState<Letter | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningTransparency, setWarningTransparency] = useState<string | null>(null);
  const [showLivePreview, setShowLivePreview] = useState<boolean>(true);

  // Dynamic Letter Number formulation
  const nextSeq = getNextSequenceNumber(existingLetters, new Date(letterDate).getFullYear());
  const formattedLetterNumber = generateLetterNumber(nextSeq, classification, letterDate);

  // Template Quick Fill Presets
  const applyTemplate = (type: 'undangan' | 'izin' | 'tugas' | 'sponsor') => {
    if (type === 'undangan') {
      setClassification('INT');
      setRecipient('Seluruh Pengurus & Koordinator Divisi Himpunan Cinemind');
      setRecipientAddress('Gedung Creative Hub Lt. 3, Tangerang');
      setSubject('Undangan Rapat Kerja (Raker) Evaluasi Paruh Waktu Kabinet 2026');
      setContent(
        'Sehubungan dengan telah berjalannya program kerja semester pertama, Badan Pengurus Harian Cinemind mengundang seluruh koordinator divisi dan anggota aktif untuk menghadiri Rapat Kerja Evaluasi Paruh Waktu.\n\nAdapun agenda utama mencakup evaluasi distribusi penayangan film, laporan pembukuan kas tengah tahun, serta perancangan malam screening karya penutup tahun.\n\nKegiatan akan dilaksanakan pada hari Sabtu, 24 Oktober 2026 pukul 13.00 WIB s/d selesai bertempat di Ruang Audio Visual 201.'
      );
    } else if (type === 'izin') {
      setClassification('IZIN');
      setRecipient('Kepala Bagian Sarana & Prasarana Kampus');
      setRecipientAddress('Gedung Rektorat Kampus Utama, Tangerang');
      setSubject('Permohonan Izin Lokasi & Pemakaian Studio Sinema untuk Syuting Film Pendek');
      setContent(
        'Dalam rangka proses produksi film fiksi pendek karya tugas semester bertajuk "Bayang di Balik Layar", Himpunan Mahasiswa Cinemind bermaksud mengajukan permohonan izin lokasi syuting dan peminjaman fasilitas studio audio-visual.\n\nKegiatan produksi dijadwalkan pada hari Jumat - Sabtu, 30-31 Oktober 2026, pukul 15.00 - 21.00 WIB dengan total kru sebanyak 15 mahasiswa.\n\nKami bertanggung jawab penuh atas kebersihan, ketertiban, dan pemeliharaan seluruh inventaris fasilitas yang digunakan.'
      );
    } else if (type === 'tugas') {
      setClassification('TUGAS');
      setRecipient('Mahasiswa Delegasi Festival Sinema');
      setRecipientAddress('Himpunan Mahasiswa Cinemind');
      setSubject('Surat Tugas Kru Delegasi Festival Film Pelajar & Mahasiswa Nasional 2026');
      setContent(
        'Berdasarkan pengumuman seleksi kurasi Festival Sinema Mahasiswa Tingkat Nasional, Badan Pengurus Harian Cinemind menugaskan mahasiswa berikut:\n\n1. Bima Prasetya (NIM 241150058) - Sutradara\n2. Daffa Nugraha (NIM 241150091) - Sinematografer (DOP)\n\nSebagai delegasi resmi perwakilan almamater dalam sesi masterclass, presentasi film karya, dan malam penganugerahan festival yang berlangsung di Jakarta Convention Center pada 28 Oktober 2026.'
      );
    } else if (type === 'sponsor') {
      setClassification('EKS');
      setRecipient('Pimpinan / Manager Brand Partner');
      setRecipientAddress('Di Tempat');
      setSubject('Permohonan Kerjasama Sponsorship Screening & Pemutaran Film Cinemind Night');
      setContent(
        'Himpunan Mahasiswa Film & Sinematografi Cinemind akan menyelenggarakan agenda pemutaran film tahunan "Cinemind Screening Night 2026" yang menargetkan lebih dari 300 penonton penikmat film independen dari berbagai universitas.\n\nMelalui surat ini, kami bermaksud menawarkan peluang kemitraan dan sponsorship yang saling menguntungkan untuk mendukung suksesnya perhelatan ini sebagaimana rincian proposal terlampir.'
      );
    }
  };

  // Upload handler with Transparency check per PRD Edge Case
  const handleSignatureUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'primary' | 'secondary'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: must be .png as per PRD
    if (!file.name.toLowerCase().endsWith('.png') && file.type !== 'image/png') {
      setWarningTransparency('PERINGATAN: Berkas bukan format .PNG. Format tanda tangan wajib .PNG dengan latar transparan agar tidak menutupi teks dokumen!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'primary') {
        setSignatureUrl(dataUrl);
      } else {
        setSecondarySignatureUrl(dataUrl);
      }
      setWarningTransparency('Berkas .PNG transparan berhasil diverifikasi dan dipasang pada posisi tanda tangan!');
      setTimeout(() => setWarningTransparency(null), 6000);
    };
    reader.readAsDataURL(file);
  };

  // Main PDF Generation & Save Submission
  const handleGenerateAndSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recipient.trim()) {
      setErrorMessage('Tujuan / Kepada Yth penerima surat tidak boleh kosong.');
      return;
    }
    if (!subject.trim()) {
      setErrorMessage('Perihal surat tidak boleh kosong.');
      return;
    }
    if (!content.trim()) {
      setErrorMessage('Isi surat tidak boleh kosong.');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    try {
      // Simulate formal document assembly & margin compilation (lock state prevents double submit per PRD)
      await new Promise((resolve) => setTimeout(resolve, 850));

      const newLetter: Letter = {
        id: `let-${Date.now()}`,
        letterNumber: formattedLetterNumber,
        sequenceNumber: nextSeq,
        classificationCode: classification,
        recipient,
        recipientAddress,
        subject,
        letterDate,
        content,
        closing,
        signerName,
        signerRole,
        signerNim,
        secondarySignerName: hasSecondarySigner ? secondarySignerName : undefined,
        secondarySignerRole: hasSecondarySigner ? secondarySignerRole : undefined,
        secondarySignerNim: hasSecondarySigner ? secondarySignerNim : undefined,
        signatureImageUrl: signatureUrl,
        secondarySignatureImageUrl: hasSecondarySigner ? secondarySignatureUrl : undefined,
        hasKop: true,
        status: 'Diterbitkan',
        createdAt: new Date().toISOString(),
      };

      // 1. Generate jsPDF
      const pdfDoc = generateOfficialLetterPDF(newLetter);

      // 2. Persist to storage
      onSaveLetter(newLetter);

      // 3. Trigger immediate download
      const fileName = `SURAT_${newLetter.letterNumber.replace(/\//g, '_')}.pdf`;
      pdfDoc.save(fileName);

      setSuccessGeneratedLetter(newLetter);
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Gagal memproses dokumen PDF: ' + (err.message || 'Kesalahan sistem'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title & Guidelines Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span className="text-[#E50914] font-bold">GENERATOR SURAT RESMI</span>
            <span>•</span>
            <span>PEDOMAN ADMINISTRASI BAKU</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Pembuatan Surat Keluar & TTE Digital
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Sistem otomatis merangkai kode klasifikasi, penomoran urut cerdas, margin pedoman A4, dan penempelan Tanda Tangan Elektronik (TTE) siap unduh.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onNavigateToArchive}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold uppercase tracking-wider rounded-[2px] border border-gray-300 cursor-pointer"
          >
            Lihat Arsip Surat
          </button>
          <button
            type="button"
            onClick={() => setShowLivePreview(!showLivePreview)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>{showLivePreview ? 'Sembunyikan Preview' : 'Tampilkan Preview'}</span>
          </button>
        </div>
      </div>

      {/* Quick Template Selector */}
      <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono uppercase text-gray-500 font-bold flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-[#E50914]" />
            Template Cepat Pedoman Administrasi:
          </span>
          <span className="text-[11px] text-gray-400">Klik untuk mengisi draft instan</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => applyTemplate('undangan')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-800 rounded-[2px] font-medium cursor-pointer"
          >
            Undangan Raker Kabinet (INT)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('izin')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-800 rounded-[2px] font-medium cursor-pointer"
          >
            Izin Lokasi Syuting (IZIN)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('tugas')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-800 rounded-[2px] font-medium cursor-pointer"
          >
            Surat Tugas Delegasi Kru (TUGAS)
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('sponsor')}
            className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-xs text-gray-800 rounded-[2px] font-medium cursor-pointer"
          >
            Permohonan Sponsorship (EKS)
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-[2px] text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {warningTransparency && (
        <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-[2px] text-xs flex items-center space-x-2 animate-in fade-in">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{warningTransparency}</span>
        </div>
      )}

      {successGeneratedLetter && (
        <div className="p-5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-sm">
                Surat Resmi Berhasil Diterbitkan & Diunduh!
              </p>
              <p className="text-xs font-mono text-emerald-700">
                Nomor: {successGeneratedLetter.letterNumber} | Tersimpan otomatis di Arsip Surat
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const doc = generateOfficialLetterPDF(successGeneratedLetter);
                doc.save(`SURAT_${successGeneratedLetter.letterNumber.replace(/\//g, '_')}.pdf`);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-[2px] uppercase tracking-wider cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Unduh Lagi (.PDF)</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-[2px] uppercase tracking-wider cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Cetak Fisik</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Dedicated Form (Left) & Live A4 Paper Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Full-Page Form (Left Column) */}
        <form 
          onSubmit={handleGenerateAndSave} 
          className={`space-y-6 ${showLivePreview ? 'lg:col-span-7' : 'lg:col-span-12'}`}
        >
          
          {/* Section 1: Klasifikasi & Nomor Surat Otomatis */}
          <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard space-y-4">
            <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight pb-2 border-b border-gray-100 flex items-center justify-between">
              <span>1. Klasifikasi & Penomoran Cerdas</span>
              <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-[2px] border border-emerald-200">
                URUTAN KE #{formatSequenceNumber(nextSeq)}
              </span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Jenis / Klasifikasi Surat *
                </label>
                <select
                  value={classification}
                  onChange={(e) => setClassification(e.target.value as LetterClassification)}
                  className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(CLASSIFICATION_LABELS).map(([code, meta]) => (
                    <option key={code} value={code}>
                      {meta.label}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-gray-500 mt-1 font-mono">
                  {CLASSIFICATION_LABELS[classification].desc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Tanggal Dokumen *
                </label>
                <input
                  type="date"
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Generated Letter Number Display */}
            <div className="p-3.5 bg-gray-50 border border-gray-300 rounded-[2px] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono text-gray-500 block">
                  Nomor Surat Terpasang Otomatis (Standar Baku):
                </span>
                <span className="font-mono text-sm sm:text-base font-bold text-gray-900 tracking-wide">
                  {formattedLetterNumber}
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>

          {/* Section 2: Tujuan & Perihal */}
          <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard space-y-4">
            <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight pb-2 border-b border-gray-100">
              2. Tujuan & Perihal Surat
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Kepada Yth. (Penerima Surat) *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kepala Biro Kemahasiswaan"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Alamat / Instansi Penerima
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Kampus Utama ITB Bina Sarana Global"
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                Perihal Surat (Subject) *
              </label>
              <input
                type="text"
                placeholder="Contoh: Permohonan Izin Lokasi Syuting Film Pendek"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                required
              />
            </div>
          </div>

          {/* Section 3: Isi & Redaksi Surat */}
          <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard space-y-4">
            <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight pb-2 border-b border-gray-100">
              3. Batang Tubuh & Narasi Dokumen
            </h2>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                Isi Surat (Gunakan enter untuk paragraf baru) *
              </label>
              <textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan isi surat resmi di sini..."
                className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs p-3 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed font-body"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                Kalimat Penutup
              </label>
              <input
                type="text"
                value={closing}
                onChange={(e) => setClosing(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Section 4: Penandatangan & Tanda Tangan Digital (TTE) */}
          <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight">
                4. Penandatangan & TTE Digital
              </h2>
              <label className="flex items-center space-x-2 text-xs font-mono text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSecondarySigner}
                  onChange={(e) => setHasSecondarySigner(e.target.checked)}
                  className="rounded-[2px] text-[#E50914] focus:ring-red-500"
                />
                <span>Gunakan 2 Penandatangan (Sekretaris & Ketua)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Penandatangan 1 (Sekretaris / Pengusul) */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-[2px] space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-gray-700 block">
                  Penandatangan 1 (Sekretaris / Pengaju)
                </span>
                
                <div>
                  <label className="block text-[11px] text-gray-600 font-mono mb-0.5">Jabatan:</label>
                  <input
                    type="text"
                    value={signerRole}
                    onChange={(e) => setSignerRole(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 font-mono mb-0.5">Nama Lengkap:</label>
                  <input
                    type="text"
                    value={signerName}
                    onChange={(e) => setSignerName(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px] font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 font-mono mb-0.5">NIM:</label>
                  <input
                    type="text"
                    value={signerNim}
                    onChange={(e) => setSignerNim(e.target.value)}
                    className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px] font-mono"
                  />
                </div>

                {/* TTE Preview & Upload */}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono font-semibold text-gray-700">TTE Terpasang (.png):</span>
                    <button
                      type="button"
                      onClick={() => setSignatureUrl(SAMPLE_SIGNATURE_AILEEN)}
                      className="text-[10px] text-[#E50914] hover:underline font-mono cursor-pointer"
                    >
                      Reset Default Aileen
                    </button>
                  </div>
                  <div className="h-16 bg-white border border-dashed border-gray-300 rounded-[2px] flex items-center justify-center p-1 relative overflow-hidden">
                    <img src={signatureUrl} alt="TTE" className="max-h-full object-contain" />
                  </div>
                  
                  <div className="mt-2">
                    <label 
                      className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-2 py-1 rounded-[2px] cursor-pointer"
                      title="Pastikan latar belakang tanda tangan transparan (.png) agar teks tidak tertutup"
                    >
                      <Upload className="w-3 h-3 text-gray-500" />
                      <span>Upload TTE PNG Transparan</span>
                      <input
                        type="file"
                        accept="image/png"
                        onChange={(e) => handleSignatureUpload(e, 'primary')}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Penandatangan 2 (Ketua / Mengetahui) */}
              {hasSecondarySigner && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-[2px] space-y-3">
                  <span className="text-xs font-mono font-bold uppercase text-gray-700 block">
                    Penandatangan 2 (Ketua Umum / Mengetahui)
                  </span>

                  <div>
                    <label className="block text-[11px] text-gray-600 font-mono mb-0.5">Jabatan:</label>
                    <input
                      type="text"
                      value={secondarySignerRole}
                      onChange={(e) => setSecondarySignerRole(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 font-mono mb-0.5">Nama Lengkap:</label>
                    <input
                      type="text"
                      value={secondarySignerName}
                      onChange={(e) => setSecondarySignerName(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px] font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-gray-600 font-mono mb-0.5">NIM:</label>
                    <input
                      type="text"
                      value={secondarySignerNim}
                      onChange={(e) => setSecondarySignerNim(e.target.value)}
                      className="w-full bg-white border border-gray-300 text-xs px-2.5 py-1.5 rounded-[2px] font-mono"
                    />
                  </div>

                  {/* TTE Preview & Upload */}
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-semibold text-gray-700">TTE Terpasang (.png):</span>
                      <button
                        type="button"
                        onClick={() => setSecondarySignatureUrl(SAMPLE_SIGNATURE_HAFIDZ)}
                        className="text-[10px] text-[#E50914] hover:underline font-mono cursor-pointer"
                      >
                        Reset Default Hafidz
                      </button>
                    </div>
                    <div className="h-16 bg-white border border-dashed border-gray-300 rounded-[2px] flex items-center justify-center p-1 relative overflow-hidden">
                      <img src={secondarySignatureUrl} alt="TTE" className="max-h-full object-contain" />
                    </div>

                    <div className="mt-2">
                      <label 
                        className="inline-flex items-center space-x-1.5 text-[11px] font-mono text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-2 py-1 rounded-[2px] cursor-pointer"
                        title="Pastikan latar belakang tanda tangan transparan (.png) agar teks tidak tertutup"
                      >
                        <Upload className="w-3 h-3 text-gray-500" />
                        <span>Upload TTE PNG Transparan</span>
                        <input
                          type="file"
                          accept="image/png"
                          onChange={(e) => handleSignatureUpload(e, 'secondary')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Action Submit Bar */}
          <div className="p-4 bg-white border border-gray-200 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600 font-mono">
              Status Nomor: <strong>{formattedLetterNumber}</strong>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className={`flex items-center space-x-2 px-6 py-3 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red transition-all cursor-pointer ${
                isProcessing ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses Dokumen...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Generate PDF & Simpan ke Arsip</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Live A4 Paper Simulation (Right Column) */}
        {showLivePreview && (
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-gray-800 text-white p-3 rounded-[2px] flex items-center justify-between text-xs font-mono">
              <span>SIMULASI CETAK DOKUMEN (A4 BAKU)</span>
              <span className="text-emerald-400">MARGIN 2.5 CM // TIMES</span>
            </div>

            {/* Paper Sheet Preview */}
            <div className="bg-white border border-gray-300 p-6 sm:p-8 rounded-[2px] shadow-lg text-gray-900 text-[11px] font-serif leading-relaxed min-h-[640px] flex flex-col justify-between">
              <div>
                
                {/* Kop Surat */}
                <div className="border-b-2 border-black pb-2 mb-4">
                  <div className="flex items-center space-x-3 mb-1">
                    <div className="w-8 h-10 bg-[#E50914] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      C
                    </div>
                    <div>
                      <p className="font-bold text-[10px] tracking-wide text-gray-900 uppercase">
                        HIMPUNAN MAHASISWA FILM & SINEMATOGRAFI
                      </p>
                      <p className="font-bold text-sm tracking-widest text-[#E50914]">
                        CINEMIND
                      </p>
                      <p className="text-[9px] text-gray-600">
                        INSTITUT TEKNOLOGI & BISNIS BINA SARANA GLOBAL
                      </p>
                      <p className="text-[8px] text-gray-500">
                        Sekretariat: Gedung Creative Hub Lt. 3 | Surel: sekretariat.cinemind@gmail.com
                      </p>
                    </div>
                  </div>
                  <div className="h-[0.5px] bg-black mt-1"></div>
                </div>

                {/* Tanggal */}
                <div className="text-right text-[10px] text-gray-700 mb-3">
                  Tangerang, {formatDateIndonesian(letterDate)}
                </div>

                {/* Info Header */}
                <div className="space-y-0.5 text-[10px] mb-4">
                  <p>Nomor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong className="font-mono">{formattedLetterNumber}</strong></p>
                  <p>Lampiran&nbsp;: -</p>
                  <p>Perihal&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{subject || '[Perihal Surat]'}</strong></p>
                </div>

                {/* Penerima */}
                <div className="mb-4 text-[10px]">
                  <p>Kepada Yth.</p>
                  <p className="font-bold">{recipient || '[Nama Penerima]'}</p>
                  <p>{recipientAddress || 'Di Tempat'}</p>
                </div>

                {/* Salam & Isi */}
                <div className="space-y-2 text-[10.5px]">
                  <p>Dengan hormat,</p>
                  <div className="whitespace-pre-line text-justify">
                    {content || 'Isi surat akan terformat secara baku sesuai dengan baris dan paragraf yang diinputkan oleh sekretaris...'}
                  </div>
                  <p className="mt-2 text-justify">
                    {closing}
                  </p>
                </div>

              </div>

              {/* Tanda Tangan */}
              <div className="pt-6 mt-6 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-center text-[10px]">
                  <div>
                    <p className="whitespace-pre-line">{signerRole}</p>
                    <div className="h-12 my-1 flex items-center justify-center">
                      <img src={signatureUrl} alt="TTE" className="max-h-full object-contain" />
                    </div>
                    <p className="font-bold underline">{signerName}</p>
                    <p className="text-[9px] text-gray-600">NIM. {signerNim}</p>
                  </div>

                  {hasSecondarySigner && (
                    <div>
                      <p className="whitespace-pre-line">{secondarySignerRole}</p>
                      <div className="h-12 my-1 flex items-center justify-center">
                        <img src={secondarySignatureUrl} alt="TTE" className="max-h-full object-contain" />
                      </div>
                      <p className="font-bold underline">{secondarySignerName}</p>
                      <p className="text-[9px] text-gray-600">NIM. {secondarySignerNim}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-2 border-t border-gray-200 text-center text-[8px] font-mono text-gray-400">
                  CINEMIND SIM OFFICIAL ARCHIVE SYSTEM // STANDARD REGULATION 2026
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
