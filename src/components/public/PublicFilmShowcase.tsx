import React, { useState } from 'react';
import { Film, Play, Award, Search, Filter } from 'lucide-react';
import { FilmWork } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface PublicFilmShowcaseProps {
  films: FilmWork[];
  onSelectFilm: (film: FilmWork) => void;
}

export const PublicFilmShowcase: React.FC<PublicFilmShowcaseProps> = ({
  films,
  onSelectFilm,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const genres = [
    'Semua',
    'Drama',
    'Romansa',
    'Komedi Satir',
    'Misteri',
    'Dokumenter',
    'Eksperimental'
  ];

  // Pastikan karya film diurutkan sehingga unggahan terbaru muncul di posisi pertama (slot 1) dan menggeser unggahan sebelumnya
  const sortedFilms = [...films].sort((a, b) => {
    const timeA = a.createdAt || (a.year ? new Date(`${a.year}-01-01`).getTime() : 0);
    const timeB = b.createdAt || (b.year ? new Date(`${b.year}-01-01`).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    return (b.year || 0) - (a.year || 0);
  });

  const filteredFilms = sortedFilms.filter((film) => {
    const matchesGenre =
      selectedGenre === 'Semua' ||
      film.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesSearch =
      film.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      film.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
      film.synopsis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGenre && matchesSearch;
  });

  return (
    <section 
      id="karya" 
      className={`py-20 transition-colors duration-300 border-b ${
        isDark 
          ? 'bg-[#0A0A0A] text-white border-[#1C1C1C]' 
          : 'bg-[#FAFAFA] text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#E50914] mb-2 tracking-widest uppercase">
              <span className="w-2 h-2 bg-[#E50914]"></span>
              <span>ETALASE SINEMA MAHASISWA</span>
            </div>
            <h2 className={`font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Karya Film Cinemind
            </h2>
            <p className={`text-sm mt-2 max-w-xl font-body ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Koleksi film pendek fiksi, dokumenter, dan eksperimental garapan mahasiswa Himpunan Cinemind yang diproduksi secara independen.
            </p>
          </div>

          {/* Search Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-400' : 'text-slate-400'
              }`} />
              <input
                type="text"
                placeholder="Cari judul atau sutradara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full sm:w-64 text-xs pl-9 pr-3 py-2.5 rounded-[2px] focus:outline-none focus:border-[#E50914] transition-colors border ${
                  isDark
                    ? 'bg-[#141414] border-[#2B2B2B] text-white placeholder-gray-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
          <span className={`font-mono text-[11px] uppercase mr-2 flex items-center ${
            isDark ? 'text-gray-500' : 'text-slate-500'
          }`}>
            <Filter className="w-3 h-3 mr-1" /> Genre:
          </span>
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-[2px] transition-colors cursor-pointer font-medium whitespace-nowrap uppercase tracking-wider text-[11px] ${
                selectedGenre === genre
                  ? 'bg-[#E50914] text-white shadow-hard-red'
                  : isDark
                    ? 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#252525] border border-[#2E2E2E]'
                    : 'bg-white text-slate-700 hover:text-[#E50914] hover:border-[#E50914] border border-slate-300 shadow-xs'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* 16:9 Film Cards Grid */}
        {filteredFilms.length === 0 ? (
          <div className={`py-20 text-center rounded-[2px] border ${
            isDark ? 'bg-[#111111] border-[#222222]' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Film className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Tidak ada film yang cocok dengan pencarian.
            </p>
            <button
              onClick={() => { setSelectedGenre('Semua'); setSearchQuery(''); }}
              className="mt-3 text-xs text-[#E50914] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredFilms.map((film, index) => (
              <div
                key={film.id}
                onClick={() => onSelectFilm(film)}
                className={`group cursor-pointer rounded-[2px] overflow-hidden transition-all duration-300 flex flex-col border ${
                  isDark
                    ? 'bg-[#141414] border-[#222222] hover:border-[#444444] shadow-hard-dark'
                    : 'bg-white border-slate-200 hover:border-slate-400 shadow-sm'
                }`}
              >
                {/* 16:9 Ratio Thumbnail Container with Hover Reveal */}
                <div className="relative w-full aspect-video overflow-hidden bg-black">
                  <img
                    src={film.thumbnailUrl}
                    alt={film.title}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-75"
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
                    <div className="flex items-center space-x-1.5">
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-[#E50914] text-white text-[10px] font-mono tracking-wider uppercase rounded-[2px] font-bold shadow-xs flex items-center">
                          ★ RILIS TERBARU
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-black/80 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider uppercase rounded-[2px] border border-white/10">
                        {film.year} • {film.duration}
                      </span>
                    </div>
                    {film.festivalAwards && film.festivalAwards.length > 0 && (
                      <span className="p-1 bg-amber-500/90 text-black rounded-[2px]" title={film.festivalAwards[0]}>
                        <Award className="w-3.5 h-3.5 stroke-[2.5]" />
                      </span>
                    )}
                  </div>

                  {/* Center Circular Play Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="w-12 h-12 rounded-full bg-white text-[#E50914] flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Director Overlay */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-[11px] font-mono text-gray-300 tracking-wide bg-black/75 px-2 py-1 rounded-[2px] inline-block">
                      Sutradara: <span className="text-white font-semibold">{film.director}</span>
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between transition-transform duration-300 group-hover:-translate-y-1">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#E50914] font-semibold uppercase tracking-wider mb-1.5">
                      <span>{film.genre}</span>
                      <span className="text-gray-500 font-mono text-[10px]">{film.dop ? `DOP: ${film.dop}` : ''}</span>
                    </div>

                    <h3 className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-tight group-hover:text-[#E50914] transition-colors leading-tight ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {film.title}
                    </h3>

                    <p className={`text-xs mt-2 line-clamp-2 leading-relaxed font-body ${
                      isDark ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      {film.synopsis}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-[#222222] text-gray-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="font-mono text-[11px] truncate max-w-[160px]">
                      {film.productionHouse || 'Cinemind Film Lab'}
                    </span>
                    <span className={`group-hover:text-[#E50914] font-semibold text-[11px] uppercase tracking-wider flex items-center space-x-1 shrink-0 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      <span>Putar Film</span>
                      <span>→</span>
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
