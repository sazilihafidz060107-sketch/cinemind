import React, { useState } from 'react';
import { 
  Users, 
  ChevronDown, 
  Search, 
  Briefcase, 
  CheckCircle2,
  GraduationCap,
  Shield,
  Layers,
  ArrowRight,
  Film,
  Camera,
  Share2,
  Monitor,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { Officer } from '../../types';
import { CINEMIND_OFFICERS } from '../../data/structureData';
import { OfficerDetailModal } from './OfficerDetailModal';
import { useTheme } from '../../context/ThemeContext';

interface PublicStructureSectionProps {
  officers?: Officer[];
}

interface OperationalDivision {
  id: string;
  name: string;
  shortCode: string;
  badge: string;
  tagline: string;
  description: string;
  coverImage: string;
  icon: React.ReactNode;
  tupoksiList: string[];
}

export const PublicStructureSection: React.FC<PublicStructureSectionProps> = ({
  officers,
}) => {
  const activeOfficers = officers && officers.length > 0 ? officers : CINEMIND_OFFICERS;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Search Query state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOfficer, setSelectedOfficer] = useState<Officer | null>(null);

  // Exclusive Accordion state: ONLY ONE division can be open at a time.
  // When another division is clicked/opened, the previously opened division automatically closes.
  const [activeDivisionId, setActiveDivisionId] = useState<string | null>(null);

  const toggleDivision = (divisionId: string) => {
    setActiveDivisionId((prev) => (prev === divisionId ? null : divisionId));
  };

  // Helper to order BPH strictly:
  // 1. Ketua
  // 2. Wakil Ketua
  // 3. Sekretaris
  // 4. Bendahara (Bendahara I, Bendahara II)
  const getBphOrderWeight = (role: string): number => {
    const r = role.toLowerCase();
    if (r.includes('ketua') && !r.includes('wakil')) return 1;
    if (r.includes('wakil')) return 2;
    if (r.includes('sekretaris')) return 3;
    if (r.includes('bendahara 1') || r.includes('bendahara i') || r.includes('bendahara pertama')) return 4;
    if (r.includes('bendahara 2') || r.includes('bendahara ii') || r.includes('bendahara kedua')) return 5;
    if (r.includes('bendahara')) return 4.5;
    return 6;
  };

  // Static Groups: Pembina and BPH
  const pembinaOfficers = activeOfficers.filter(
    (o) => o.level === 0 || o.division.toLowerCase().includes('pembina')
  );

  const bphOfficers = activeOfficers
    .filter((o) => o.level === 1 || o.division.toLowerCase().includes('badan pengurus harian'))
    .sort((a, b) => getBphOrderWeight(a.roleTitle) - getBphOrderWeight(b.roleTitle));

  // The 4 Operational Divisions with Custom Section Cover Banners & Themed Identities
  const operationalDivisions: OperationalDivision[] = [
    {
      id: 'KAJIAN',
      name: 'Divisi Kajian dan Akademik',
      shortCode: 'KAJIAN',
      badge: 'RISET, KRITIK & LITERASI SINEMA',
      tagline: 'Pusat Riset Sinematik, Diskusi Teori Film & Kurasi Karya Mahasiswa',
      description: 'Pusat riset dan diskusi intelektual mahasiswa seputar teori film, semiotika visual, sejarah sinema dunia, kurasi karya, dan penulisan ulasan kritis perfilman.',
      coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1600&auto=format&fit=crop&q=80',
      icon: <BookOpen className="w-5 h-5 text-amber-500" />,
      tupoksiList: [
        'Menyelenggarakan program CineForum & Diskusi Bedah Film tematik dwi-mingguan.',
        'Menyusun katalog resensi film dan esai kritik film dalam buletin berkala himpunan.',
        'Mengadakan workshop penulisan naskah (screenwriting) dan dramaturgi sinematik.',
        'Menjadi dewan kurator seleksi karya film mahasiswa untuk etalase publik.',
      ],
    },
    {
      id: 'PRODUKSI',
      name: 'Divisi Karya dan Produksi',
      shortCode: 'PRODUKSI',
      badge: 'PRODUKSI FILM, KAMERA & WORKSHOP TEKNIS',
      tagline: 'Ujung Tombak Realisasi Film Fiksi Pendek, Dokumenter & Eksperimental',
      description: 'Ujung tombak realisasi film independen himpunan, mencakup pra-produksi, syuting, pascaproduksi, manajemen inventaris kamera/lighting, dan workshop teknis sinematografi.',
      coverImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&auto=format&fit=crop&q=80',
      icon: <Camera className="w-5 h-5 text-[#E50914]" />,
      tupoksiList: [
        'Memfasilitasi produksi film fiksi pendek, dokumenter, dan video eksperimental mahasiswa.',
        'Mengelola peminjaman dan pemeliharaan alat kamera, audio gear, serta tata cahaya.',
        'Menyelenggarakan masterclass teknis directorship, tata kamera, dan color grading.',
        'Memastikan standar operasional prosedur (SOP) keselamatan di lokasi syuting.',
      ],
    },
    {
      id: 'KEMITRAAN',
      name: 'Divisi Jaringan dan Kemitraan',
      shortCode: 'KEMITRAAN',
      badge: 'FESTIVAL, SPONSORSHIP & RELASI SINEMA',
      tagline: 'Jembatan Distribusi Karya ke Festival & Kemitraan Eksternal Industri',
      description: 'Menjembatani karya mahasiswa dengan ekosistem perfilman yang lebih luas, termasuk festival film mahasiswa, asosiasi komunitas, sponsor, dan rumah produksi industri.',
      coverImage: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1600&auto=format&fit=crop&q=80',
      icon: <Share2 className="w-5 h-5 text-indigo-400" />,
      tupoksiList: [
        'Mendaftarkan film karya mahasiswa ke festival film nasional dan internasional.',
        'Membangun kolaborasi pemutaran film alternatif (screening & roadshow) antar-kampus.',
        'Menjalin kemitraan strategis dengan production house, sponsor, dan media partner.',
        'Mengelola database relasi alumni dan direktori jejaring sineas independen.',
      ],
    },
    {
      id: 'MEDINFO',
      name: 'Divisi Media dan Informasi',
      shortCode: 'MEDINFO',
      badge: 'BRANDING, DOKUMENTASI & MEDIA PUBLIK',
      tagline: 'Pusat Komunikasi Visual, Warta Pers & Pengelolaan Portal Publik',
      description: 'Mengelola citra publik himpunan, etalase website publik, dokumentasi kegiatan, rilis pers, serta kampanye konten media sosial resmi.',
      coverImage: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1600&auto=format&fit=crop&q=80',
      icon: <Monitor className="w-5 h-5 text-sky-400" />,
      tupoksiList: [
        'Memproduksi aset visual promosi, poster karya film, dan grafis media sosial.',
        'Mendokumentasikan seluruh rangkaian kegiatan himpunan dalam foto dan video rekap.',
        'Mengelola portal warta pers dan pembaruan berkala etalase karya di website resmi.',
        'Merancang identitas grafis dan branding visual acara tahunan himpunan.',
      ],
    },
  ];

  // Helper to get officers for an operational division
  const getOfficersForDivision = (divisionId: string): Officer[] => {
    if (divisionId === 'KAJIAN') {
      return activeOfficers.filter((o) => o.division.toLowerCase().includes('kajian'));
    }
    if (divisionId === 'PRODUKSI') {
      return activeOfficers.filter(
        (o) => o.division.toLowerCase().includes('karya') || o.division.toLowerCase().includes('produksi')
      );
    }
    if (divisionId === 'KEMITRAAN') {
      return activeOfficers.filter(
        (o) => o.division.toLowerCase().includes('jaringan') || o.division.toLowerCase().includes('kemitraan')
      );
    }
    if (divisionId === 'MEDINFO') {
      return activeOfficers.filter(
        (o) => o.division.toLowerCase().includes('media') || o.division.toLowerCase().includes('informasi')
      );
    }
    return [];
  };

  // Filter officers if search query is active
  const hasSearch = searchQuery.trim().length > 0;
  const searchResults = hasSearch
    ? activeOfficers.filter(
        (o) =>
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          o.division.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.nim && o.nim.includes(searchQuery))
      )
    : [];

  return (
    <section 
      id="struktur" 
      className={`py-20 transition-colors duration-300 border-b ${
        isDark 
          ? 'bg-[#0A0A0A] text-white border-[#1C1C1C]' 
          : 'bg-[#F8F9FA] text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#E50914] mb-2 tracking-widest uppercase">
              <span className="w-2 h-2 bg-[#E50914]"></span>
              <span>TATA KELOLA KEPENGURUSAN 2026/2027</span>
            </div>
            
            <h2 className={`font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Struktur Kepengurusan Cinemind
            </h2>

            <p className={`text-sm mt-2 max-w-2xl font-body ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Jajaran Pembina, Badan Pengurus Harian, dan Divisi Operasional Himpunan Mahasiswa Kajian Film, Televisi, dan Media (KFTM) ITB Bina Sarana Global. Klik kartu personel untuk meninjau tupoksi resmi.
            </p>
          </div>

          {/* Search Bar for Officers */}
          <div className="relative w-full sm:w-72">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Cari pengurus / jabatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-12 py-2.5 rounded-[2px] text-xs font-body focus:outline-none focus:border-[#E50914] transition-colors border ${
                isDark 
                  ? 'bg-[#141414] border-[#262626] text-white placeholder-gray-500' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
              }`}
            />
            {hasSearch && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono cursor-pointer ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-black'
                }`}
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* 1. SEARCH RESULTS VIEW (IF ACTIVE) */}
        {hasSearch ? (
          <div className="space-y-4">
            <div className={`flex items-center justify-between text-xs font-mono pb-2 border-b ${
              isDark ? 'text-gray-400 border-[#222]' : 'text-slate-600 border-slate-200'
            }`}>
              <span>Hasil Pencarian: {searchResults.length} Pengurus Ditemukan</span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#E50914] hover:underline font-semibold cursor-pointer"
              >
                Kembali ke Struktur Organisasi
              </button>
            </div>

            {searchResults.length === 0 ? (
              <div className={`py-16 text-center rounded-[2px] border ${
                isDark ? 'bg-[#141414] border-[#262626]' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                  Tidak ditemukan pengurus dengan kata kunci "{searchQuery}".
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {searchResults.map((officer) => (
                  <div
                    key={officer.id}
                    onClick={() => setSelectedOfficer(officer)}
                    className={`group p-4 rounded-[2px] transition-all cursor-pointer flex flex-col justify-between border ${
                      isDark
                        ? 'bg-[#141414] border-[#262626] hover:border-[#E50914] shadow-hard'
                        : 'bg-white border-slate-200 hover:border-[#E50914] shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="relative aspect-[4/5] mb-3.5 overflow-hidden rounded-[2px] bg-black">
                        <img
                          src={officer.avatar}
                          alt={officer.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 left-2">
                          <span className="px-1.5 py-0.5 bg-black/85 font-mono text-[9px] text-[#E50914] font-bold rounded-[2px] border border-white/10">
                            {officer.classCode || 'KFTM'}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-wider font-semibold block mb-0.5">
                        {officer.roleTitle}
                      </span>
                      <h4 className={`font-display text-base font-bold uppercase group-hover:text-[#E50914] transition-colors leading-tight ${
                        isDark ? 'text-white' : 'text-slate-900'
                      }`}>
                        {officer.name}
                      </h4>
                      <p className={`text-xs font-mono mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        {officer.division}
                      </p>
                    </div>

                    <div className={`mt-3 pt-3 border-t flex items-center justify-between text-[11px] ${
                      isDark ? 'border-[#222] text-gray-500' : 'border-slate-100 text-slate-500'
                    }`}>
                      <span>{officer.nim ? `NIM ${officer.nim}` : 'Dosen Pembina'}</span>
                      <span className="text-[#E50914] font-semibold">Profil &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* REGULAR STRUCTURE VIEW (Pembina & BPH Static, Divisions Exclusive Accordion) */
          <div className="space-y-20">

            {/* =========================================================================
                SECTION 1: PEMBINA HIMPUNAN (STATIC & WITH CUSTOM THEMATIC COVER BANNER)
               ========================================================================= */}
            <div className="space-y-6">
              
              {/* Pembina Custom Section Cover Banner */}
              <div className="relative rounded-[2px] overflow-hidden border border-[#222] shadow-hard">
                <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1600&auto=format&fit=crop&q=80"
                    alt="Dewan Pembina Cover"
                    className="w-full h-full object-cover brightness-[0.45] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                  
                  {/* Banner Content Overlay */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                    <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase mb-1.5 text-[#E50914] font-bold">
                      <GraduationCap className="w-4 h-4" />
                      <span>SUPERVISI AKADEMIK & INSTITUSIONAL</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-4xl font-bold uppercase text-white tracking-tight leading-none">
                      Dewan Pembina Himpunan
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 font-body max-w-2xl mt-2 leading-relaxed">
                      Membimbing arah strategis kurikulum sinematografi, etika keilmuan perfilman, pengawasan legalitas institusional, serta pemenuhan Tri Dharma Perguruan Tinggi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pembina Desktop Precision Card (Centered & Proportionate) */}
              <div className="max-w-4xl mx-auto">
                {pembinaOfficers.map((pembina) => (
                  <div
                    key={pembina.id}
                    onClick={() => setSelectedOfficer(pembina)}
                    className={`group p-6 sm:p-8 rounded-[2px] transition-all cursor-pointer border flex flex-col md:flex-row gap-6 sm:gap-8 items-center md:items-start ${
                      isDark 
                        ? 'bg-[#141414] border-[#262626] hover:border-[#E50914] shadow-hard' 
                        : 'bg-white border-slate-200 hover:border-[#E50914] shadow-md'
                    }`}
                  >
                    {/* Portrait Photo */}
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-[2px] overflow-hidden bg-black shrink-0 border-2 border-[#E50914] shadow-hard-dark">
                      <img
                        src={pembina.avatar}
                        alt={pembina.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                        <span className="px-2 py-0.5 bg-black/90 text-[#E50914] text-[9px] font-mono font-bold rounded-[2px] uppercase tracking-wider border border-[#E50914]/50 shadow-xs">
                          DOSEN PEMBINA
                        </span>
                      </div>
                    </div>

                    {/* Pembina Information & Scope */}
                    <div className="flex-1 min-w-0 text-center md:text-left space-y-3">
                      <div>
                        <span className="inline-block px-2.5 py-1 bg-[#E50914]/10 text-[#E50914] font-mono text-[10px] font-bold uppercase rounded-[2px] border border-[#E50914]/20 mb-2">
                          {pembina.roleTitle}
                        </span>
                        
                        <h4 className={`font-display text-2xl sm:text-3xl font-bold uppercase group-hover:text-[#E50914] transition-colors leading-tight ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {pembina.name}
                        </h4>
                      </div>

                      <p className={`text-xs sm:text-sm leading-relaxed font-body ${
                        isDark ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        Dosen Pembina Himpunan Mahasiswa Kajian Film, Televisi, dan Media (KFTM) ITB Bina Sarana Global. Memberikan arahan kurikulum praktis dan supervisi produksi luar kampus.
                      </p>

                      {/* Tupoksi Summary Pills */}
                      <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        {pembina.tupoksi.slice(0, 2).map((tp, idx) => (
                          <div 
                            key={idx} 
                            className={`p-2 rounded-[2px] text-[11px] font-body flex items-start space-x-2 border ${
                              isDark ? 'bg-[#181818] border-[#292929] text-gray-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914] shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{tp}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-center md:justify-start space-x-2 text-xs font-mono text-[#E50914] font-semibold">
                        <span>Lihat Rincian Tugas Pokok & Fungsi Lengkap</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* =========================================================================
                SECTION 2: BADAN PENGURUS HARIAN (BPH) (STATIC, STRICTLY ORDERED & "PAS")
                Strict Order: 1. Ketua -> 2. Wakil Ketua -> 3. Sekretaris -> 4. Bendahara
                Optimized 5-Column Precision Grid for Large Desktop Screens
               ========================================================================= */}
            <div className="space-y-6">
              
              {/* BPH Custom Section Cover Banner */}
              <div className="relative rounded-[2px] overflow-hidden border border-[#222] shadow-hard">
                <div className="relative h-44 sm:h-52 md:h-60 w-full overflow-hidden bg-black">
                  <img
                    src="https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?w=1600&auto=format&fit=crop&q=80"
                    alt="BPH Cover"
                    className="w-full h-full object-cover brightness-[0.4] scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  
                  {/* Banner Content Overlay */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                    <div className="flex items-center space-x-2 text-[10px] sm:text-xs font-mono tracking-widest uppercase mb-1.5 text-[#E50914] font-bold">
                      <Shield className="w-4 h-4" />
                      <span>LEADERSHIP & EKSEKUTIF INTI</span>
                    </div>
                    <h3 className="font-display text-2xl sm:text-4xl font-bold uppercase text-white tracking-tight leading-none">
                      Badan Pengurus Harian (BPH)
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-300 font-body max-w-2xl mt-2 leading-relaxed">
                      Pucuk pimpinan organisasi yang mengoordinasikan arah kebijakan, administrasi persuratan resmi, dan tata kelola perbendaharaan himpunan.
                    </p>
                  </div>
                </div>
              </div>

              {/* BPH Desktop Precision Grid (Exact 5-Column Side-by-Side View on Desktop) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-5">
                {bphOfficers.map((officer, index) => {
                  const roleLower = officer.roleTitle.toLowerCase();
                  const isKetua = roleLower.includes('ketua') && !roleLower.includes('wakil');
                  const isWakil = roleLower.includes('wakil');
                  const isSekre = roleLower.includes('sekretaris');
                  const isBenda = roleLower.includes('bendahara');

                  const rankLabel = isKetua
                    ? '01 // KETUA'
                    : isWakil
                      ? '02 // WAKIL'
                      : isSekre
                        ? '03 // SEKRE'
                        : isBenda
                          ? roleLower.includes('ii') || roleLower.includes('2')
                            ? '04.2 // BENDA 2'
                            : '04.1 // BENDA 1'
                          : `0${index + 1} // BPH`;

                  return (
                    <div
                      key={officer.id}
                      onClick={() => setSelectedOfficer(officer)}
                      className={`group p-4 rounded-[2px] transition-all duration-300 cursor-pointer flex flex-col justify-between h-full border ${
                        isDark
                          ? 'bg-[#141414] border-[#262626] hover:border-[#E50914] shadow-hard'
                          : 'bg-white border-slate-200 hover:border-[#E50914] shadow-md'
                      }`}
                    >
                      <div>
                        {/* Photo with Order Rank Badge & Aspect Ratio */}
                        <div className="relative aspect-[4/5] mb-3.5 overflow-hidden rounded-[2px] bg-black">
                          <img
                            src={officer.avatar}
                            alt={officer.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-black/85 font-mono text-[9px] text-[#E50914] font-bold rounded-[2px] border border-white/10 shadow-xs">
                              {rankLabel}
                            </span>
                          </div>
                          {officer.classCode && (
                            <div className="absolute top-2 right-2">
                              <span className="px-1.5 py-0.5 bg-black/75 font-mono text-[9px] text-gray-300 rounded-[2px]">
                                {officer.classCode}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Title & Name */}
                        <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-wider font-bold block mb-1">
                          {officer.roleTitle}
                        </span>

                        <h4 className={`font-display text-base font-bold uppercase group-hover:text-[#E50914] transition-colors leading-snug line-clamp-2 min-h-[2.5rem] ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {officer.name}
                        </h4>

                        {/* NIM (Strictly No IPK per Privacy Rule) */}
                        <p className={`text-[11px] font-mono mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                          NIM: {officer.nim}
                        </p>

                        {/* Tupoksi excerpt */}
                        <p className={`text-xs mt-2.5 line-clamp-2 leading-relaxed font-body ${
                          isDark ? 'text-gray-300' : 'text-slate-600'
                        }`}>
                          {officer.tupoksi[0]}
                        </p>
                      </div>

                      {/* Footer link to detail modal */}
                      <div className={`mt-4 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
                        isDark ? 'border-[#222] text-gray-400' : 'border-slate-100 text-slate-500'
                      }`}>
                        <span className="text-[10px] uppercase text-gray-500">BPH Inti</span>
                        <span className="text-[#E50914] font-bold flex items-center space-x-1 group-hover:translate-x-0.5 transition-transform">
                          <span>Profil</span>
                          <span>&rarr;</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* =========================================================================
                SECTION 3: DIVISI KEPENGURUSAN (EXCLUSIVE ACCORDION WITH THEMED COVERS)
                Strict Behavior: Clicking one division automatically closes others.
                Grid inside division: Symmetrically tailored ("Pas") for desktop view.
               ========================================================================= */}
            <div className="space-y-6">
              
              <div className="flex items-center space-x-3 border-b pb-3 border-[#222]">
                <div className="w-8 h-8 rounded-[2px] bg-[#E50914]/15 border border-[#E50914]/30 flex items-center justify-center text-[#E50914]">
                  <Layers className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Divisi Operasional Organisasi
                  </h3>
                  <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    Klik divisi di bawah ini untuk membuka identitas visual, personel, dan program kerja (Otomatis menutup divisi lain)
                  </p>
                </div>
              </div>

              {/* Exclusive Accordion Container */}
              <div className="space-y-4">
                {operationalDivisions.map((division) => {
                  const isExpanded = activeDivisionId === division.id;
                  const divisionOfficers = getOfficersForDivision(division.id);

                  return (
                    <div
                      key={division.id}
                      className={`border rounded-[2px] transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? isDark
                            ? 'bg-[#141414] border-[#E50914] shadow-hard'
                            : 'bg-white border-[#E50914] shadow-lg'
                          : isDark
                            ? 'bg-[#111111] border-[#222222] hover:border-gray-500'
                            : 'bg-white border-slate-200 hover:border-slate-400 shadow-xs'
                      }`}
                    >
                      {/* Accordion Header Strip */}
                      <div
                        onClick={() => toggleDivision(division.id)}
                        className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none group"
                        role="button"
                        tabIndex={0}
                        aria-expanded={isExpanded}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleDivision(division.id);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-4">
                          {/* Division Mini Thumbnail */}
                          <div className="w-12 h-12 rounded-[2px] overflow-hidden shrink-0 bg-black relative border border-white/10 hidden sm:block">
                            <img 
                              src={division.coverImage} 
                              alt={division.name} 
                              className="w-full h-full object-cover brightness-75 group-hover:scale-110 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-[#E50914]/20" />
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded font-bold border ${
                                isDark 
                                  ? 'bg-black/60 text-gray-300 border-white/10' 
                                  : 'bg-slate-100 text-slate-800 border-slate-200'
                              }`}>
                                {division.shortCode}
                              </span>
                              <span className="text-[10px] font-mono uppercase text-[#E50914] font-bold">
                                {division.badge}
                              </span>
                            </div>

                            <h4 className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-tight group-hover:text-[#E50914] transition-colors leading-tight ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {division.name}
                            </h4>
                          </div>
                        </div>

                        {/* Personel Count & Toggle Icon */}
                        <div className={`flex items-center justify-between md:justify-end space-x-5 pt-2 md:pt-0 border-t md:border-t-0 ${
                          isDark ? 'border-[#222]' : 'border-slate-100'
                        }`}>
                          <div className="text-left md:text-right">
                            <span className={`text-xs font-mono font-semibold block ${
                              isDark ? 'text-gray-300' : 'text-slate-700'
                            }`}>
                              {divisionOfficers.length} Personel Terdaftar
                            </span>
                            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                              {isExpanded ? 'Klik Untuk Menutup' : 'Klik Untuk Membuka'}
                            </span>
                          </div>

                          <div
                            className={`w-9 h-9 rounded-[2px] flex items-center justify-center border transition-all duration-300 ${
                              isExpanded
                                ? 'bg-[#E50914] text-white border-[#E50914] rotate-180 shadow-hard-red'
                                : isDark
                                  ? 'bg-[#1C1C1C] border-[#333] text-gray-300 group-hover:border-[#E50914]'
                                  : 'bg-slate-100 border-slate-300 text-slate-700 group-hover:border-[#E50914]'
                            }`}
                          >
                            <ChevronDown className="w-5 h-5" />
                          </div>
                        </div>
                      </div>

                      {/* Accordion Content (Visible ONLY when activeDivisionId === division.id) */}
                      {isExpanded && (
                        <div className={`px-5 sm:px-6 pb-6 pt-2 border-t space-y-6 animate-in slide-in-from-top-2 duration-300 ${
                          isDark ? 'border-[#222222]' : 'border-slate-100'
                        }`}>
                          
                          {/* 1. UNIQUE SECTION COVER BANNER FOR THIS DIVISION */}
                          <div className="relative rounded-[2px] overflow-hidden border border-white/10 shadow-sm mt-3">
                            <div className="relative h-40 sm:h-48 md:h-52 w-full overflow-hidden bg-black">
                              <img
                                src={division.coverImage}
                                alt={division.name}
                                className="w-full h-full object-cover brightness-[0.4] scale-105"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
                              
                              <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                                <div className="flex items-center space-x-2 text-[10px] font-mono tracking-widest uppercase mb-1 text-[#E50914] font-bold">
                                  {division.icon}
                                  <span>{division.badge}</span>
                                </div>
                                <h4 className="font-display text-xl sm:text-2xl font-bold uppercase text-white tracking-tight">
                                  {division.tagline}
                                </h4>
                                <p className="text-xs sm:text-sm text-gray-300 font-body max-w-2xl mt-1 leading-relaxed">
                                  {division.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 2. OFFICER CARDS - DESKTOP PRECISION GRID ("PAS" / NO ORPHAN WRAPPING) */}
                          <div>
                            <div className={`flex items-center justify-between mb-4 text-xs font-mono ${
                              isDark ? 'text-gray-400' : 'text-slate-600'
                            }`}>
                              <span className="uppercase tracking-wider font-bold">
                                Jajaran Personel Divisi ({divisionOfficers.length} Anggota)
                              </span>
                              <span className="text-[11px] text-gray-500">
                                * Klik kartu pengurus untuk profil & tupoksi lengkap
                              </span>
                            </div>

                            {/* Dynamically optimized desktop grid:
                                - 2 officers (e.g. Kajian): grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto
                                - 3 officers (e.g. Produksi, Kemitraan, Medinfo): grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
                            */}
                            <div className={`grid gap-5 ${
                              divisionOfficers.length === 2
                                ? 'grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto'
                                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                            }`}>
                              {divisionOfficers.map((officer) => (
                                <div
                                  key={officer.id}
                                  onClick={() => setSelectedOfficer(officer)}
                                  className={`group p-4 rounded-[2px] transition-all duration-300 cursor-pointer flex flex-col justify-between h-full border ${
                                    isDark
                                      ? 'bg-[#181818] border-[#282828] hover:border-[#E50914] shadow-hard'
                                      : 'bg-white border-slate-200 hover:border-[#E50914] shadow-sm'
                                  }`}
                                >
                                  <div>
                                    <div className="relative aspect-[4/5] mb-3 overflow-hidden rounded-[2px] bg-black">
                                      <img
                                        src={officer.avatar}
                                        alt={officer.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                      <div className="absolute top-2 left-2">
                                        <span className="px-1.5 py-0.5 bg-black/85 font-mono text-[9px] text-[#E50914] font-bold rounded-[2px] border border-white/10">
                                          {officer.level === 2 ? 'KADIV' : 'STAFF'}
                                        </span>
                                      </div>
                                      {officer.classCode && (
                                        <div className="absolute top-2 right-2">
                                          <span className="px-1.5 py-0.5 bg-black/75 font-mono text-[9px] text-gray-300 rounded-[2px]">
                                            {officer.classCode}
                                          </span>
                                        </div>
                                      )}
                                    </div>

                                    <span className="text-[10px] font-mono text-[#E50914] uppercase tracking-wider font-bold block mb-1">
                                      {officer.roleTitle}
                                    </span>
                                    
                                    <h5 className={`font-display text-base font-bold uppercase group-hover:text-[#E50914] transition-colors leading-tight line-clamp-2 min-h-[2.5rem] ${
                                      isDark ? 'text-white' : 'text-slate-900'
                                    }`}>
                                      {officer.name}
                                    </h5>

                                    {/* NIM (Strictly No IPK per Privacy Rule) */}
                                    <p className={`text-[11px] font-mono mt-1 ${
                                      isDark ? 'text-gray-400' : 'text-slate-500'
                                    }`}>
                                      {officer.nim ? `NIM: ${officer.nim}` : 'Dosen Pembina'}
                                    </p>

                                    <p className={`text-xs mt-2 line-clamp-2 leading-relaxed font-body ${
                                      isDark ? 'text-gray-300' : 'text-slate-600'
                                    }`}>
                                      {officer.tupoksi[0] || 'Tupoksi operasional divisi'}
                                    </p>
                                  </div>

                                  <div className={`mt-3.5 pt-2.5 border-t flex items-center justify-between text-[11px] ${
                                    isDark ? 'border-[#262626] text-gray-500' : 'border-slate-100 text-slate-500'
                                  }`}>
                                    <span className="truncate max-w-[140px] font-mono text-[10px] uppercase text-gray-400">
                                      {division.shortCode}
                                    </span>
                                    <span className="text-[#E50914] font-bold text-[11px] uppercase shrink-0 flex items-center space-x-1">
                                      <span>Profil</span>
                                      <span>&rarr;</span>
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 3. TUPOKSI & PROGRAM KERJA MATRIX */}
                          <div className={`pt-4 border-t ${isDark ? 'border-[#242424]' : 'border-slate-200'}`}>
                            <h5 className={`text-xs font-mono uppercase tracking-widest mb-3 flex items-center space-x-2 ${
                              isDark ? 'text-gray-300' : 'text-slate-700'
                            }`}>
                              <Briefcase className="w-4 h-4 text-[#E50914]" />
                              <span className="font-bold">Tupoksi & Program Kerja Unggulan {division.name}</span>
                            </h5>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                              {division.tupoksiList.map((tp, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3.5 rounded-[2px] flex items-start space-x-3 text-xs border ${
                                    isDark 
                                      ? 'bg-[#181818] border-[#282828] text-gray-300' 
                                      : 'bg-slate-50 border-slate-200 text-slate-800'
                                  }`}
                                >
                                  <CheckCircle2 className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                                  <span className="leading-relaxed font-body">{tp}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal Detail Pengurus (Strictly without IPK) */}
      <OfficerDetailModal
        officer={selectedOfficer}
        onClose={() => setSelectedOfficer(null)}
      />
    </section>
  );
};
