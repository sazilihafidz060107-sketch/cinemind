import React, { useState } from 'react';
import { 
  LogIn, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  Film, 
  ArrowLeft,
  Eye,
  EyeOff,
  UserCheck,
  CheckCircle2,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { User } from '../../types';
import { AuthApi, LoginResponse } from '../../services/authApi';
import { GoogleRecaptchaWidget } from './GoogleRecaptchaWidget';
import { ThemeToggle } from '../common/ThemeToggle';
import { useTheme } from '../../context/ThemeContext';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onRequirePasswordChange: (pendingUser: User, temporaryToken: string) => void;
  onReturnToPublic: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onRequirePasswordChange,
  onReturnToPublic,
}) => {
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRecaptchaVerified, setIsRecaptchaVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Demo accounts for rapid RBAC testing
  const demoAccounts = [
    {
      roleName: 'Ketua Umum (Super Admin)',
      roleCode: 'bph_inti',
      nim: '1525020028',
      name: 'Farhan Alfarizi',
      pass: 'cinemind2026',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      description: 'Akses penuh ke seluruh modul SIM (Dashboard, Surat, Kas, Anggota, Struktur, CMS).',
    },
    {
      roleName: 'Sekretaris (Admin Persuratan)',
      roleCode: 'bph_sekretaris',
      nim: '1525020031',
      name: 'Sarah Nabila',
      pass: 'cinemind2026',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      description: 'Akses generator nomor surat, arsip surat resmi, dan buku induk anggota.',
    },
    {
      roleName: 'Bendahara (Admin Keuangan)',
      roleCode: 'bph_bendahara',
      nim: '1525020035',
      name: 'Rian Pratama',
      pass: 'cinemind2026',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      description: 'Akses buku kas debit/kredit, pencatatan transaksi, dan rekapitulasi saldo himpunan.',
    },
    {
      roleName: 'Medinfo (Admin CMS & Publikasi)',
      roleCode: 'admin_medinfo',
      nim: '1525020042',
      name: 'Kevin Ardiansyah',
      pass: 'cinemind2026',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      description: 'Akses kurasi etalase karya film, warta pers, dan unggah gambar.',
    },
  ];

  const fillDemoAccount = (accountNim: string, accountPass: string) => {
    setNim(accountNim);
    setPassword(accountPass);
    setIsRecaptchaVerified(true);
    setErrorMessage(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Google reCAPTCHA Verification Gate
    if (!isRecaptchaVerified) {
      setErrorMessage('Harap selesaikan verifikasi Google reCAPTCHA ("Saya bukan robot") terlebih dahulu.');
      return;
    }

    setIsLoading(true);

    try {
      const res: LoginResponse = await AuthApi.login(nim, password);

      // 1. Force Change Password redirect flow (428 Precondition Required)
      if (res.require_password_change && res.temporary_token && res.user) {
        onRequirePasswordChange(res.user, res.temporary_token);
        return;
      }

      // 2. Normal successful login (200 OK)
      if (res.token && res.user) {
        onLoginSuccess(res.user, res.token);
        return;
      }

      // 3. Error state (401 Unauthorized or 403 Forbidden)
      if (res.error) {
        setErrorMessage(res.error);
        setIsRecaptchaVerified(false);
      }
    } catch {
      setErrorMessage('Terjadi kendala saat menghubungi server autentikasi.');
      setIsRecaptchaVerified(false);
    } finally {
      setIsLoading(false);
    }
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-300 flex flex-col justify-between p-4 sm:p-6 relative font-body selection:bg-[#E50914] selection:text-white ${
      isDark 
        ? 'bg-[#0A0A0A] text-white' 
        : 'bg-[#F4F5F7] text-slate-900'
    }`}>
      
      {/* Background vignette subtle overlay */}
      <div className={`absolute inset-0 bg-gradient-to-b from-[#141414] via-[#0A0A0A] to-[#050505] pointer-events-none transition-opacity duration-300 ${
        isDark ? 'opacity-100' : 'opacity-0'
      }`} />

      {/* Top Header */}
      <header className="relative z-10 max-w-5xl w-full mx-auto flex items-center justify-between py-2">
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={onReturnToPublic}
        >
          <div className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden bg-black/5 dark:bg-white/5 p-0.5">
            <img
              src="https://culturz.my.id/cinemind-removebg-preview.png"
              alt="Cinemind Logo"
              className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div>
            <span className="font-display text-xl font-bold tracking-wider group-hover:text-[#E50914] transition-colors">
              CINEMIND
            </span>
            <p className={`text-[10px] font-mono -mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              ADMINISTRATIVE SECURITY GATEWAY
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <ThemeToggle />
          <button
            onClick={onReturnToPublic}
            className={`flex items-center space-x-1.5 px-3 py-1.5 border text-xs font-semibold rounded-[2px] cursor-pointer transition-colors ${
              isDark 
                ? 'bg-[#1A1A1A] border-[#333] text-gray-300 hover:text-white' 
                : 'bg-white border-slate-300 text-slate-700 hover:text-[#E50914] shadow-xs'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kembali ke Website Publik</span>
            <span className="sm:hidden">Kembali</span>
          </button>
        </div>
      </header>

      {/* Main Login Form Container */}
      <main className="relative z-10 max-w-md w-full mx-auto my-auto py-6">
        
        {/* Form Card */}
        <div className={`w-full border rounded-[2px] p-6 sm:p-8 shadow-2xl space-y-6 ${
          isDark 
            ? 'bg-[#141414] border-[#262626]' 
            : 'bg-white border-slate-200'
        }`}>
          
          <div className="space-y-2">
            {/* Security Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-[#E50914]/10 border border-[#E50914]/30 text-[#E50914] rounded-[2px] text-[10px] font-mono uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>RBAC PROTECTED</span>
              </span>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-[2px] text-[10px] font-mono">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>Cloudflare Verified</span>
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight">
              Masuk SIM Pengurus
            </h1>
            
            <p className={`text-xs font-body leading-relaxed ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Portal internal terisolasi. Akses diberikan terbatas kepada pejabat berwenang dengan validasi peran (RBAC) dan enkripsi kata sandi.
            </p>
          </div>

          {/* Alert Messages */}
          {errorMessage && (
            <div className={`p-3 border text-xs rounded-[2px] flex items-start space-x-2 animate-in fade-in ${
              isDark 
                ? 'bg-red-950/40 border-red-500/50 text-red-200' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className={`block font-semibold uppercase tracking-wider font-mono mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                NIM Pengurus *
              </label>
              <input
                type="text"
                placeholder="Contoh: 1525020028"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-[2px] font-mono text-sm focus:outline-none transition-colors border ${
                  isDark 
                    ? 'bg-[#1C1C1C] border-[#333333] focus:border-[#E50914] text-white' 
                    : 'bg-slate-50 border-slate-300 focus:border-[#E50914] text-slate-900 shadow-xs'
                }`}
                required
              />
            </div>

            <div>
              <label className={`block font-semibold uppercase tracking-wider font-mono mb-1.5 ${
                isDark ? 'text-gray-300' : 'text-slate-700'
              }`}>
                Kata Sandi *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full px-3 py-2.5 pr-10 rounded-[2px] text-sm focus:outline-none transition-colors border ${
                    isDark 
                      ? 'bg-[#1C1C1C] border-[#333333] focus:border-[#E50914] text-white' 
                      : 'bg-slate-50 border-slate-300 focus:border-[#E50914] text-slate-900 shadow-xs'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${
                    isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                  }`}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Google reCAPTCHA Verification Box */}
            <div className="pt-1">
              <label className={`block font-semibold uppercase tracking-wider font-mono text-[10px] mb-1.5 ${
                isDark ? 'text-gray-400' : 'text-slate-600'
              }`}>
                Verifikasi Keamanan Manusia (reCAPTCHA v2) *
              </label>
              <GoogleRecaptchaWidget
                isVerified={isRecaptchaVerified}
                onChange={setIsRecaptchaVerified}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !isRecaptchaVerified}
              className={`w-full flex items-center justify-center space-x-2 py-3 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                isRecaptchaVerified
                  ? 'bg-[#E50914] hover:bg-[#b91c1c] text-white shadow-hard-red'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Memverifikasi Hash & Peran RBAC...' : 'Masuk ke Dashboard SIM'}</span>
            </button>
          </form>

          {/* Quick Demo Helper (RBAC Selector) */}
          <div className={`pt-2 border-t ${isDark ? 'border-[#262626]' : 'border-slate-200'}`}>
            <button
              type="button"
              onClick={() => setShowDemoCredentials(!showDemoCredentials)}
              className={`w-full text-center text-xs font-mono flex items-center justify-center space-x-1 cursor-pointer py-1 ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-[#E50914]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#E50914]" />
              <span>{showDemoCredentials ? 'Sembunyikan Akun Demo RBAC' : 'Gunakan Akun Demo Pengurus (Uji Coba RBAC)'}</span>
            </button>

            {showDemoCredentials && (
              <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                <p className="text-[10px] font-mono text-gray-500">
                  Klik salah satu peran di bawah untuk mengisi form login secara instan:
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {demoAccounts.map((acc) => (
                    <div
                      key={acc.roleCode}
                      onClick={() => fillDemoAccount(acc.nim, acc.pass)}
                      className={`p-2.5 rounded-[2px] transition-colors cursor-pointer text-left group border ${
                        isDark 
                          ? 'bg-[#1C1C1C] border-[#333] hover:border-[#E50914]' 
                          : 'bg-slate-50 border-slate-200 hover:border-[#E50914] shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`font-semibold text-xs group-hover:text-[#E50914] ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {acc.name}
                        </span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${acc.badgeColor}`}>
                          {acc.roleName.split(' ')[0]}
                        </span>
                      </div>
                      <p className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        NIM: {acc.nim} • Peran: {acc.roleName}
                      </p>
                      <p className={`text-[10px] line-clamp-1 mt-1 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>
                        {acc.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center text-xs font-mono text-gray-500 py-3">
        © 2026 SISTEM INFORMASI MANAJEMEN HIMPUNAN CINEMIND • STRICT ROLE-BASED ACCESS
      </footer>

    </div>
  );
};
