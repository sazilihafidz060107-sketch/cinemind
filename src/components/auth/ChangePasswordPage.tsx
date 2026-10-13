import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldAlert, 
  CheckCircle2, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Clapperboard,
  ShieldCheck
} from 'lucide-react';
import { User } from '../../types';
import { AuthApi } from '../../services/authApi';

interface ChangePasswordPageProps {
  pendingUser: User;
  temporaryToken: string;
  onPasswordChangedSuccess: (user: User, token: string) => void;
  onCancelToLogin: () => void;
}

export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({
  pendingUser,
  temporaryToken,
  onPasswordChangedSuccess,
  onCancelToLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter demi perlindungan akun Anda.');
      return;
    }

    if (newPassword === pendingUser.role) {
      setErrorMessage(`Kata sandi baru tidak boleh sama dengan kata sandi awal bawaan sistem ("${pendingUser.role}").`);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok. Harap periksa kembali.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthApi.changePassword(newPassword, temporaryToken);

      if (result.error) {
        setErrorMessage(result.error);
        setIsLoading(false);
        return;
      }

      if (result.token && result.user) {
        onPasswordChangedSuccess(result.user, result.token);
      }
    } catch (err: any) {
      setErrorMessage('Terjadi kendala saat memperbarui kata sandi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-4 sm:p-6 text-white font-body selection:bg-[#E50914] selection:text-white">
      
      {/* Background Cinematic Glow */}
      <div className="absolute inset-0 bg-radial from-red-950/20 via-black to-black pointer-events-none" />

      <div className="relative max-w-lg w-full bg-[#141414] border border-[#262626] rounded-[2px] p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-[2px] flex items-center justify-center mx-auto shadow-hard-dark">
            <KeyRound className="w-7 h-7" />
          </div>

          <div className="inline-block px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-[2px] text-[10px] font-mono font-bold tracking-widest uppercase">
            HTTP 428 // PRECONDITION REQUIRED
          </div>

          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
            Wajib Ubah Kata Sandi Awal
          </h1>
          
          <p className="text-xs text-gray-400 font-body max-w-md mx-auto leading-relaxed">
            Terdeteksi login perdana untuk <strong className="text-white">{pendingUser.name}</strong> ({pendingUser.title}). Demi keamanan tata kelola himpunan, Anda wajib mengganti kata sandi bawaan seeder sebelum token dashboard diterbitkan.
          </p>
        </div>

        {/* Security Info Card */}
        <div className="p-3.5 bg-[#1B1B1B] border border-[#303030] rounded-[2px] text-xs font-mono space-y-1.5 text-gray-300">
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>NIM Pengurus:</span>
            <span className="text-white font-bold">{pendingUser.nim}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Hak Akses Role:</span>
            <span className="text-[#E50914] font-bold uppercase">{pendingUser.role}</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-gray-400">
            <span>Status Keamanan:</span>
            <span className="text-amber-400 font-semibold flex items-center">
              <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Wajib Ganti Password
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-200 text-xs rounded-[2px] flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Ubah Password */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-gray-300 font-mono mb-1.5">
              Kata Sandi Baru *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Minimal 6 karakter..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#1C1C1C] border border-[#333333] focus:border-[#E50914] text-white px-3 py-2.5 rounded-[2px] pr-10 focus:outline-none"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1">
              Tidak boleh sama dengan kata sandi bawaan seeder (&quot;{pendingUser.role}&quot;).
            </p>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-gray-300 font-mono mb-1.5">
              Konfirmasi Kata Sandi Baru *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Ulangi kata sandi baru..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-[#1C1C1C] border border-[#333333] focus:border-[#E50914] text-white px-3 py-2.5 rounded-[2px] focus:outline-none"
              required
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={onCancelToLogin}
              className="w-full sm:w-1/3 py-2.5 bg-[#202020] hover:bg-[#2A2A2A] text-gray-300 text-xs font-semibold uppercase tracking-wider rounded-[2px] border border-[#333] cursor-pointer"
            >
              Batal / Login Ulang
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-2/3 flex items-center justify-center space-x-2 py-2.5 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red cursor-pointer transition-colors disabled:opacity-60"
            >
              <span>{isLoading ? 'Menyimpan & Menghash bcrypt...' : 'Simpan Kata Sandi & Masuk SIM'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#222222] text-center text-[10px] font-mono text-gray-500">
          PROSES INI MENGGUNAKAN ENKRIPSI BCRYPT DENGAN STANDAR SALT 10 ROUNDS.
        </div>

      </div>

    </div>
  );
};
