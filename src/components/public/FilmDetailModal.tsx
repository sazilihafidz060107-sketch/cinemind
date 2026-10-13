import React from 'react';
import { X, Play, Award, Film, User, Clock, Calendar, Share2 } from 'lucide-react';
import { FilmWork } from '../../types';

interface FilmDetailModalProps {
  film: FilmWork | null;
  onClose: () => void;
}

export const FilmDetailModal: React.FC<FilmDetailModalProps> = ({ film, onClose }) => {
  if (!film) return null;

  // Convert YouTube link into safe embed format if needed
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    
    // Check if watch?v= format
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);

    if (match && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative bg-[#141414] border border-[#2A2A2A] rounded-[2px] max-w-4xl w-full my-auto overflow-hidden shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/70 hover:bg-[#E50914] text-white rounded-[2px] transition-colors cursor-pointer"
          aria-label="Tutup pemutar film"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Video Player Section (16:9 responsive aspect ratio) */}
        <div className="relative w-full aspect-video bg-black">
          {film.embedUrl ? (
            <iframe
              src={getEmbedUrl(film.embedUrl)}
              title={film.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
              <Film className="w-12 h-12 text-gray-600 mb-2" />
              <p className="text-sm">Link video embed belum dikonfigurasi.</p>
            </div>
          )}
        </div>

        {/* Film Details Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#262626] pb-4">
            <div>
              <div className="flex items-center space-x-2 text-xs text-gray-400 mb-1">
                <span className="px-2 py-0.5 bg-[#E50914] text-white font-bold rounded-[2px] uppercase text-[10px]">
                  {film.genre}
                </span>
                <span>{film.year}</span>
                <span>•</span>
                <span>{film.duration}</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-white">
                {film.title}
              </h2>
            </div>

            {/* Awards list if any */}
            {film.festivalAwards && film.festivalAwards.length > 0 && (
              <div className="flex flex-col items-end gap-1">
                {film.festivalAwards.map((award, i) => (
                  <div key={i} className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs rounded-[2px]">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>{award}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credits Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[#1A1A1A] rounded-[2px] border border-[#262626] text-xs">
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-[10px] mb-1">Sutradara</p>
              <p className="font-semibold text-white">{film.director}</p>
            </div>
            {film.producer && (
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[10px] mb-1">Produser</p>
                <p className="font-semibold text-white">{film.producer}</p>
              </div>
            )}
            {film.dop && (
              <div>
                <p className="text-gray-400 uppercase tracking-wider text-[10px] mb-1">Sinematografer (DOP)</p>
                <p className="font-semibold text-white">{film.dop}</p>
              </div>
            )}
            <div>
              <p className="text-gray-400 uppercase tracking-wider text-[10px] mb-1">Production House</p>
              <p className="font-semibold text-white">{film.productionHouse || 'Cinemind Film Lab'}</p>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase tracking-widest text-gray-400 font-mono">
              Sinopsis Karya
            </h3>
            <p className="text-sm sm:text-base text-gray-200 leading-relaxed font-body">
              {film.synopsis}
            </p>
          </div>

          {/* Footer inside modal */}
          <div className="pt-2 flex items-center justify-between text-xs text-gray-500 border-t border-[#222222]">
            <span>Hak Cipta © {film.year} Himpunan Mahasiswa Cinemind</span>
            <span className="font-mono text-[11px] text-gray-400">STATUS: PUBLIK KATALOG</span>
          </div>
        </div>
      </div>
    </div>
  );
};
