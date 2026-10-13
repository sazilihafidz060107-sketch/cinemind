import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Beralih ke mode ${isDark ? 'terang' : 'gelap'}`}
      title={`Mode saat ini: ${isDark ? 'Gelap (Dark)' : 'Terang (Light)'}. Klik untuk beralih.`}
      className={`relative inline-flex items-center gap-2 p-1.5 rounded-[2px] transition-all duration-300 cursor-pointer border ${
        isDark
          ? 'bg-[#181818] border-[#333333] text-amber-400 hover:text-amber-300 hover:border-amber-500/40'
          : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 shadow-xs'
      } ${className}`}
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100 text-indigo-600" />
        )}
      </div>

      {showLabel && (
        <span className="text-xs font-mono font-semibold uppercase tracking-wider pr-1">
          {isDark ? 'Gelap' : 'Terang'}
        </span>
      )}

      {/* Mode visual pill indicator */}
      <span
        className={`hidden sm:inline-block text-[9px] font-mono px-1.5 py-0.2 rounded-[2px] uppercase ${
          isDark
            ? 'bg-black/60 text-gray-300 border border-white/10'
            : 'bg-slate-100 text-slate-800 border border-slate-200'
        }`}
      >
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
};
