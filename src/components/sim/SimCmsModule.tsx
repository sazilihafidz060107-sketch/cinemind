import React, { useState } from 'react';
import { 
  Film, 
  Newspaper, 
  Plus, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  CheckCircle, 
  AlertCircle, 
  Image as ImageIcon,
  Play,
  Award,
  Calendar,
  X,
  Upload
} from 'lucide-react';
import { FilmWork, NewsArticle } from '../../types';
import { formatDateIndonesian } from '../../utils/pdfGenerator';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SimCmsModuleProps {
  works: FilmWork[];
  news: NewsArticle[];
  onSaveWork: (work: FilmWork) => void;
  onDeleteWork: (id: string) => void;
  onSaveNews: (news: NewsArticle) => void;
  onDeleteNews: (id: string) => void;
}

export const SimCmsModule: React.FC<SimCmsModuleProps> = ({
  works,
  news,
  onSaveWork,
  onDeleteWork,
  onSaveNews,
  onDeleteNews,
}) => {
  const [activeTab, setActiveTab] = useState<'karya' | 'berita'>('karya');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'karya' | 'berita';
    id: string;
    name: string;
  } | null>(null);

  // Form states for Karya Film
  const [isFilmModalOpen, setIsFilmModalOpen] = useState<boolean>(false);
  const [editingFilmId, setEditingFilmId] = useState<string | null>(null);
  const [filmTitle, setFilmTitle] = useState<string>('');
  const [filmDirector, setFilmDirector] = useState<string>('');
  const [filmProducer, setFilmProducer] = useState<string>('');
  const [filmDop, setFilmDop] = useState<string>('');
  const [filmProductionHouse, setFilmProductionHouse] = useState<string>('Cinemind Film Lab');
  const [filmYear, setFilmYear] = useState<number>(2026);
  const [filmDuration, setFilmDuration] = useState<string>('18 Menit');
  const [filmGenre, setFilmGenre] = useState<string>('Drama / Pendek');
  const [filmSynopsis, setFilmSynopsis] = useState<string>('');
  const [filmEmbedUrl, setFilmEmbedUrl] = useState<string>('');
  const [filmThumbnailUrl, setFilmThumbnailUrl] = useState<string>('');
  const [filmAwardsInput, setFilmAwardsInput] = useState<string>('');
  const [embedUrlError, setEmbedUrlError] = useState<string | null>(null);
  const [filmFormError, setFilmFormError] = useState<string | null>(null);

  // Form states for Berita / Warta
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [newsTitle, setNewsTitle] = useState<string>('');
  const [newsCategory, setNewsCategory] = useState<NewsArticle['category']>('Warta Kegiatan');
  const [newsAuthor, setNewsAuthor] = useState<string>('Sarah Nabila (Medinfo)');
  const [newsPublishDate, setNewsPublishDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newsSummary, setNewsSummary] = useState<string>('');
  const [newsContent, setNewsContent] = useState<string>('');
  const [newsThumbnailUrl, setNewsThumbnailUrl] = useState<string>('');
  const [newsReadTime, setNewsReadTime] = useState<string>('3 Menit');
  const [newsFormError, setNewsFormError] = useState<string | null>(null);

  // Convert and sanitize embed URL per PRD
  const sanitizeEmbedUrl = (raw: string): string => {
    let clean = raw.trim();

    // Check if user pasted full iframe tag: extract src
    if (clean.includes('<iframe')) {
      const match = clean.match(/src=["'](.*?)["']/);
      if (match && match[1]) {
        clean = match[1];
      }
    }

    // Convert standard watch link: https://www.youtube.com/watch?v=XYZ -> https://www.youtube-nocookie.com/embed/XYZ
    if (clean.includes('watch?v=')) {
      const videoId = clean.split('watch?v=')[1].split('&')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    // Convert short youtu.be/XYZ
    if (clean.includes('youtu.be/')) {
      const videoId = clean.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }

    return clean;
  };

  // Image upload with 2MB limit per PRD Edge Case
  const handleImageCompressionUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'film' | 'news'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (2MB max per PRD)
    if (file.size > 2 * 1024 * 1024) {
      if (type === 'film') {
        setFilmFormError('Ukuran file melebihi 2MB! Sistem membatasi ukuran file mandiri. Harap gunakan gambar poster di bawah 2MB.');
      } else {
        setNewsFormError('Ukuran file melebihi 2MB! Harap gunakan file gambar thumbnail di bawah 2MB.');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (type === 'film') {
        setFilmThumbnailUrl(dataUrl);
        setFilmFormError(null);
      } else {
        setNewsThumbnailUrl(dataUrl);
        setNewsFormError(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Film
  const handleSubmitFilm = (e: React.FormEvent) => {
    e.preventDefault();
    setFilmFormError(null);

    if (!filmTitle.trim() || !filmDirector.trim() || !filmSynopsis.trim()) {
      setFilmFormError('Judul film, Sutradara, dan Sinopsis cerita wajib diisi.');
      return;
    }

    const finalEmbed = sanitizeEmbedUrl(filmEmbedUrl);
    if (!finalEmbed.includes('youtube') && !finalEmbed.includes('embed')) {
      setEmbedUrlError('Format URL Embed wajib format iframe atau link standar YouTube embed!');
      return;
    }
    setEmbedUrlError(null);

    const awardsArray = filmAwardsInput
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    const work: FilmWork = {
      id: editingFilmId || `film-${Date.now()}`,
      title: filmTitle.trim(),
      director: filmDirector.trim(),
      producer: filmProducer.trim() || undefined,
      dop: filmDop.trim() || undefined,
      productionHouse: filmProductionHouse.trim() || 'Cinemind Film Lab',
      year: Number(filmYear) || 2026,
      duration: filmDuration.trim() || '15 Menit',
      genre: filmGenre.trim() || 'Drama',
      synopsis: filmSynopsis.trim(),
      embedUrl: finalEmbed,
      thumbnailUrl:
        filmThumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&auto=format&fit=crop&q=80',
      festivalAwards: awardsArray.length > 0 ? awardsArray : undefined,
      createdAt: editingFilmId
        ? (works.find((w) => w.id === editingFilmId)?.createdAt || Date.now())
        : Date.now(),
    };

    onSaveWork(work);
    setIsFilmModalOpen(false);
    setFeedback(`Karya film "${work.title}" berhasil dipublikasikan! Tampil di posisi pertama etalase publik dan menggeser unggahan sebelumnya.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Submit News
  const handleSubmitNews = (e: React.FormEvent) => {
    e.preventDefault();
    setNewsFormError(null);

    if (!newsTitle.trim() || !newsContent.trim()) {
      setNewsFormError('Judul rilis warta dan isi artikel berita wajib diisi.');
      return;
    }

    const article: NewsArticle = {
      id: editingNewsId || `news-${Date.now()}`,
      title: newsTitle.trim(),
      category: newsCategory,
      author: newsAuthor.trim() || 'Tim Medinfo',
      publishDate: newsPublishDate,
      summary: newsSummary.trim() || newsContent.slice(0, 120) + '...',
      content: newsContent.trim(),
      thumbnailUrl:
        newsThumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&auto=format&fit=crop&q=80',
      readTime: newsReadTime.trim() || '3 Menit',
      createdAt: editingNewsId
        ? (news.find((n) => n.id === editingNewsId)?.createdAt || Date.now())
        : Date.now(),
    };

    onSaveNews(article);
    setIsNewsModalOpen(false);
    setFeedback(`Warta berita "${article.title}" berhasil dirilis! Tampil di posisi pertama etalase publik dan menggeser rilis sebelumnya.`);
    setTimeout(() => setFeedback(null), 4500);
  };

  // Urutkan karya & berita agar item terbaru selalu muncul di urutan pertama (menggeser unggahan sebelumnya)
  const sortedWorks = [...works].sort((a, b) => {
    const timeA = a.createdAt || (a.year ? new Date(`${a.year}-01-01`).getTime() : 0);
    const timeB = b.createdAt || (b.year ? new Date(`${b.year}-01-01`).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    return (b.year || 0) - (a.year || 0);
  });

  const sortedNews = [...news].sort((a, b) => {
    const timeA = a.createdAt || (a.publishDate ? new Date(a.publishDate).getTime() : 0);
    const timeB = b.createdAt || (b.publishDate ? new Date(b.publishDate).getTime() : 0);
    if (timeB !== timeA) return timeB - timeA;
    const dateA = new Date(a.publishDate).getTime() || 0;
    const dateB = new Date(b.publishDate).getTime() || 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>CONTENT MANAGEMENT SYSTEM</span>
            <span>•</span>
            <span className="text-[#E50914] font-bold">DIVISI MEDIA & INFORMASI</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            CMS Portal Website Publik
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Kelola etalase karya film mahasiswa dan siaran pers berita yang tampil langsung di website utama Cinemind.
          </p>
        </div>

        {/* Tab switcher buttons */}
        <div className="flex items-center space-x-2 p-1 bg-gray-100 rounded-[2px] border border-gray-300">
          <button
            onClick={() => setActiveTab('karya')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors ${
              activeTab === 'karya'
                ? 'bg-white text-gray-900 shadow-hard'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Karya Film ({works.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('berita')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-[2px] cursor-pointer transition-colors ${
              activeTab === 'berita'
                ? 'bg-white text-gray-900 shadow-hard'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5" />
            <span>Warta Berita ({news.length})</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-[2px] flex items-center space-x-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {/* TAB 1: KARYA FILM */}
      {activeTab === 'karya' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-600 font-semibold">
              Daftar Etalase Karya Video (Tampil di Website Publik)
            </span>
            <button
              onClick={() => {
                setEditingFilmId(null);
                setFilmTitle('');
                setFilmDirector('');
                setFilmProducer('');
                setFilmDop('');
                setFilmProductionHouse('Cinemind Film Lab');
                setFilmYear(2026);
                setFilmDuration('15 Menit');
                setFilmGenre('Drama');
                setFilmSynopsis('');
                setFilmEmbedUrl('https://www.youtube.com/embed/dQw4w9WgXcQ');
                setFilmThumbnailUrl('https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&auto=format&fit=crop&q=80');
                setFilmAwardsInput('');
                setIsFilmModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Unggah Karya Film Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedWorks.map((film, index) => (
              <div
                key={film.id}
                className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video bg-black overflow-hidden">
                    <img
                      src={film.thumbnailUrl}
                      alt={film.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 flex items-center space-x-1">
                      {index === 0 && (
                        <span className="bg-[#E50914] text-white font-mono text-[9px] px-1.5 py-0.5 rounded-[2px] font-bold">
                          POSISI 1 • TERBARU
                        </span>
                      )}
                      <div className="bg-black/80 text-white font-mono text-[10px] px-2 py-0.5 rounded-[2px]">
                        {film.year} • {film.duration}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-[#E50914] font-semibold">
                      <span>{film.genre}</span>
                      <span className="text-gray-500">Sutradara: {film.director}</span>
                    </div>

                    <h3 className="font-display text-lg font-bold uppercase text-gray-900 leading-snug">
                      {film.title}
                    </h3>

                    <div className="flex items-center space-x-1.5 text-[11px] font-mono text-gray-600">
                      <span className="font-semibold text-gray-500">PH:</span>
                      <span className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-800 font-medium">
                        {film.productionHouse || 'Cinemind Film Lab'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {film.synopsis}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    STATUS: TAYANG PUBLIK
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingFilmId(film.id);
                        setFilmTitle(film.title);
                        setFilmDirector(film.director);
                        setFilmProducer(film.producer || '');
                        setFilmDop(film.dop || '');
                        setFilmProductionHouse(film.productionHouse || 'Cinemind Film Lab');
                        setFilmYear(film.year);
                        setFilmDuration(film.duration);
                        setFilmGenre(film.genre);
                        setFilmSynopsis(film.synopsis);
                        setFilmEmbedUrl(film.embedUrl);
                        setFilmThumbnailUrl(film.thumbnailUrl);
                        setFilmAwardsInput(film.festivalAwards?.join(', ') || '');
                        setIsFilmModalOpen(true);
                      }}
                      className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-[2px] cursor-pointer"
                      title="Edit Karya"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget({
                          type: 'karya',
                          id: film.id,
                          name: film.title,
                        });
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-[2px] transition-colors cursor-pointer"
                      title="Hapus Karya"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WARTA & BERITA */}
      {activeTab === 'berita' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-gray-600 font-semibold">
              Daftar Warta Kegiatan & Siaran Pers Himpunan
            </span>
            <button
              onClick={() => {
                setEditingNewsId(null);
                setNewsTitle('');
                setNewsCategory('Warta Kegiatan');
                setNewsAuthor('Sarah Nabila (Medinfo)');
                setNewsPublishDate(new Date().toISOString().split('T')[0]);
                setNewsSummary('');
                setNewsContent('');
                setNewsThumbnailUrl('https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=900&auto=format&fit=crop&q=80');
                setNewsReadTime('3 Menit');
                setIsNewsModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tulis Rilis Berita Baru</span>
            </button>
          </div>

          <div className="divide-y divide-gray-200 bg-white border border-gray-200 rounded-[2px] shadow-hard">
            {sortedNews.map((item, index) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex space-x-4">
                  <img
                    src={item.thumbnailUrl}
                    alt={item.title}
                    className="w-24 h-20 sm:w-28 sm:h-20 object-cover rounded-[2px] shrink-0 border border-gray-200"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-500">
                      {index === 0 && (
                        <span className="px-2 py-0.5 bg-[#E50914] text-white font-bold rounded-[2px]">
                          POSISI 1 • TERBARU
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-800 font-bold rounded-[2px]">
                        {item.category}
                      </span>
                      <span>{formatDateIndonesian(item.publishDate)}</span>
                      <span>•</span>
                      <span>Penulis: {item.author}</span>
                    </div>

                    <h3 className="font-display text-base sm:text-lg font-bold uppercase text-gray-900 leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-xs text-gray-600 line-clamp-1">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => {
                      setEditingNewsId(item.id);
                      setNewsTitle(item.title);
                      setNewsCategory(item.category);
                      setNewsAuthor(item.author);
                      setNewsPublishDate(item.publishDate);
                      setNewsSummary(item.summary);
                      setNewsContent(item.content);
                      setNewsThumbnailUrl(item.thumbnailUrl);
                      setNewsReadTime(item.readTime);
                      setIsNewsModalOpen(true);
                    }}
                    className="p-1.5 hover:bg-gray-200 text-gray-700 rounded-[2px] cursor-pointer"
                    title="Edit Berita"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget({
                        type: 'berita',
                        id: item.id,
                        name: item.title,
                      });
                    }}
                    className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-[2px] transition-colors cursor-pointer"
                    title="Hapus Berita"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL FORM KARYA FILM */}
      {isFilmModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsFilmModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-[2px] max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-gray-300 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-display text-xl font-bold uppercase text-gray-900">
                {editingFilmId ? 'Edit Karya Film' : 'Unggah Karya Film ke Website Publik'}
              </h3>
              <button
                onClick={() => setIsFilmModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {filmFormError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center space-x-2 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{filmFormError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitFilm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Judul Film *
                  </label>
                  <input
                    type="text"
                    value={filmTitle}
                    onChange={(e) => setFilmTitle(e.target.value)}
                    placeholder="Contoh: Garis Resah"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px] font-semibold text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Sutradara *
                  </label>
                  <input
                    type="text"
                    value={filmDirector}
                    onChange={(e) => setFilmDirector(e.target.value)}
                    placeholder="Contoh: Farhan Alfarizi"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Tahun Produksi
                  </label>
                  <input
                    type="number"
                    value={filmYear}
                    onChange={(e) => setFilmYear(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Durasi
                  </label>
                  <input
                    type="text"
                    value={filmDuration}
                    onChange={(e) => setFilmDuration(e.target.value)}
                    placeholder="18 Menit"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Genre Film
                  </label>
                  <input
                    type="text"
                    value={filmGenre}
                    onChange={(e) => setFilmGenre(e.target.value)}
                    placeholder="Drama / Fiksi"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Produser (Opsional)
                  </label>
                  <input
                    type="text"
                    value={filmProducer}
                    onChange={(e) => setFilmProducer(e.target.value)}
                    placeholder="Nama Produser"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Sinematografer (DOP)
                  </label>
                  <input
                    type="text"
                    value={filmDop}
                    onChange={(e) => setFilmDop(e.target.value)}
                    placeholder="Nama DOP"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Production House / PH
                  </label>
                  <input
                    type="text"
                    value={filmProductionHouse}
                    onChange={(e) => setFilmProductionHouse(e.target.value)}
                    placeholder="Contoh: Cinemind Film Lab"
                    className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                  />
                </div>
              </div>
              <p className="text-[10px] text-gray-500 font-mono -mt-2">
                * Production House dapat diisi manual secara bebas (misal: Cinemind Film Lab, Kine Club, Studio Sinema, dll).
              </p>

              {/* YouTube Embed Validation per PRD */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Link Embed Video / YouTube *
                </label>
                <input
                  type="text"
                  value={filmEmbedUrl}
                  onChange={(e) => {
                    setFilmEmbedUrl(e.target.value);
                    setEmbedUrlError(null);
                  }}
                  placeholder="https://www.youtube.com/embed/VIDEO_ID atau tag <iframe>"
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px] font-mono text-[11px]"
                  required
                />
                <p className="text-[10px] text-gray-500 mt-1 font-mono">
                  Sistem otomatis mengubah link YouTube menjadi format <code>youtube-nocookie.com/embed/...</code> demi layout yang responsif.
                </p>
                {embedUrlError && (
                  <p className="text-[11px] text-red-600 font-mono mt-1 font-bold">
                    {embedUrlError}
                  </p>
                )}
              </div>

              {/* Thumbnail 16:9 */}
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  URL Thumbnail 16:9 / Upload Gambar (Maks 2MB)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={filmThumbnailUrl}
                    onChange={(e) => setFilmThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white border border-gray-300 px-3 py-2 rounded-[2px] font-mono text-[11px]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[2px] cursor-pointer flex items-center space-x-1 shrink-0 font-mono text-[11px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload &lt;2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageCompressionUpload(e, 'film')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Sinopsis Karya *
                </label>
                <textarea
                  rows={4}
                  value={filmSynopsis}
                  onChange={(e) => setFilmSynopsis(e.target.value)}
                  placeholder="Sinopsis film..."
                  className="w-full bg-white border border-gray-300 p-2.5 rounded-[2px]"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Prestasi / Penghargaan Festival (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={filmAwardsInput}
                  onChange={(e) => setFilmAwardsInput(e.target.value)}
                  placeholder="Official Selection FFMN 2026, Best Cinematography"
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px]"
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsFilmModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-[2px] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E50914] hover:bg-[#b91c1c] text-white font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red cursor-pointer"
                >
                  Simpan & Rilis ke Publik
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM WARTA BERITA */}
      {isNewsModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsNewsModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-[2px] max-w-2xl w-full my-auto overflow-hidden shadow-2xl border border-gray-300 p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-display text-xl font-bold uppercase text-gray-900">
                {editingNewsId ? 'Edit Warta Berita' : 'Tulis Rilis Berita Pers Baru'}
              </h3>
              <button
                onClick={() => setIsNewsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newsFormError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center space-x-2 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{newsFormError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitNews} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Judul Warta / Siaran Pers *
                </label>
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Contoh: Workshop Sinematografi Sukses Digelar"
                  className="w-full bg-white border border-gray-300 px-3 py-2 rounded-[2px] font-semibold text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Kategori
                  </label>
                  <select
                    value={newsCategory}
                    onChange={(e) => setNewsCategory(e.target.value as NewsArticle['category'])}
                    className="w-full bg-white border border-gray-300 px-2 py-2 rounded-[2px]"
                  >
                    <option value="Warta Kegiatan">Warta Kegiatan</option>
                    <option value="Workshop & Sinema">Workshop & Sinema</option>
                    <option value="Rilis Karya">Rilis Karya</option>
                    <option value="Festival">Festival</option>
                    <option value="Pengumuman">Pengumuman</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Tanggal Rilis
                  </label>
                  <input
                    type="date"
                    value={newsPublishDate}
                    onChange={(e) => setNewsPublishDate(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Penulis
                  </label>
                  <input
                    type="text"
                    value={newsAuthor}
                    onChange={(e) => setNewsAuthor(e.target.value)}
                    className="w-full bg-white border border-gray-300 px-2 py-1.5 rounded-[2px]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Ringkasan Singkat (Lead Paragraph)
                </label>
                <textarea
                  rows={2}
                  value={newsSummary}
                  onChange={(e) => setNewsSummary(e.target.value)}
                  placeholder="Ringkasan 1-2 kalimat untuk preview listicle..."
                  className="w-full bg-white border border-gray-300 p-2 rounded-[2px]"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Isi Lengkap Berita *
                </label>
                <textarea
                  rows={7}
                  value={newsContent}
                  onChange={(e) => setNewsContent(e.target.value)}
                  placeholder="Tuliskan isi berita rilis lengkap di sini..."
                  className="w-full bg-white border border-gray-300 p-2.5 rounded-[2px] leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 uppercase mb-1 font-mono">
                  URL Thumbnail Gambar
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newsThumbnailUrl}
                    onChange={(e) => setNewsThumbnailUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1 bg-white border border-gray-300 px-3 py-2 rounded-[2px] font-mono text-[11px]"
                  />
                  <label className="px-3 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-[2px] cursor-pointer flex items-center space-x-1 shrink-0 font-mono text-[11px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload &lt;2MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageCompressionUpload(e, 'news')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold rounded-[2px] uppercase"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
                >
                  Publikasikan Berita
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Karya / Berita */}
      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        title={deleteTarget?.type === 'karya' ? 'Hapus Karya Film' : 'Hapus Warta Berita'}
        itemName={deleteTarget?.name}
        message={
          deleteTarget?.type === 'karya'
            ? `Apakah Anda yakin ingin menghapus karya "${deleteTarget?.name}" dari etalase website publik? Tindakan ini tidak dapat dibatalkan.`
            : `Apakah Anda yakin ingin menghapus warta berita "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`
        }
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'karya') {
              onDeleteWork(deleteTarget.id);
              setFeedback(`Karya "${deleteTarget.name}" berhasil dihapus dari sistem!`);
            } else {
              onDeleteNews(deleteTarget.id);
              setFeedback(`Warta berita "${deleteTarget.name}" berhasil dihapus dari sistem!`);
            }
            setTimeout(() => setFeedback(null), 4000);
            setDeleteTarget(null);
          }
        }}
        onClose={() => setDeleteTarget(null)}
      />

    </div>
  );
};
