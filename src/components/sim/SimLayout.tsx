import React, { useState } from 'react';
import { 
  Film, 
  FileText, 
  DollarSign, 
  Users, 
  LayoutDashboard, 
  Globe, 
  LogOut, 
  PlusCircle, 
  Archive, 
  Layers, 
  ChevronRight, 
  UserCheck, 
  Menu, 
  X,
  Clapperboard,
  Shield,
  Lock,
  GitFork
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { ThemeToggle } from '../common/ThemeToggle';

interface SimLayoutProps {
  currentUser: User;
  availableUsers: User[];
  currentView: string;
  onNavigate: (view: string) => void;
  onSwitchUser: (user: User) => void;
  onReturnToPublic: () => void;
  children: React.ReactNode;
}

export const SimLayout: React.FC<SimLayoutProps> = ({
  currentUser,
  availableUsers,
  currentView,
  onNavigate,
  onSwitchUser,
  onReturnToPublic,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // RBAC Permission checks per PRD
  // bph_inti: Full Access
  // bph_sekretaris: Surat, Anggota, Struktur, Dashboard. NO Keuangan, NO CMS.
  // bph_bendahara: Keuangan, Anggota, Struktur, Dashboard. NO Surat, NO CMS.
  // admin_medinfo: CMS, Struktur, Dashboard. NO Surat, NO Keuangan.
  const canAccessSurat = currentUser.role === 'bph_inti' || currentUser.role === 'bph_sekretaris';
  const canAccessKeuangan = currentUser.role === 'bph_inti' || currentUser.role === 'bph_bendahara';
  const canAccessCMS = currentUser.role === 'bph_inti' || currentUser.role === 'admin_medinfo';
  const canAccessAnggota = currentUser.role === 'bph_inti' || currentUser.role === 'bph_sekretaris' || currentUser.role === 'bph_bendahara';

  // Breadcrumbs text
  const getBreadcrumbs = () => {
    switch (currentView) {
      case 'dashboard':
        return 'Dashboard > Ringkasan Eksekutif';
      case 'surat-buat':
        return 'Persuratan > Generator Surat Baku';
      case 'surat-arsip':
        return 'Persuratan > Arsip Surat Keluar';
      case 'keuangan':
        return 'Keuangan > Buku Besar Kas Digital';
      case 'anggota':
        return 'Organisasi > Database Keanggotaan';
      case 'struktur':
        return 'Organisasi > Struktur Kepengurusan & Tupoksi';
      case 'cms':
        return 'Portal Publik > CMS Karya & Warta';
      default:
        return 'Sistem Informasi Manajemen';
    }
  };

  const navItemClass = (active: boolean) =>
    `flex items-center space-x-3 px-3 py-2.5 text-xs font-semibold rounded-[2px] transition-colors cursor-pointer uppercase tracking-wider ${
      active
        ? 'bg-[#E50914] text-white shadow-hard-red'
        : 'text-gray-300 hover:text-white hover:bg-[#1E293B]'
    }`;

  const navItemDisabledClass =
    'flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-[2px] text-gray-500 cursor-not-allowed opacity-60';

  return (
    <div className="min-h-screen transition-colors duration-300 bg-[#F9FAFB] dark:bg-[#0A0A0A] text-[#111827] dark:text-[#F3F4F6] flex flex-col md:flex-row font-body">
      
      {/* SIDEBAR KIRI: Sticky & Gelap Pekat (#111827) per PRD */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#111827] text-white flex flex-col justify-between border-r border-gray-800 transition-transform duration-200 shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          
          {/* Logo & Brand Header */}
          <div className="p-5 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => onNavigate('dashboard')}>
              <div className="w-9 h-9 rounded-[2px] flex items-center justify-center shrink-0 overflow-hidden bg-white/10 p-0.5">
                <img
                  src="https://culturz.my.id/cinemind-removebg-preview.png"
                  alt="Cinemind Logo"
                  className="w-full h-full object-contain filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="font-display text-xl font-bold tracking-wider text-white group-hover:text-[#E50914] transition-colors">
                  CINEMIND SIM
                </span>
                <p className="text-[10px] text-gray-400 font-mono -mt-1">
                  MANAGEMENT SYSTEM
                </p>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile & Role Switcher */}
          <div className="p-4 bg-[#0F172A] border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase text-gray-400">Pengguna Aktif:</span>
              <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-[2px] uppercase ${
                currentUser.role === 'bph_inti'
                  ? 'bg-purple-900 text-purple-200 border border-purple-700'
                  : currentUser.role === 'bph_sekretaris'
                  ? 'bg-blue-900 text-blue-200 border border-blue-700'
                  : currentUser.role === 'bph_bendahara'
                  ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                  : 'bg-amber-900 text-amber-200 border border-amber-700'
              }`}>
                ROLE: {currentUser.role}
              </span>
            </div>

            <div className="flex items-center space-x-2.5">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={currentUser.name}
                className="w-9 h-9 rounded-[2px] object-cover border border-gray-700"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[10px] text-gray-400 truncate">{currentUser.title}</p>
              </div>
            </div>

            {/* Quick Persona Switcher for testing all roles */}
            <div className="mt-3 pt-2 border-t border-gray-800/80">
              <label className="text-[10px] font-mono text-gray-400 block mb-1">
                Simulasi Persona / Role (RBAC):
              </label>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = availableUsers.find((u) => u.id === e.target.value);
                  if (target) onSwitchUser(target);
                }}
                className="w-full bg-[#1E293B] border border-gray-700 text-gray-200 text-[11px] p-1.5 rounded-[2px] focus:outline-none"
              >
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.role} ({u.title})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigasi Utama */}
          <nav className="p-3 space-y-1.5 flex-1 text-xs">
            
            {/* Dashboard */}
            <button
              onClick={() => {
                onNavigate('dashboard');
                setMobileSidebarOpen(false);
              }}
              className={`w-full ${navItemClass(currentView === 'dashboard')}`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* SECTION: PERSURATAN */}
            <div className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Modul Persuratan
              </span>
            </div>

            {canAccessSurat ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('surat-buat');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full ${navItemClass(currentView === 'surat-buat')}`}
                >
                  <PlusCircle className="w-4 h-4 shrink-0" />
                  <span>Generator Surat (TTE)</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('surat-arsip');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full ${navItemClass(currentView === 'surat-arsip')}`}
                >
                  <Archive className="w-4 h-4 shrink-0" />
                  <span>Arsip Surat Keluar</span>
                </button>
              </>
            ) : (
              <div className={navItemDisabledClass} title="Menu diblokir untuk role selain Sekretaris/BPH">
                <span className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Surat (Terkunci)</span>
                </span>
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

            {/* SECTION: KEUANGAN */}
            <div className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Modul Keuangan
              </span>
            </div>

            {canAccessKeuangan ? (
              <button
                onClick={() => {
                  onNavigate('keuangan');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full ${navItemClass(currentView === 'keuangan')}`}
              >
                <DollarSign className="w-4 h-4 shrink-0" />
                <span>Buku Kas Digital</span>
              </button>
            ) : (
              <div className={navItemDisabledClass} title="Menu diblokir untuk role selain Bendahara/BPH">
                <span className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Keuangan (Terkunci)</span>
                </span>
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

            {/* SECTION: KEANGGOTAAN */}
            <div className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Organisasi & SDM
              </span>
            </div>

            {canAccessAnggota ? (
              <>
                <button
                  onClick={() => {
                    onNavigate('anggota');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full ${navItemClass(currentView === 'anggota')}`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Data Keanggotaan</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('struktur');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full ${navItemClass(currentView === 'struktur')}`}
                >
                  <GitFork className="w-4 h-4 shrink-0" />
                  <span>Struktur & Tupoksi</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onNavigate('struktur');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full ${navItemClass(currentView === 'struktur')}`}
              >
                <GitFork className="w-4 h-4 shrink-0" />
                <span>Struktur & Tupoksi</span>
              </button>
            )}

            {/* SECTION: CMS WEBSITE */}
            <div className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Media & Informasi
              </span>
            </div>

            {canAccessCMS ? (
              <button
                onClick={() => {
                  onNavigate('cms');
                  setMobileSidebarOpen(false);
                }}
                className={`w-full ${navItemClass(currentView === 'cms')}`}
              >
                <Layers className="w-4 h-4 shrink-0" />
                <span>CMS Karya & Berita</span>
              </button>
            ) : (
              <div className={navItemDisabledClass} title="Menu diblokir untuk role selain Medinfo/BPH">
                <span className="flex items-center space-x-2">
                  <Layers className="w-4 h-4" />
                  <span>CMS (Terkunci)</span>
                </span>
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

          </nav>

          {/* Bottom Switch to Website Publik */}
          <div className="p-3 border-t border-gray-800 space-y-2">
            <button
              onClick={onReturnToPublic}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-[#1E293B] hover:bg-[#2A374D] text-gray-200 hover:text-white text-xs font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              <div className="flex items-center space-x-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>Lihat Website Publik</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR: Clean Breadcrumbs & Logout per PRD */}
        <header className="sticky top-0 z-30 transition-colors duration-300 bg-white dark:bg-[#141414] border-b border-gray-200 dark:border-[#262626] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
          
          <div className="flex items-center space-x-3">
            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white focus:outline-none"
              aria-label="Buka navigasi sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Display */}
            <div className="flex items-center space-x-2 text-xs font-mono text-gray-500">
              <span className="text-gray-900 dark:text-white font-bold">{getBreadcrumbs()}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* RBAC Role Indicator Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-gray-100 dark:bg-[#1C1C1C] border border-gray-200 dark:border-[#333] rounded-[2px] text-[10px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gray-500 dark:text-gray-400">PERAN:</span>
              <span className="font-bold text-[#E50914] uppercase">{currentUser.title}</span>
            </div>

            {/* Dual Theme Switcher */}
            <ThemeToggle />

            {/* Quick Switch Button to Website Publik */}
            <button
              onClick={onReturnToPublic}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 dark:bg-[#1C1C1C] hover:bg-gray-200 dark:hover:bg-[#252525] text-gray-800 dark:text-gray-200 text-xs font-semibold rounded-[2px] border border-gray-300 dark:border-[#333] cursor-pointer transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
              <span>Etalase Publik</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={onReturnToPublic}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#111827] hover:bg-black text-white text-xs font-semibold rounded-[2px] cursor-pointer shadow-xs transition-colors"
              title="Keluar dari sesi manajemen SIM"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </header>

        {/* Dynamic Content Container (max-w-6xl terpusat per PRD) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

      </div>

    </div>
  );
};
