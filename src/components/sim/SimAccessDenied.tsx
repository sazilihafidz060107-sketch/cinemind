import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { UserRole } from '../../types';

interface SimAccessDeniedProps {
  currentRole: UserRole;
  requiredRoleDescription: string;
  onNavigateHome: () => void;
}

export const SimAccessDenied: React.FC<SimAccessDeniedProps> = ({
  currentRole,
  requiredRoleDescription,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-[500px] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-red-200 rounded-[2px] p-8 shadow-hard text-center">
        <div className="w-14 h-14 bg-red-100 text-[#E50914] rounded-[2px] flex items-center justify-center mx-auto mb-4 border border-red-200">
          <Lock className="w-7 h-7" />
        </div>

        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-[2px]">
          AKSES DIBATASI (RBAC)
        </span>

        <h3 className="font-display text-2xl font-bold uppercase text-gray-900 mt-3">
          Hak Akses Tidak Sesuai
        </h3>

        <p className="text-sm text-gray-600 mt-2 font-body leading-relaxed">
          Menu ini dilindungi dan hanya dapat diakses oleh <span className="font-semibold text-gray-900">{requiredRoleDescription}</span>.
        </p>

        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-[2px] text-xs text-gray-700 text-left font-mono">
          <p>• Role Anda saat ini: <strong className="text-gray-900">{currentRole}</strong></p>
          <p>• Status Kebijakan: Terisolasi sesuai Pedoman Administrasi Tata Kelola Cinemind</p>
        </div>

        <button
          onClick={onNavigateHome}
          className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard Utama</span>
        </button>
      </div>
    </div>
  );
};
