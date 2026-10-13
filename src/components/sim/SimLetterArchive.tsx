import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Download, 
  Printer, 
  Eye, 
  Filter, 
  Plus, 
  CheckCircle,
  X,
  FileCheck,
  Trash2
} from 'lucide-react';
import { Letter, LetterClassification } from '../../types';
import { generateOfficialLetterPDF, formatDateIndonesian } from '../../utils/pdfGenerator';
import { CLASSIFICATION_LABELS } from '../../utils/letterNumber';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SimLetterArchiveProps {
  letters: Letter[];
  onNavigateToCreate: () => void;
  onDeleteLetter: (id: string) => void;
}

export const SimLetterArchive: React.FC<SimLetterArchiveProps> = ({
  letters,
  onNavigateToCreate,
  onDeleteLetter,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClassification, setSelectedClassification] = useState<string>('Semua');
  const [viewingLetter, setViewingLetter] = useState<Letter | null>(null);
  const [deleteTargetLetter, setDeleteTargetLetter] = useState<Letter | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const filteredLetters = letters.filter((l) => {
    const matchesClass =
      selectedClassification === 'Semua' || l.classificationCode === selectedClassification;
    const matchesSearch =
      l.letterNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.recipient.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  const handleDownloadPDF = (letter: Letter) => {
    const doc = generateOfficialLetterPDF(letter);
    const fileName = `SURAT_${letter.letterNumber.replace(/\//g, '_')}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>SISTEM ARSIP ELEKTRONIK</span>
            <span>•</span>
            <span className="text-[#E50914] font-bold">PERSURATAN RESMI</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Arsip Surat Keluar Organisasi
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Daftar seluruh surat resmi berkop baku dengan penomoran berurutan dan tanda tangan digital terintegrasi.
          </p>
        </div>

        <button
          onClick={onNavigateToCreate}
          className="flex items-center space-x-2 px-4 py-2.5 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Surat Baru</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nomor, perihal, atau penerima..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs pl-9 pr-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-gray-500 font-mono text-[11px] uppercase shrink-0">Klasifikasi:</span>
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none"
          >
            <option value="Semua">Semua Kode Klasifikasi</option>
            {Object.keys(CLASSIFICATION_LABELS).map((code) => (
              <option key={code} value={code}>
                {code} - {CLASSIFICATION_LABELS[code as LetterClassification].label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feedbackMsg && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-[2px] flex items-center justify-between animate-in fade-in"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-900 p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
        {filteredLetters.length === 0 ? (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-semibold text-gray-900">Belum ada arsip surat yang sesuai.</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Gunakan form generator untuk merakit dokumen surat baku baru berformat PDF.
            </p>
            <button
              onClick={onNavigateToCreate}
              className="mt-4 px-3.5 py-2 bg-[#E50914] text-white text-xs font-semibold rounded-[2px] uppercase cursor-pointer"
            >
              Buat Surat Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">No. Dokumen</th>
                  <th className="py-3 px-3">Kode</th>
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-4">Perihal / Subjek</th>
                  <th className="py-3 px-4">Penerima</th>
                  <th className="py-3 px-4">Penandatangan</th>
                  <th className="py-3 px-4 text-center">Aksi Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-body">
                {filteredLetters.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                    
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {l.letterNumber}
                    </td>

                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 text-[10px] font-mono font-bold rounded-[2px]">
                        {l.classificationCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                      {formatDateIndonesian(l.letterDate)}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-900 max-w-xs truncate">
                      {l.subject}
                    </td>

                    <td className="py-3 px-4 text-gray-700 max-w-[200px] truncate">
                      {l.recipient}
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      {l.signerName} {l.secondarySignerName ? `& ${l.secondarySignerName}` : ''}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1.5">
                        <button
                          onClick={() => setViewingLetter(l)}
                          title="Lihat Pratinjau Dokumen"
                          className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[2px] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownloadPDF(l)}
                          title="Unduh Berkas PDF Resmi"
                          className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-[2px] transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetLetter(l)}
                          title="Hapus Dari Arsip Surat"
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-[2px] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal View Detail Letter */}
      {viewingLetter && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setViewingLetter(null)}
        >
          <div 
            className="relative bg-white rounded-[2px] max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-gray-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck className="w-4 h-4 text-[#E50914]" />
                <span className="font-mono text-xs font-bold">{viewingLetter.letterNumber}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPDF(viewingLetter)}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-mono rounded-[2px] cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>Unduh PDF</span>
                </button>
                <button
                  onClick={() => setViewingLetter(null)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Simulated Paper Content */}
            <div className="p-8 text-[11px] font-serif leading-relaxed text-gray-900 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Kop */}
              <div className="border-b-2 border-black pb-2 mb-3">
                <p className="font-bold text-xs uppercase text-center tracking-wide">
                  HIMPUNAN MAHASISWA FILM & SINEMATOGRAFI CINEMIND
                </p>
                <p className="text-[10px] text-center text-gray-700">
                  INSTITUT TEKNOLOGI & BISNIS BINA SARANA GLOBAL
                </p>
                <p className="text-[8px] text-center text-gray-500">
                  Sekretariat: Gedung Creative Hub Lt. 3 | Surel: sekretariat.cinemind@gmail.com
                </p>
              </div>

              <div className="text-right text-[10px]">
                Tangerang, {formatDateIndonesian(viewingLetter.letterDate)}
              </div>

              <div className="space-y-0.5 text-[10.5px]">
                <p>Nomor&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: <strong className="font-mono">{viewingLetter.letterNumber}</strong></p>
                <p>Lampiran&nbsp;: -</p>
                <p>Perihal&nbsp;&nbsp;&nbsp;&nbsp;: <strong>{viewingLetter.subject}</strong></p>
              </div>

              <div className="pt-2 text-[10.5px]">
                <p>Kepada Yth.</p>
                <p className="font-bold">{viewingLetter.recipient}</p>
                <p>{viewingLetter.recipientAddress || 'Di Tempat'}</p>
              </div>

              <div className="pt-2 space-y-2 text-justify">
                <p>Dengan hormat,</p>
                <div className="whitespace-pre-line">
                  {viewingLetter.content}
                </div>
                <p className="mt-3">
                  {viewingLetter.closing || 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.'}
                </p>
              </div>

              {/* Tanda Tangan */}
              <div className="pt-8 border-t border-gray-200 mt-6 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="whitespace-pre-line text-[10px]">{viewingLetter.signerRole}</p>
                  <div className="h-12 my-1 flex items-center justify-center">
                    <img src={viewingLetter.signatureImageUrl} alt="TTE" className="max-h-full object-contain" />
                  </div>
                  <p className="font-bold underline text-[10px]">{viewingLetter.signerName}</p>
                  <p className="text-[9px] text-gray-600 font-mono">NIM. {viewingLetter.signerNim}</p>
                </div>

                {viewingLetter.secondarySignerName && (
                  <div>
                    <p className="whitespace-pre-line text-[10px]">{viewingLetter.secondarySignerRole}</p>
                    <div className="h-12 my-1 flex items-center justify-center">
                      <img src={viewingLetter.secondarySignatureImageUrl || viewingLetter.signatureImageUrl} alt="TTE" className="max-h-full object-contain" />
                    </div>
                    <p className="font-bold underline text-[10px]">{viewingLetter.secondarySignerName}</p>
                    <p className="text-[9px] text-gray-600 font-mono">NIM. {viewingLetter.secondarySignerNim}</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Surat */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetLetter}
        title="Hapus Arsip Surat Resmi"
        itemName={deleteTargetLetter?.letterNumber}
        message={
          deleteTargetLetter
            ? `Apakah Anda yakin ingin menghapus surat nomor ${deleteTargetLetter.letterNumber} dengan perihal "${deleteTargetLetter.subject}"? Berkas surat akan dihapus permanen dari buku register arsip.`
            : undefined
        }
        onConfirm={() => {
          if (deleteTargetLetter) {
            onDeleteLetter(deleteTargetLetter.id);
            setFeedbackMsg(`Arsip surat ${deleteTargetLetter.letterNumber} berhasil dihapus dari sistem!`);
            setTimeout(() => setFeedbackMsg(null), 4000);
            setDeleteTargetLetter(null);
          }
        }}
        onClose={() => setDeleteTargetLetter(null)}
      />

    </div>
  );
};
