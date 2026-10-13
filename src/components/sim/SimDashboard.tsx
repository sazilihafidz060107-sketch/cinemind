import React from 'react';
import { 
  Users, 
  FileText, 
  DollarSign, 
  Film, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Calendar, 
  Clock, 
  ChevronRight, 
  CheckCircle,
  AlertCircle,
  FileCheck,
  TrendingUp,
  Clapperboard
} from 'lucide-react';
import { User, Member, Letter, FinanceTransaction, FilmWork } from '../../types';
import { formatDateIndonesian } from '../../utils/pdfGenerator';

interface SimDashboardProps {
  currentUser: User;
  members: Member[];
  letters: Letter[];
  finances: FinanceTransaction[];
  works: FilmWork[];
  balanceData: { totalIn: number; totalOut: number; currentBalance: number };
  onNavigate: (view: string) => void;
  onOpenLetter: (letter: Letter) => void;
}

export const SimDashboard: React.FC<SimDashboardProps> = ({
  currentUser,
  members,
  letters,
  finances,
  works,
  balanceData,
  onNavigate,
  onOpenLetter,
}) => {
  const activeMembersCount = members.filter(m => m.status === 'Aktif').length;
  const recentLetters = letters.slice(0, 4);
  const recentFinances = finances.slice(0, 4);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome & Role Summary Banner */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>SISTEM INFORMASI MANAJEMEN</span>
            <span>•</span>
            <span className="text-[#E50914] font-bold">KABINET CINEMIND 2026</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Selamat Datang, {currentUser.name}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Masuk sebagai <strong className="text-gray-900 font-semibold">{currentUser.title} ({currentUser.role})</strong>. Pantau metrik operasional organisasi secara real-time.
          </p>
        </div>

        {/* Quick Actions depending on role */}
        <div className="flex flex-wrap items-center gap-2">
          {(currentUser.role === 'bph_inti' || currentUser.role === 'bph_sekretaris') && (
            <button
              onClick={() => onNavigate('surat-buat')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Surat Baru</span>
            </button>
          )}

          {(currentUser.role === 'bph_inti' || currentUser.role === 'bph_bendahara') && (
            <button
              onClick={() => onNavigate('keuangan')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
            >
              <DollarSign className="w-4 h-4" />
              <span>Input Buku Kas</span>
            </button>
          )}

          {(currentUser.role === 'bph_inti' || currentUser.role === 'admin_medinfo') && (
            <button
              onClick={() => onNavigate('cms')}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
            >
              <Film className="w-4 h-4" />
              <span>Kelola CMS Website</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('struktur')}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>Struktur & Tupoksi</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (Data Density per PRD) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Saldo Kas */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-2">
            <span className="uppercase">TOTAL SALDO KAS</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight" aria-live="polite">
            {formatCurrency(balanceData.currentBalance)}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600">
            <span className="text-emerald-700 font-medium flex items-center">
              <ArrowDownLeft className="w-3 h-3 mr-0.5" /> In: {formatCurrency(balanceData.totalIn)}
            </span>
            <span className="text-rose-700 font-medium flex items-center">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> Out: {formatCurrency(balanceData.totalOut)}
            </span>
          </div>
        </div>

        {/* Card 2: Anggota Aktif */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard">
          <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-2">
            <span className="uppercase">ANGGOTA TERDAFTAR</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {activeMembersCount} <span className="text-base font-normal text-gray-500">Anggota</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-mono">
            <span>Total: {members.length} Jiwa</span>
            <button 
              onClick={() => onNavigate('anggota')}
              className="text-blue-600 hover:underline font-semibold cursor-pointer"
            >
              Lihat Database →
            </button>
          </div>
        </div>

        {/* Card 3: Arsip Surat Resmi */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard">
          <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-2">
            <span className="uppercase">SURAT DITERBITKAN</span>
            <FileText className="w-4 h-4 text-purple-600" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {letters.length} <span className="text-base font-normal text-gray-500">Dokumen</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-mono">
            <span>Nomor Terakhir: #{String(letters.length).padStart(3, '0')}</span>
            <button 
              onClick={() => onNavigate('surat-arsip')}
              className="text-purple-700 hover:underline font-semibold cursor-pointer"
            >
              Buka Arsip →
            </button>
          </div>
        </div>

        {/* Card 4: Karya Publik */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard">
          <div className="flex items-center justify-between text-xs text-gray-500 font-mono mb-2">
            <span className="uppercase">KATALOG KARYA FILM</span>
            <Film className="w-4 h-4 text-[#E50914]" />
          </div>
          <div className="font-display text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {works.length} <span className="text-base font-normal text-gray-500">Film</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-600 font-mono">
            <span>Di Website Publik</span>
            <button 
              onClick={() => onNavigate('cms')}
              className="text-[#E50914] hover:underline font-semibold cursor-pointer"
            >
              Kelola CMS →
            </button>
          </div>
        </div>

      </div>

      {/* Two Column Density Section: Persuratan Terkini & Transaksi Terkini */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Letters Panel */}
        <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-gray-700" />
              <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight">
                Arsip Surat Keluar Terakhir
              </h2>
            </div>
            <button
              onClick={() => onNavigate('surat-arsip')}
              className="text-xs text-[#E50914] hover:underline font-semibold font-mono uppercase cursor-pointer"
            >
              Lihat Semua ({letters.length}) →
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentLetters.map((l) => (
              <div 
                key={l.id} 
                onClick={() => onOpenLetter(l)}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-800 text-[10px] font-mono font-bold rounded-[2px]">
                      {l.classificationCode}
                    </span>
                    <span className="text-xs font-mono font-semibold text-gray-900">
                      {l.letterNumber}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1 font-body">
                    {l.subject}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Tujuan: {l.recipient} • {formatDateIndonesian(l.letterDate)}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => onNavigate('surat-buat')}
              className="text-xs text-gray-700 hover:text-black font-semibold font-mono uppercase inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Buat Surat Berformat Baku Baru</span>
            </button>
          </div>
        </div>

        {/* Recent Finance Transactions Panel */}
        <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-700" />
              <h2 className="font-display text-lg font-bold uppercase text-gray-900 tracking-tight">
                Aktivitas Buku Kas Terbaru
              </h2>
            </div>
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-xs text-emerald-700 hover:underline font-semibold font-mono uppercase cursor-pointer"
            >
              Buku Besar ({finances.length}) →
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentFinances.map((tx) => (
              <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                <div className="space-y-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded-[2px] uppercase ${
                      tx.type === 'in' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      {tx.type === 'in' ? 'Debit (Masuk)' : 'Kredit (Keluar)'}
                    </span>
                    <span className="text-[11px] text-gray-500 font-mono">
                      {formatDateIndonesian(tx.transactionDate)}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-gray-900 line-clamp-1 font-body">
                    {tx.description}
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono">
                    Kategori: {tx.category}
                  </p>
                </div>
                <div className={`font-mono text-xs sm:text-sm font-bold whitespace-nowrap ${
                  tx.type === 'in' ? 'text-emerald-700' : 'text-rose-700'
                }`}>
                  {tx.type === 'in' ? '+' : '-'}{formatCurrency(tx.amount)}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
            <button
              onClick={() => onNavigate('keuangan')}
              className="text-xs text-gray-700 hover:text-black font-semibold font-mono uppercase inline-flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>Catat Kas Masuk / Keluar Baru</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
