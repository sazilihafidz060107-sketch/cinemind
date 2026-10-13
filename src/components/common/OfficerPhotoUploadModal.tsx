import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { Officer } from '../../types';

interface OfficerPhotoUploadModalProps {
  officer: Officer | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (officerId: string, newAvatarUrl: string) => void;
  defaultTemplateAvatar?: string;
}

export const OfficerPhotoUploadModal: React.FC<OfficerPhotoUploadModalProps> = ({
  officer,
  isOpen,
  onClose,
  onSaveAvatar,
  defaultTemplateAvatar,
}) => {
  const fallbackAvatar =
    defaultTemplateAvatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';

  const [previewUrl, setPreviewUrl] = useState<string>(
    officer?.avatar || fallbackAvatar
  );
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (officer) {
      setPreviewUrl(officer.avatar || fallbackAvatar);
      setErrorMsg(null);
    }
  }, [officer, fallbackAvatar]);

  if (!isOpen || !officer) return null;

  // Resize and compress image client-side to ensure compact base64 size (< 80KB)
  const processImageFile = (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Format file tidak didukung! Harap unggah berkas gambar (JPG, PNG, atau WEBP).');
      setIsProcessing(false);
      return;
    }

    // Max 10MB raw file input
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Ukuran file terlalu besar! Harap pilih gambar dengan ukuran di bawah 10MB.');
      setIsProcessing(false);
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorMsg('Gagal membaca berkas gambar. Silakan coba lagi.');
      setIsProcessing(false);
    };

    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => {
        setErrorMsg('Gagal memproses gambar. Pastikan format berkas valid.');
        setIsProcessing(false);
      };

      img.onload = () => {
        // Create canvas to crop/resize into square avatar (max 480x480)
        const canvas = document.createElement('canvas');
        const maxSize = 480;
        let width = img.width;
        let height = img.height;

        // Calculate aspect fit/crop square
        const minDim = Math.min(width, height);
        const sourceX = (width - minDim) / 2;
        const sourceY = (height - minDim) / 2;

        canvas.width = Math.min(maxSize, minDim);
        canvas.height = Math.min(maxSize, minDim);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setErrorMsg('Browser tidak mendukung kompresi kanvas grafis.');
          setIsProcessing(false);
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          minDim,
          minDim,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert to optimized JPEG data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewUrl(compressedDataUrl);
        setIsProcessing(false);
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setErrorMsg('Harap masukkan tautan URL gambar yang valid.');
      return;
    }
    setErrorMsg(null);
    setPreviewUrl(urlInput.trim());
  };

  const handleResetToTemplate = () => {
    const fallback =
      defaultTemplateAvatar ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
    setPreviewUrl(fallback);
    setErrorMsg(null);
  };

  const handleSave = () => {
    if (!previewUrl) {
      setErrorMsg('Foto belum ditentukan!');
      return;
    }
    onSaveAvatar(officer.id, previewUrl);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-gray-300 rounded-[2px] shadow-2xl max-w-lg w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-[2px] bg-[#E50914] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold uppercase tracking-wider">
                Unggah & Ubah Foto Pengurus
              </h3>
              <p className="text-[11px] text-gray-400 font-mono -mt-0.5">
                {officer.roleTitle} • {officer.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-xs transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar Comparison Preview */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-gray-50 border border-gray-200 rounded-[2px]">
            {/* Foto Saat Ini */}
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-gray-500 font-semibold block mb-2">
                Foto Awal / Saat Ini
              </span>
              <div className="w-24 h-24 rounded-[2px] overflow-hidden border-2 border-gray-300 bg-black mx-auto shadow-xs">
                <img
                  src={officer.avatar}
                  alt={officer.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="hidden sm:block text-gray-400 font-bold">➔</div>

            {/* Foto Baru (Preview) */}
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase text-[#E50914] font-bold block mb-2">
                Foto Baru (Pratinjau)
              </span>
              <div className="relative w-24 h-24 rounded-[2px] overflow-hidden border-2 border-[#E50914] bg-black mx-auto shadow-md">
                <img
                  src={previewUrl}
                  alt="Preview Foto Baru"
                  className="w-full h-full object-cover"
                />
                {isProcessing && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-[10px] font-mono">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center space-x-2 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="space-y-3">
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'upload'
                    ? 'border-[#E50914] text-[#E50914]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Pilih Dari Perangkat</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 cursor-pointer transition-colors ${
                  activeTab === 'url'
                    ? 'border-[#E50914] text-[#E50914]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Tautan URL Foto</span>
              </button>
            </div>

            {/* TAB 1: File Upload */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 hover:border-[#E50914] bg-gray-50 hover:bg-red-50/30 rounded-[2px] p-6 text-center cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-[#E50914] flex items-center justify-center mx-auto mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-gray-900">
                    Klik untuk memilih foto dari galeri / komputer
                  </p>
                  <p className="text-[11px] text-gray-500 font-mono mt-1">
                    Mendukung format JPG, PNG, atau WEBP. Foto otomatis disesuaikan secara proporsional.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: URL Input */}
            {activeTab === 'url' && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase">
                  Tautan / URL Gambar Online:
                </label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    placeholder="https://example.com/foto-pengurus.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 bg-white border border-gray-300 focus:border-[#E50914] text-xs px-3 py-2 rounded-[2px] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] cursor-pointer"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset button */}
          <div className="pt-2 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleResetToTemplate}
              className="text-gray-500 hover:text-gray-900 font-mono flex items-center space-x-1 underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Kembalikan ke Foto Contoh Bawaan</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-xs font-semibold uppercase tracking-wider rounded-[2px] transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isProcessing}
            className="flex items-center space-x-1.5 px-5 py-2 bg-[#E50914] hover:bg-[#b91c1c] text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard-red transition-colors cursor-pointer disabled:opacity-50"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Simpan & Terapkan Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
