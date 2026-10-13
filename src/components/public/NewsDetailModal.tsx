import React from 'react';
import { X, Calendar, User, Clock, Tag } from 'lucide-react';
import { NewsArticle } from '../../types';
import { formatDateIndonesian } from '../../utils/pdfGenerator';
import { useTheme } from '../../context/ThemeContext';

interface NewsDetailModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsDetailModal: React.FC<NewsDetailModalProps> = ({ article, onClose }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!article) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className={`relative border rounded-[2px] max-w-3xl w-full my-auto overflow-hidden shadow-2xl transition-colors duration-300 ${
          isDark 
            ? 'bg-[#141414] border-[#2B2B2B] text-white' 
            : 'bg-white border-slate-200 text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/60 hover:bg-[#E50914] text-white rounded-[2px] transition-colors cursor-pointer"
          aria-label="Tutup artikel warta"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Thumbnail Hero */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-black">
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${isDark ? 'from-[#141414]' : 'from-white/90'} via-transparent to-transparent`} />
          <div className="absolute bottom-4 left-6">
            <span className="px-2.5 py-1 bg-[#E50914] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px]">
              {article.category}
            </span>
          </div>
        </div>

        {/* Article Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Meta Info */}
          <div className={`flex flex-wrap items-center gap-4 text-xs font-mono border-b pb-4 ${
            isDark ? 'text-gray-400 border-[#262626]' : 'text-slate-500 border-slate-200'
          }`}>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-500" />
              <span>{formatDateIndonesian(article.publishDate)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>{article.author}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-500" />
              <span>Waktu baca: {article.readTime}</span>
            </div>
          </div>

          {/* Heading */}
          <h2 className={`font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-tight ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            {article.title}
          </h2>

          {/* Summary Quote */}
          {article.summary && (
            <div className={`p-4 border-l-2 border-[#E50914] text-sm italic font-body ${
              isDark ? 'bg-[#1C1C1C] text-gray-300' : 'bg-slate-50 text-slate-700'
            }`}>
              {article.summary}
            </div>
          )}

          {/* Paragraphs */}
          <div className={`space-y-4 text-sm sm:text-base leading-relaxed font-body ${
            isDark ? 'text-gray-200' : 'text-slate-800'
          }`}>
            {article.content.split('\n\n').map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>

          {/* Footer of modal */}
          <div className={`pt-6 border-t flex items-center justify-between text-xs font-mono ${
            isDark ? 'border-[#222222] text-gray-500' : 'border-slate-200 text-slate-400'
          }`}>
            <span>DIVISI MEDIA & INFORMASI CINEMIND</span>
            <span>PRESS RELEASE // PERS HIMAPRODI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
