import React, { useState } from 'react';
import { Newspaper, Calendar, ArrowRight, Clock, User } from 'lucide-react';
import { NewsArticle } from '../../types';
import { formatDateIndonesian } from '../../utils/pdfGenerator';
import { useTheme } from '../../context/ThemeContext';

interface PublicNewsSectionProps {
  news: NewsArticle[];
  onSelectNews: (article: NewsArticle) => void;
}

export const PublicNewsSection: React.FC<PublicNewsSectionProps> = ({
  news,
  onSelectNews,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('Semua');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const categories = ['Semua', 'Warta Kegiatan', 'Workshop & Sinema', 'Festival', 'Pengumuman'];

  // Pastikan warta berita diurutkan sehingga artikel/rilis terbaru muncul di posisi pertama (slot 1) dan menggeser berita sebelumnya
  const sortedNews = [...news].sort((a, b) => {
    const timeA = a.createdAt || (a.publishDate ? new Date(a.publishDate).getTime() : 0);
    const timeB = b.createdAt || (b.publishDate ? new Date(b.publishDate).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    const dateA = new Date(a.publishDate).getTime() || 0;
    const dateB = new Date(b.publishDate).getTime() || 0;
    return dateB - dateA;
  });

  const filteredNews = sortedNews.filter((item) => {
    if (selectedFilter === 'Semua') return true;
    return item.category === selectedFilter;
  });

  return (
    <section 
      id="berita" 
      className={`py-20 transition-colors duration-300 border-b ${
        isDark 
          ? 'bg-[#0E0E0E] text-white border-[#1C1C1C]' 
          : 'bg-[#F3F4F6] text-slate-900 border-slate-200'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#E50914] mb-2 tracking-widest uppercase">
              <span className="w-2 h-2 bg-[#E50914]"></span>
              <span>WARTA & DOKUMENTASI RESMI</span>
            </div>
            <h2 className={`font-display text-3xl sm:text-5xl font-bold uppercase tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Warta & Berita Kegiatan
            </h2>
            <p className={`text-sm mt-2 max-w-xl font-body ${
              isDark ? 'text-gray-400' : 'text-slate-600'
            }`}>
              Kabar terkini seputar produksi film, workshop sinematografi, rilis karya mahasiswa, dan siaran pers resmi Himpunan Cinemind.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedFilter(cat)}
                className={`px-3.5 py-1.5 rounded-[2px] font-mono tracking-wider uppercase transition-colors shrink-0 cursor-pointer ${
                  selectedFilter === cat
                    ? 'bg-[#E50914] text-white shadow-hard-red'
                    : isDark
                      ? 'bg-[#181818] text-gray-300 hover:text-white hover:bg-[#252525] border border-[#2E2E2E]'
                      : 'bg-white text-slate-700 hover:text-[#E50914] hover:bg-slate-50 border border-slate-300 shadow-xs'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listicle News Layout */}
        {filteredNews.length === 0 ? (
          <div className={`py-16 text-center rounded-[2px] border ${
            isDark 
              ? 'bg-[#141414] border-[#242424]' 
              : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
              Belum ada warta atau berita kegiatan pada kategori ini.
            </p>
            {selectedFilter !== 'Semua' && (
              <button
                onClick={() => setSelectedFilter('Semua')}
                className="mt-3 text-xs text-[#E50914] hover:underline uppercase tracking-wider font-semibold cursor-pointer"
              >
                Tampilkan Semua Kategori
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredNews.map((article, index) => (
              <article
                key={article.id}
                onClick={() => onSelectNews(article)}
                className={`group cursor-pointer rounded-[2px] overflow-hidden flex flex-col sm:flex-row transition-all duration-300 border ${
                  isDark
                    ? 'bg-[#141414] border-[#242424] hover:border-[#404040] shadow-hard-dark'
                    : 'bg-white border-slate-200 hover:border-[#E50914] shadow-xs'
                }`}
              >
                {/* Thumbnail Container */}
                <div className="sm:w-52 h-48 sm:h-auto shrink-0 relative overflow-hidden bg-black">
                  <img
                    src={article.thumbnailUrl}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 group-hover:brightness-90"
                    loading="lazy"
                  />
                  <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                    {index === 0 && (
                      <span className="px-2 py-0.5 bg-black/85 text-amber-400 border border-amber-400/50 text-[10px] font-mono font-bold uppercase rounded-[2px] tracking-wide shadow-xs flex items-center">
                        ★ TERBARU
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-[#E50914] text-white text-[10px] font-bold uppercase rounded-[2px] tracking-wide">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className={`flex items-center space-x-3 text-[11px] font-mono mb-2 ${
                      isDark ? 'text-gray-400' : 'text-slate-500'
                    }`}>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-gray-500" />
                        {formatDateIndonesian(article.publishDate)}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-gray-500" />
                        {article.readTime}
                      </span>
                    </div>

                    <h3 className={`font-display text-lg sm:text-xl font-bold uppercase tracking-tight group-hover:text-[#E50914] transition-colors line-clamp-2 leading-snug ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {article.title}
                    </h3>

                    <p className={`text-xs mt-2 line-clamp-3 leading-relaxed font-body ${
                      isDark ? 'text-gray-400' : 'text-slate-600'
                    }`}>
                      {article.summary}
                    </p>
                  </div>

                  <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                    isDark ? 'border-[#222222] text-gray-400' : 'border-slate-100 text-slate-500'
                  }`}>
                    <span className="text-[11px] font-mono flex items-center">
                      <User className="w-3 h-3 mr-1 text-gray-500" />
                      {article.author}
                    </span>
                    <span className="text-[#E50914] font-semibold text-[11px] uppercase tracking-wider flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                      <span>Baca Rilis</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
