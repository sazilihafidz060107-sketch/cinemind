import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, Lock, ShieldAlert, Cpu } from 'lucide-react';

interface CloudflareSecurityCheckProps {
  onVerified: () => void;
  onCancel: () => void;
}

export const CloudflareSecurityCheck: React.FC<CloudflareSecurityCheckProps> = ({
  onVerified,
  onCancel,
}) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [progress, setProgress] = useState(15);
  const [rayId] = useState(() => Math.random().toString(16).substring(2, 14) + 'cf9');

  // Automatic verification sequence simulating Turnstile / Cloudflare browser challenge
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(60);
    }, 600);

    const timer2 = setTimeout(() => {
      setProgress(100);
      setIsVerifying(false);
      setIsChecked(true);
    }, 1500);

    const timer3 = setTimeout(() => {
      onVerified();
    }, 2200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onVerified]);

  const handleManualClick = () => {
    if (!isChecked && !isVerifying) {
      setIsVerifying(true);
      setTimeout(() => {
        setIsChecked(true);
        setIsVerifying(false);
        onVerified();
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#F38020] selection:text-white relative">
      
      {/* Top Bar with Cloudflare Brand Colors */}
      <header className="max-w-xl w-full mx-auto flex items-center justify-between py-4">
        <div className="flex items-center space-x-2.5">
          {/* Cloudflare Iconic Cloud Emblem */}
          <div className="w-8 h-8 rounded-full bg-[#F38020] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-gray-200">
            Cloudflare <span className="text-gray-500 font-normal">Turnstile™</span>
          </span>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-mono text-gray-400 hover:text-white px-2.5 py-1 rounded border border-[#2A2A2A] hover:border-gray-500 transition-colors"
        >
          Batalkan & Kembali
        </button>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-xl w-full mx-auto my-auto space-y-6">
        <div className="bg-[#151515] border border-[#2B2B2B] rounded-[4px] p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          
          {/* Accent top line in Cloudflare orange */}
          <div 
            className="absolute top-0 left-0 h-1 bg-gradient-to-r from-[#F38020] via-[#FAAD3F] to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />

          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#F38020] uppercase tracking-wider">
              <Lock className="w-3.5 h-3.5" />
              <span>Pemeriksaan Keamanan Gerbang Administrasi</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Memverifikasi Lingkungan Peramban
            </h1>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
              Memeriksa integritas koneksi Anda sebelum memberikan akses ke Sistem Informasi Manajemen (SIM) Internal Cinemind. Tindakan ini mencegah serangan brute-force dan otomatisasi bot berbahaya.
            </p>
          </div>

          {/* Interactive Turnstile Challenge Widget Box */}
          <div 
            onClick={handleManualClick}
            className="p-4 bg-[#1C1C1C] border border-[#333333] rounded-[4px] flex items-center justify-between hover:border-gray-500 transition-colors cursor-pointer select-none"
          >
            <div className="flex items-center space-x-3.5">
              {/* Checkbox / Spinner */}
              <div className="w-7 h-7 rounded-[3px] border border-gray-500 bg-[#242424] flex items-center justify-center shrink-0">
                {isChecked ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-in zoom-in-75 duration-200" />
                ) : isVerifying ? (
                  <div className="w-4 h-4 border-2 border-[#F38020] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-2.5 h-2.5 bg-gray-600 rounded-[1px]" />
                )}
              </div>

              <div>
                <span className="text-sm font-medium text-white block">
                  {isChecked
                    ? 'Verifikasi Berhasil'
                    : isVerifying
                    ? 'Memeriksa peramban Anda...'
                    : 'Verifikasi Anda adalah manusia'}
                </span>
                <span className="text-[11px] text-gray-400 block font-mono">
                  {isChecked ? 'Mengarahkan ke Portal SIM...' : 'Proses ini berjalan secara otomatis.'}
                </span>
              </div>
            </div>

            {/* Cloudflare mini badge */}
            <div className="text-right flex flex-col items-end shrink-0 pl-3 border-l border-[#2E2E2E]">
              <div className="flex items-center space-x-1 text-[#F38020]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[10px] font-bold tracking-wide">CLOUDFLARE</span>
              </div>
              <span className="text-[9px] text-gray-500 font-mono">Managed Challenge</span>
            </div>
          </div>

          {/* Security Diagnostics Metadata */}
          <div className="pt-4 border-t border-[#262626] grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px] font-mono text-gray-400">
            <div>
              <span className="text-gray-500 block text-[10px]">Ray ID:</span>
              <span className="text-gray-300 font-semibold">{rayId}</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Protokol:</span>
              <span className="text-emerald-400 font-semibold">TLS 1.3 / HTTP/3</span>
            </div>
            <div>
              <span className="text-gray-500 block text-[10px]">Proteksi:</span>
              <span className="text-gray-300 font-semibold">DDoS Strict</span>
            </div>
          </div>

        </div>

        {/* Informative Security Guarantee */}
        <div className="text-center text-xs text-gray-500 font-mono space-y-1">
          <p>Kinerja dan Keamanan Dikelola oleh Cloudflare • IP Akses Dicatat dalam Audit Log SIM</p>
          <p className="text-[10px] text-gray-600">Cinemind KFTM ITB Bina Sarana Global • Gerbang Terisolasi</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-xl w-full mx-auto text-center py-4 text-xs font-mono text-gray-600">
        © 2026 Cloudflare, Inc. • Privasi • Ketentuan Layanan
      </footer>

    </div>
  );
};
