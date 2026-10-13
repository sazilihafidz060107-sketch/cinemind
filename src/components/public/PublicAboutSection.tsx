import React from 'react';
import { Sparkles, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PublicAboutSection: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section 
      id="tentang" 
      className={`py-20 transition-colors duration-300 border-t ${
        isDark 
          ? 'bg-[#0A0A0A] text-white border-[#1C1C1C]' 
          : 'bg-[#F8F9FA] text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#E50914] mb-2 tracking-widest uppercase">
            <span className="w-2 h-2 bg-[#E50914]"></span>
            <span>PROFIL & VISI MISI RESMI</span>
          </div>
          <h2 className={`font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Tentang Himpunan Cinemind
          </h2>
          <p className={`text-sm sm:text-base mt-4 leading-relaxed font-body ${
            isDark ? 'text-gray-300' : 'text-slate-600'
          }`}>
            Himpunan Mahasiswa Kajian Film, Televisi, dan Media (KFTM) ITB Bina Sarana Global. Mengusung semangat <strong className={isDark ? 'text-white' : 'text-slate-900'}>&quot;Dari Ide, Menuju Karya, Untuk Industri Kreatif&quot;</strong>, menjadi ruang sinergi intelektualitas dan daya cipta audiovisual mahasiswa.
          </p>
        </div>

        {/* Visi & Misi Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className={`p-8 rounded-[2px] border ${
            isDark 
              ? 'bg-[#141414] border-[#262626] shadow-hard-dark' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="w-10 h-10 bg-[#E50914] rounded-[2px] flex items-center justify-center text-white mb-4 shadow-hard-red">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className={`font-display text-2xl font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Visi Himpunan
            </h3>
            <p className={`text-sm leading-relaxed font-body ${
              isDark ? 'text-gray-300' : 'text-slate-600'
            }`}>
              Menjadikan Cinemind sebagai wadah bagi mahasiswa Kajian Film, Televisi, dan Media yang aktif, kreatif, kritis, kolaboratif, serta mampu berkembang melalui karya dan kontribusi di lingkungan kampus maupun industri kreatif.
            </p>
          </div>

          <div className={`p-8 rounded-[2px] border ${
            isDark 
              ? 'bg-[#141414] border-[#262626] shadow-hard-dark' 
              : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className={`w-10 h-10 rounded-[2px] flex items-center justify-center mb-4 border ${
              isDark 
                ? 'bg-[#1F1F1F] border-[#333333] text-white' 
                : 'bg-slate-100 border-slate-300 text-slate-800'
            }`}>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className={`font-display text-2xl font-bold uppercase tracking-wider mb-3 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Misi Himpunan
            </h3>
            <ul className={`text-xs sm:text-sm space-y-2.5 leading-relaxed list-disc list-inside font-body ${
              isDark ? 'text-gray-300' : 'text-slate-600'
            }`}>
              <li>Membangun budaya kreatif dan intelektual melalui produksi karya, kajian, diskusi, literasi media, serta apresiasi terhadap film, televisi, dan media.</li>
              <li>Mendorong mahasiswa untuk aktif berkarya dan mengembangkan potensinya melalui ruang produksi, apresiasi, dan pengembangan karya.</li>
              <li>Membuka kesempatan bagi mahasiswa untuk memperkenalkan karya melalui kompetisi, festival, komunitas, dan jejaring alumni.</li>
              <li>Menciptakan lingkungan organisasi yang inklusif, kolaboratif, dan suportif dengan memperkuat solidaritas lintas angkatan.</li>
              <li>Membawa karya dan identitas KFTM keluar dari ruang kelas melalui publikasi dan kontribusi nyata bagi industri kreatif.</li>
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
};
