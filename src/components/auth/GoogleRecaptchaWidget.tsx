import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface GoogleRecaptchaWidgetProps {
  isVerified: boolean;
  onChange: (verified: boolean) => void;
  disabled?: boolean;
}

export const GoogleRecaptchaWidget: React.FC<GoogleRecaptchaWidgetProps> = ({
  isVerified,
  onChange,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleClick = () => {
    if (disabled || isVerified || isLoading) return;

    setIsLoading(true);

    // Realistic verification delay (600ms - 900ms) simulating challenge solving
    setTimeout(() => {
      setIsLoading(false);
      onChange(true);
    }, 750);
  };

  return (
    <div className={`w-full max-w-[304px] rounded-[3px] p-3 shadow-xs flex items-center justify-between select-none border ${
      isDark 
        ? 'bg-[#222222] border-[#383838]' 
        : 'bg-[#F9F9F9] border-[#D3D3D3]'
    }`}>
      
      {/* Checkbox Section */}
      <div 
        onClick={handleClick}
        className={`flex items-center space-x-3 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        role="checkbox"
        aria-checked={isVerified}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
      >
        <div className="relative w-7 h-7 rounded-[2px] bg-white border-2 border-[#c1c1c1] flex items-center justify-center shrink-0 transition-colors">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-[#1A73E8] border-t-transparent rounded-full animate-spin" />
          )}

          {isVerified && !isLoading && (
            <div className="w-full h-full bg-[#0F9D58] flex items-center justify-center animate-in zoom-in-75 duration-150">
              <Check className="w-5 h-5 text-white stroke-[3.5]" />
            </div>
          )}
        </div>

        <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          Saya bukan robot
        </span>
      </div>

      {/* Google reCAPTCHA Badge */}
      <div className={`flex flex-col items-center justify-center pl-3 border-l shrink-0 ${
        isDark ? 'border-[#333]' : 'border-[#e0e0e0]'
      }`}>
        {/* Google reCAPTCHA 3-arrow icon */}
        <div className="w-7 h-7 text-[#1A73E8] flex items-center justify-center">
          <svg viewBox="0 0 48 48" className="w-6 h-6 fill-current">
            <path d="M24 8V2l-7 7 7 7V10c7.73 0 14 6.27 14 14 0 2.47-.64 4.79-1.77 6.81l1.49 1.49C39.29 29.74 40 26.97 40 24c0-8.84-7.16-16-16-16zm-14 9.19l-1.49-1.49C6.71 18.26 6 21.03 6 24c0 8.84 7.16 16 16 16v6l7-7-7-7v6c-7.73 0-14-6.27-14-14 0-2.47.64-4.79 1.77-6.81z" />
          </svg>
        </div>
        <span className={`text-[9px] font-sans font-semibold tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          reCAPTCHA
        </span>
        <div className="flex items-center space-x-1 text-[8px] text-gray-500 font-sans">
          <span>Privasi</span>
          <span>•</span>
          <span>Syarat</span>
        </div>
      </div>

    </div>
  );
};
