import React from 'react';
import { Play, Award, Film, Calendar, Clapperboard, ChevronRight } from 'lucide-react';
import { FilmWork } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface PublicHeroProps {
  featuredFilm?: FilmWork | null;
  onWatchFilm: (film: FilmWork) => void;
  onExploreFilms: () => void;
}

const DEFAULT_HERO_FILM: FilmWork = {
  id: 'cinemind-archive-default',
  title: 'Cinemind Cinema Archive',
  director: 'Departemen Produksi Himpunan',
  dop: 'Divisi Sinematografi Cinemind',
  productionHouse: 'Cinemind Film Lab',
  year: 2026,
  duration: 'Etalase Karya',
  genre: 'Sinema Eksperimental / Fiksi',
  synopsis: 'Etalase resmi sinema independen garapan mahasiswa Himpunan Mahasiswa Cinemind. Menampilkan ragam film pendek fiksi, dokumenter, dan sinematografi karya mahasiswa yang berkreasi dengan kejujuran visual.',
  thumbnailUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80',
  embedUrl: '',
  featured: true
};

export const PublicHero: React.FC<PublicHeroProps> = ({
  featuredFilm,
  onWatchFilm,
  onExploreFilms,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const film = featuredFilm || DEFAULT_HERO_FILM;
  const thumbnail = film.thumbnailUrl || DEFAULT_HERO_FILM.thumbnailUrl;

  return (
    <section 
      id="hero" 
      className={`relative overflow-hidden border-b transition-colors duration-300 ${
        isDark 
          ? 'bg-[#0A0A0A] text-white border-[#1A1A1A]' 
          : 'bg-[#F8F9FA] text-slate-900 border-slate-200'
      }`}
    >
      {/* Cinematic Viewfinder corner overlays (subtle camera framing) */}
      <div className={`absolute top-4 left-6 pointer-events-none z-20 hidden md:flex items-center space-x-3 text-xs font-mono ${
        isDark ? 'text-gray-500' : 'text-slate-500'
      }`}>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E50914] animate-pulse"></span>
          <span className={`font-bold tracking-widest text-[11px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
            REC [24 FPS]
          </span>
        </div>
        <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>|</span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>4K DCI 2.39:1</span>
        <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>|</span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>ISO 800 5600K</span>
      </div>

      <div className={`absolute top-4 right-6 pointer-events-none z-20 hidden md:flex items-center space-x-2 text-xs font-mono ${
        isDark ? 'text-gray-500' : 'text-slate-500'
      }`}>
        <span className={`px-2 py-0.5 rounded-[2px] border ${
          isDark ? 'border-gray-700 text-gray-300' : 'border-slate-300 text-slate-700 bg-white/70'
        }`}>
          RAW CINEMA
        </span>
        <span className={isDark ? 'text-gray-400' : 'text-slate-600'}>PROD-CINEMIND-2026</span>
      </div>

      {/* Hero Visual Container */}
      <div className="relative min-h-[580px] lg:min-h-[660px] flex items-center">
        {/* Background Film Backdrop with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={thumbnail}
            alt={film.title}
            className={`w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out ${
              isDark 
                ? 'brightness-[0.4] contrast-125' 
                : 'brightness-[0.75] contrast-105'
            }`}
          />
          {/* Cinema gradient vignette adapted to current theme */}
          {isDark ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent w-full lg:w-3/4" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FA] via-[#F8F9FA]/80 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F8F9FA] via-[#F8F9FA]/90 to-transparent w-full lg:w-3/4" />
            </>
          )}
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24 w-full">
          <div className="max-w-2xl lg:max-w-3xl space-y-6">
            
            {/* Festival Badge */}
            {film.festivalAwards && film.festivalAwards.length > 0 && (
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-[2px] text-xs font-medium backdrop-blur-sm border ${
                isDark 
                  ? 'bg-[#1A1A1A]/90 border-amber-500/40 text-amber-300' 
                  : 'bg-amber-50 border-amber-300 text-amber-800 shadow-xs'
              }`}>
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span className="font-semibold tracking-wide uppercase text-[11px]">
                  {film.festivalAwards[0]}
                </span>
              </div>
            )}

            {/* Film Meta details */}
            <div className={`flex items-center space-x-3 text-xs sm:text-sm font-medium ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              <span className="px-2 py-0.5 bg-[#E50914] text-white text-[11px] font-bold uppercase rounded-[2px]">
                Karya Unggulan
              </span>
              <span>{film.year}</span>
              <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>•</span>
              <span>{film.duration}</span>
              <span className={isDark ? 'text-gray-600' : 'text-slate-400'}>•</span>
              <span className={isDark ? 'text-gray-300' : 'text-slate-800 font-semibold'}>{film.genre}</span>
            </div>

            {/* Big Cinematic Display Title */}
            <h1 className={`font-display text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-none drop-shadow-xs ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {film.title}
            </h1>

            {/* Director & Crew credit */}
            <p className={`text-sm font-mono ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
              Sutradara: <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900 font-semibold'}`}>{film.director}</span> 
              {film.dop && <> | Sinematografi: <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900 font-semibold'}`}>{film.dop}</span></>}
              {film.productionHouse && <> | PH: <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900 font-semibold'}`}>{film.productionHouse}</span></>}
            </p>

            {/* Synopsis */}
            <p className={`text-sm sm:text-base leading-relaxed line-clamp-3 sm:line-clamp-4 max-w-2xl font-body ${
              isDark ? 'text-gray-300' : 'text-slate-700'
            }`}>
              {film.synopsis}
            </p>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onWatchFilm(film)}
                className="flex items-center space-x-3 px-6 py-3.5 bg-[#E50914] hover:bg-[#b91c1c] text-white text-sm font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red transition-all cursor-pointer group"
              >
                <div className="w-7 h-7 rounded-full bg-white text-[#E50914] flex items-center justify-center transition-transform group-hover:scale-110">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <span>Tonton Film / Trailer</span>
              </button>

              <button
                onClick={onExploreFilms}
                className={`flex items-center space-x-2 px-5 py-3.5 border text-sm font-medium rounded-[2px] transition-all cursor-pointer ${
                  isDark 
                    ? 'bg-[#1F1F1F] hover:bg-[#2A2A2A] border-[#333333] text-gray-200 hover:text-white' 
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 hover:text-black shadow-xs'
                }`}
              >
                <Film className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
                <span>Katalog Seluruh Karya</span>
                <ChevronRight className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-slate-500'}`} />
              </button>
            </div>

          </div>
        </div>

        {/* Viewfinder crosshairs at bottom */}
        <div className={`absolute bottom-6 right-8 pointer-events-none hidden lg:block text-xs font-mono ${
          isDark ? 'text-gray-600' : 'text-slate-400'
        }`}>
          CINEMIND ARCHIVE // 2026 EDITION
        </div>
      </div>
    </section>
  );
};

