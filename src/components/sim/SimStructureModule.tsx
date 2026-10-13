import React, { useState } from 'react';
import { 
  Users, 
  Briefcase, 
  GraduationCap, 
  Search, 
  Download, 
  Printer, 
  FileCheck, 
  CheckCircle, 
  ChevronRight, 
  Eye, 
  Sparkles,
  BookOpen,
  Award,
  Camera,
  Upload,
  X
} from 'lucide-react';
import { Officer } from '../../types';
import { CINEMIND_OFFICERS } from '../../data/structureData';
import { StorageService } from '../../services/storage';
import { OfficerDetailModal } from '../public/OfficerDetailModal';
import { OfficerPhotoUploadModal } from '../common/OfficerPhotoUploadModal';

interface SimStructureModuleProps {
  officers?: Officer[];
  onUpdateOfficerAvatar?: (officerId: string, newAvatarUrl: string) => void;
}

export const SimStructureModule: React.FC<SimStructureModuleProps> = ({
  officers = CINEMIND_OFFICERS,
  onUpdateOfficerAvatar,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDivision, setSelectedDivision] = useState<string>('Semua');
  const [activeOfficerModal, setActiveOfficerModal] = useState<Officer | null>(null);
  const [photoModalOfficer, setPhotoModalOfficer] = useState<Officer | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const activeOfficers = officers && officers.length > 0 ? officers : CINEMIND_OFFICERS;

  const filteredOfficers = activeOfficers.filter((officer) => {
    const matchDiv =
      selectedDivision === 'Semua' || officer.division.toLowerCase().includes(selectedDivision.toLowerCase());
    const matchSearch =
      officer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      officer.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (officer.nim && officer.nim.includes(searchQuery));
    return matchDiv && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Jabatan', 'Nama Pengurus', 'NIM', 'Divisi', 'Peminatan', 'Jumlah Tupoksi'];
    const rows = filteredOfficers.map((o) => [
      `"${o.roleTitle}"`,
      `"${o.name}"`,
      o.nim || '-',
      `"${o.division}"`,
      o.classCode || '-',
      o.tupoksi.length,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `STRUKTUR_PENGURUS_CINEMIND_2026_2027.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>TATA KELOLA KEPENGURUSAN</span>
            <span>•</span>
            <span className="text-[#E50914] font-bold">KABINET 2026/2027</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Struktur Organisasi & Tupoksi Resmi
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Daftar resmi 17 pengurus kabinet beserta rincian Tugas Pokok dan Fungsi (Tupoksi) serta Program Kerja (Proker).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold uppercase tracking-wider rounded-[2px] border border-gray-300 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak SK / Struktur</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Success feedback alert */}
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

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Total Pengurus</span>
          <span className="font-display text-2xl font-bold text-gray-900">17 Orang</span>
          <p className="text-[11px] text-gray-500 font-mono mt-1">1 Pembina + 16 Mahasiswa KFTM</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Divisi Kerja</span>
          <span className="font-display text-2xl font-bold text-emerald-700">4 Divisi</span>
          <p className="text-[11px] text-gray-500 font-mono mt-1">Kajian, Produksi, Kemitraan, Medinfo</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Jumlah Divisi</span>
          <span className="font-display text-2xl font-bold text-blue-700">4 Divisi</span>
          <p className="text-[11px] text-gray-500 font-mono mt-1">+ BPH Inti & Pembina</p>
        </div>

        <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard">
          <span className="text-[10px] font-mono text-gray-500 uppercase block">Legalitas SK</span>
          <span className="font-display text-xl font-bold text-purple-700">TERVALIDASI</span>
          <p className="text-[11px] text-gray-500 font-mono mt-1">SK/BPH-CINEMIND/X/2026</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama, NIM, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-[#E50914] text-gray-900 text-xs pl-9 pr-3 py-2 rounded-[2px] focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto text-xs">
          <span className="text-gray-500 font-mono uppercase text-[11px] shrink-0">Filter Divisi:</span>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none"
          >
            <option value="Semua">Semua Divisi & BPH</option>
            <option value="Pembina">Dewan Pembina</option>
            <option value="Badan Pengurus Harian">Badan Pengurus Harian (BPH)</option>
            <option value="Kajian">Divisi Kajian dan Akademik</option>
            <option value="Produksi">Divisi Karya dan Produksi</option>
            <option value="Kemitraan">Divisi Jaringan dan Kemitraan</option>
            <option value="Media">Divisi Media dan Informasi</option>
          </select>
        </div>
      </div>

      {/* Officer Table with Tupoksi View */}
      <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Pengurus</th>
                <th className="py-3 px-4">Jabatan</th>
                <th className="py-3 px-4">NIM</th>
                <th className="py-3 px-3">Divisi</th>
                <th className="py-3 px-3">Peminatan</th>
                <th className="py-3 px-4">Ringkasan Tupoksi Utama</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-body">
              {filteredOfficers.map((officer) => (
                <tr key={officer.id} className="hover:bg-gray-50 transition-colors">
                  
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="relative group w-10 h-10 rounded-[2px] overflow-hidden border border-gray-200 shrink-0 shadow-xs">
                        <img
                          src={officer.avatar}
                          alt={officer.name}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPhotoModalOfficer(officer)}
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-mono transition-opacity cursor-pointer"
                          title="Unggah / Ganti Foto Pengurus"
                        >
                          <Camera className="w-3.5 h-3.5 text-white mb-0.5" />
                          <span className="font-bold">UBAH</span>
                        </button>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">{officer.name}</span>
                        {officer.email && (
                          <span className="text-[10px] text-gray-500 font-mono">{officer.email}</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4 font-mono font-bold text-gray-900">
                    <span className="text-[#E50914]">{officer.roleTitle}</span>
                  </td>

                  <td className="py-3 px-4 font-mono text-gray-700 whitespace-nowrap">
                    {officer.nim || '-'}
                  </td>

                  <td className="py-3 px-3 text-gray-700 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-gray-100 border border-gray-200 text-gray-800 text-[10px] font-mono rounded-[2px]">
                      {officer.division.replace('Divisi ', '')}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono whitespace-nowrap">
                    <span className="text-gray-700">{officer.classCode || '-'}</span>
                  </td>

                  <td className="py-3 px-4 text-gray-600 max-w-xs truncate text-[11px]">
                    {officer.tupoksi[0]}
                  </td>

                  <td className="py-3 px-4 text-center whitespace-nowrap">
                    <div className="inline-flex items-center space-x-1.5">
                      <button
                        onClick={() => setPhotoModalOfficer(officer)}
                        className="px-2.5 py-1 bg-white hover:bg-red-50 text-gray-700 hover:text-[#E50914] border border-gray-300 hover:border-red-300 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer inline-flex items-center space-x-1"
                        title="Unggah / Ganti Foto Pengurus"
                      >
                        <Camera className="w-3.5 h-3.5 text-[#E50914]" />
                        <span>Ubah Foto</span>
                      </button>
                      <button
                        onClick={() => setActiveOfficerModal(officer)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-900 hover:text-white text-gray-700 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer inline-flex items-center space-x-1"
                        title="Lihat Rincian Tupoksi"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Rincian</span>
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Officer */}
      <OfficerDetailModal
        officer={activeOfficerModal}
        onClose={() => setActiveOfficerModal(null)}
        onOpenPhotoModal={(off) => {
          setActiveOfficerModal(null);
          setPhotoModalOfficer(off);
        }}
      />

      {/* Modal Unggah & Ubah Foto Pengurus */}
      <OfficerPhotoUploadModal
        officer={photoModalOfficer}
        isOpen={!!photoModalOfficer}
        onClose={() => setPhotoModalOfficer(null)}
        onSaveAvatar={(officerId, newAvatarUrl) => {
          if (onUpdateOfficerAvatar) {
            onUpdateOfficerAvatar(officerId, newAvatarUrl);
          } else {
            StorageService.updateOfficerAvatar(officerId, newAvatarUrl);
          }
          const offName = photoModalOfficer?.name || 'Pengurus';
          setFeedbackMsg(
            `Foto profil resmi untuk ${offName} berhasil diperbarui! Foto kini tampil di seluruh portal SIM dan Website Publik.`
          );
          setTimeout(() => setFeedbackMsg(null), 5000);
        }}
        defaultTemplateAvatar={
          CINEMIND_OFFICERS.find((o) => o.id === photoModalOfficer?.id)?.avatar
        }
      />

    </div>
  );
};
