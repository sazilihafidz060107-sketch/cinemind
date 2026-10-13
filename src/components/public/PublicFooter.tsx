import React from 'react';
import { Film, Mail, MapPin, Lock } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface PublicFooterProps {
  onSecretAdminTrigger?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ onSecretAdminTrigger }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <footer className={`transition-colors duration-300 border-t py-12 ${
      isDark 
        ? 'bg-[#070707] text-gray-400 border-[#1C1C1C]' 
        : 'bg-slate-100 text-slate-600 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          
          {/* Brand Col with Official Logo */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
                <img
                  src="https://culturz.my.id/cinemind-removebg-preview.png"
                  alt="Cinemind Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm"
                />
              </div>
              <span className={`font-display text-2xl font-bold tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                CINEMIND
              </span>
            </div>
            <p className={`text-xs max-w-md leading-relaxed font-body ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Himpunan Mahasiswa Kajian Film, Televisi, dan Media (KFTM) ITB Bina Sarana Global. Mengintegrasikan apresiasi estetika film independen, literasi visual sinematik, dan pengembangan potensi karya sineas muda.
            </p>
          </div>

          {/* Sekretariat & Kontak Resmi */}
          <div className="space-y-3">
            <h4 className={`text-xs font-bold uppercase tracking-widest font-mono ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Sekretariat & Kontak Resmi
            </h4>
            <div className={`space-y-2 text-xs ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span className="font-medium">Jalan Aria Santika 55 Margasari Banten</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-[#E50914] shrink-0" />
                <a 
                  href="mailto:cinemind.gi@gmail.com" 
                  className="hover:text-[#E50914] transition-colors font-mono"
                >
                  cinemind.gi@gmail.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar (Clean and purely public) */}
        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between text-xs gap-4 font-mono ${
          isDark 
            ? 'border-[#181818] text-gray-500' 
            : 'border-slate-200 text-slate-500'
        }`}>
          <div>
            © 2026 Himpunan Mahasiswa Film Cinemind (KFTM). Seluruh hak cipta dilindungi.
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span>Tangerang, Banten</span>
            {/* Discreet admin portal trigger for authorized staff */}
            {onSecretAdminTrigger && (
              <button
                type="button"
                onClick={onSecretAdminTrigger}
                className="opacity-20 hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#E50914] cursor-pointer"
                title="Staff Security Gateway"
                aria-label="Staff Security Gateway"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
