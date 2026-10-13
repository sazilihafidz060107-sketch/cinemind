import React from 'react';
import { 
  X, 
  Award, 
  GraduationCap, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Briefcase, 
  FileText,
  Sparkles,
  Camera
} from 'lucide-react';
import { Officer } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface OfficerDetailModalProps {
  officer: Officer | null;
  onClose: () => void;
  onOpenPhotoModal?: (officer: Officer) => void;
}

export const OfficerDetailModal: React.FC<OfficerDetailModalProps> = ({
  officer,
  onClose,
  onOpenPhotoModal,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!officer) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`relative border rounded-[2px] max-w-2xl w-full my-auto overflow-hidden shadow-2xl transition-colors duration-300 ${
          isDark 
            ? 'bg-[#141414] border-[#2B2B2B] text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-[#E50914] text-white rounded-[2px] transition-colors cursor-pointer"
          aria-label="Tutup modal profil pengurus"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Banner */}
        <div className={`p-6 border-b flex flex-col sm:flex-row items-center sm:items-start gap-5 ${
          isDark 
            ? 'bg-gradient-to-r from-[#1C1C1C] to-[#121212] border-[#262626]' 
            : 'bg-gradient-to-r from-slate-100 to-slate-50 border-slate-200'
        }`}>
          <div className="relative group">
            <img
              src={officer.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
              alt={officer.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2px] object-cover border-2 border-[#E50914] shadow-hard-dark"
            />
            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={() => onOpenPhotoModal(officer)}
                className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-mono transition-opacity cursor-pointer rounded-[2px]"
                title="Unggah / Ganti Foto Pengurus"
              >
                <Camera className="w-5 h-5 mb-1 text-[#E50914]" />
                <span className="font-bold">GANTI FOTO</span>
              </button>
            )}
            <span className="absolute -bottom-2 -right-2 px-1.5 py-0.5 bg-[#E50914] text-white text-[9px] font-mono font-bold rounded-[2px] uppercase">
              {officer.level === 0 ? 'PEMBINA' : officer.level === 1 ? 'BPH INTI' : 'DIVISI'}
            </span>
          </div>

          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
              <span className={`px-2 py-0.5 font-mono text-[10px] rounded-[2px] border ${
                isDark 
                  ? 'bg-[#252525] border-[#3A3A3A] text-gray-300' 
                  : 'bg-white border-slate-300 text-slate-700 shadow-xs'
              }`}>
                {officer.division}
              </span>
              {officer.nim && (
                <span className={`font-mono text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  NIM: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{officer.nim}</strong>
                </span>
              )}
            </div>

            <h2 className={`font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {officer.name}
            </h2>

            <p className="text-sm font-semibold text-[#E50914] font-mono">
              {officer.roleTitle}
            </p>

            {/* Academic badge if available */}
            {officer.classCode && (
              <div className={`flex items-center justify-center sm:justify-start space-x-3 text-xs font-mono pt-1 ${
                isDark ? 'text-gray-400' : 'text-slate-500'
              }`}>
                <span>Peminatan: <strong className={isDark ? 'text-gray-200' : 'text-slate-700'}>{officer.classCode}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body: Tupoksi & Proker */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Tugas Pokok dan Fungsi (TUPOKSI) */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono uppercase text-[#E50914] font-bold">
              <Briefcase className="w-4 h-4" />
              <span>Tugas Pokok dan Fungsi (Tupoksi Resmi)</span>
            </div>
            <div className={`rounded-[2px] p-4 space-y-2.5 border ${
              isDark 
                ? 'bg-[#1A1A1A] border-[#2B2B2B]' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              {officer.tupoksi.map((point, idx) => (
                <div key={idx} className={`flex items-start space-x-2.5 text-xs leading-relaxed font-body ${
                  isDark ? 'text-gray-200' : 'text-slate-700'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Program Kerja (PROKER) */}
          {officer.proker && officer.proker.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-xs font-mono uppercase text-amber-500 font-bold">
                <FileText className="w-4 h-4" />
                <span>Program Kerja Terkait (Proker)</span>
              </div>
              <div className={`rounded-[2px] p-4 space-y-2 border ${
                isDark 
                  ? 'bg-[#1A1A1A] border-[#2B2B2B]' 
                  : 'bg-slate-50 border-slate-200'
              }`}>
                {officer.proker.map((item, idx) => (
                  <div key={idx} className={`flex items-start space-x-2 text-xs leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    <span className="text-[#E50914] font-bold mr-1">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email / Kontak */}
          {officer.email && (
            <div className={`pt-2 border-t flex items-center justify-between text-xs font-mono ${
              isDark ? 'border-[#222222] text-gray-400' : 'border-slate-200 text-slate-500'
            }`}>
              <span className="flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-500" />
                <span>Surel: {officer.email}</span>
              </span>
              <span className="text-emerald-500 text-[11px] flex items-center font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Terverifikasi Himpunan
              </span>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className={`p-4 border-t flex items-center justify-between text-xs font-mono ${
          isDark 
            ? 'bg-[#101010] border-[#222222] text-gray-500' 
            : 'bg-slate-100 border-slate-200 text-slate-600'
        }`}>
          <div className="flex items-center space-x-3">
            <span className="hidden sm:inline">KABINET MAHASISWA KFTM CINEMIND 2026/2027</span>
            {onOpenPhotoModal && (
              <button
                type="button"
                onClick={() => onOpenPhotoModal(officer)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Ubah Foto Profil</span>
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-1.5 rounded-[2px] cursor-pointer border ${
              isDark 
                ? 'bg-[#222222] hover:bg-[#333333] border-[#333] text-gray-200' 
                : 'bg-white hover:bg-slate-200 border-slate-300 text-slate-700 shadow-xs'
            }`}
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
