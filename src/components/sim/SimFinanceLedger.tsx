import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Download, 
  Trash2, 
  Edit3, 
  X, 
  CheckCircle, 
  AlertCircle,
  Vault,
  Calendar,
  Filter
} from 'lucide-react';
import { FinanceTransaction } from '../../types';
import { formatDateIndonesian } from '../../utils/pdfGenerator';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SimFinanceLedgerProps {
  finances: FinanceTransaction[];
  balanceData: { totalIn: number; totalOut: number; currentBalance: number };
  onSaveFinance: (tx: FinanceTransaction) => void;
  onDeleteFinance: (id: string) => void;
}

export const SimFinanceLedger: React.FC<SimFinanceLedgerProps> = ({
  finances,
  balanceData,
  onSaveFinance,
  onDeleteFinance,
}) => {
  const today = new Date().toISOString().split('T')[0];

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Form states for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState<string>(today);
  const [type, setType] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Iuran Wajib Pengurus');
  const [description, setDescription] = useState<string>('');
  const [receiptNote, setReceiptNote] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteTargetTx, setDeleteTargetTx] = useState<FinanceTransaction | null>(null);

  const categories = [
    'Saldo Awal & Hibah Organisasi',
    'Iuran Wajib Pengurus',
    'Danus & Merchandise',
    'Sponsorship & Donatur',
    'Produksi & Sewa Alat',
    'Logistik & Peralatan',
    'Konsumsi & Rapat',
    'Festival & Distribusi',
    'Biaya Administrasi & Kesekretariatan',
    'Lain-lain',
  ];

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleOpenNewForm = () => {
    setEditingId(null);
    setTransactionDate(today);
    setType('in');
    setAmount('');
    setCategory('Iuran Wajib Pengurus');
    setDescription('');
    setReceiptNote('');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (tx: FinanceTransaction) => {
    setEditingId(tx.id);
    setTransactionDate(tx.transactionDate);
    setType(tx.type);
    setAmount(tx.amount.toString());
    setCategory(tx.category);
    setDescription(tx.description);
    setReceiptNote(tx.receiptNote || '');
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Nominal transaksi harus berupa angka positif lebih dari 0.');
      return;
    }

    if (!description.trim()) {
      setFormError('Keterangan transaksi wajib diisi secara rinci.');
      return;
    }

    const tx: FinanceTransaction = {
      id: editingId || `fin-${Date.now()}`,
      transactionDate,
      type,
      amount: numAmount,
      category,
      description: description.trim(),
      recordedBy: 'Rian Pratama (Bendahara)',
      receiptNote: receiptNote.trim() || undefined,
    };

    onSaveFinance(tx);
    setIsFormOpen(false);
    setFeedbackMsg(editingId ? `Transaksi #${tx.id.slice(-4)} berhasil diperbarui!` : `Transaksi kas baru (${formatCurrency(tx.amount)}) berhasil dibukukan!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  // Calculate Running Balance for each row in chronological order
  // Sort oldest first for calculating running balance
  const sortedChronological = [...finances].sort(
    (a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
  );

  let runningTotal = 0;
  const runningBalanceMap = new Map<string, number>();
  for (const t of sortedChronological) {
    if (t.type === 'in') {
      runningTotal += t.amount;
    } else {
      runningTotal -= t.amount;
    }
    runningBalanceMap.set(t.id, runningTotal);
  }

  // Display newest first in table
  const displayedTransactions = [...finances]
    .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
    .filter((tx) => {
      const matchType = filterType === 'all' || tx.type === filterType;
      const matchCat = filterCategory === 'all' || tx.category === filterCategory;
      const matchSearch =
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchCat && matchSearch;
    });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal (IDR)', 'Saldo Berjalan (IDR)'];
    const rows = displayedTransactions.map((t) => [
      t.id,
      t.transactionDate,
      t.type === 'in' ? 'Debit (Masuk)' : 'Kredit (Keluar)',
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.amount,
      runningBalanceMap.get(t.id) || 0,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BUKU_KAS_CINEMIND_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Balance Cards */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>BUKU BESAR KEUANGAN</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">KAS DIGITAL ORGANISASI</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Pencatatan Kas & Running Balance
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Kalkulasi saldo kas otomatis dengan transparansi aliran kas masuk dan keluar secara real-time.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold uppercase tracking-wider rounded-[2px] border border-gray-300 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenNewForm}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Transaksi Kas</span>
          </button>
        </div>
      </div>

      {/* Saldo Summary Box with aria-live="polite" per PRD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Total Saldo Akhir */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard border-l-4 border-l-emerald-600">
          <span className="text-[11px] font-mono uppercase text-gray-500 font-semibold block mb-1">
            Saldo Kas Akhir (Running Balance)
          </span>
          <div 
            className="font-display text-3xl font-bold text-gray-900 tracking-tight"
            aria-live="polite"
            id="current-balance-display"
          >
            {formatCurrency(balanceData.currentBalance)}
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-2">
            Terhitung dari {finances.length} transaksi pembukuan
          </p>
        </div>

        {/* Total Pemasukan (Debit) */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard border-l-4 border-l-blue-600">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-gray-500 font-semibold mb-1">
            <span>Total Penerimaan (Debit)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-display text-2xl font-bold text-emerald-700 tracking-tight">
            +{formatCurrency(balanceData.totalIn)}
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-2">
            Iuran, Danus, Sponsorship, & Hibah
          </p>
        </div>

        {/* Total Pengeluaran (Kredit) */}
        <div className="bg-white border border-gray-200 p-5 rounded-[2px] shadow-hard border-l-4 border-l-rose-600">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-gray-500 font-semibold mb-1">
            <span>Total Pengeluaran (Kredit)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="font-display text-2xl font-bold text-rose-700 tracking-tight">
            -{formatCurrency(balanceData.totalOut)}
          </div>
          <p className="text-[11px] text-gray-500 font-mono mt-2">
            Produksi, Konsumsi, Sewa, & Logistik
          </p>
        </div>

      </div>

      {/* Success feedback alert */}
      {feedbackMsg && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium rounded-[2px] flex items-center justify-between animate-in fade-in shadow-sm"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dedicated Full Page / Inline Input Form when opened */}
      {isFormOpen && (
        <div className="bg-white border-2 border-emerald-600 p-6 rounded-[2px] shadow-hard animate-in fade-in space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-200">
            <h2 className="font-display text-xl font-bold uppercase text-gray-900 tracking-tight flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              <span>{editingId ? 'Edit Entri Transaksi Kas' : 'Form Catat Transaksi Kas Baru'}</span>
            </h2>
            <button
              onClick={() => setIsFormOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center space-x-2 text-rose-800 text-xs font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Jenis Transaksi *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('in')}
                    className={`py-2 text-xs font-bold uppercase rounded-[2px] border cursor-pointer ${
                      type === 'in'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-hard'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Debit (Masuk)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('out')}
                    className={`py-2 text-xs font-bold uppercase rounded-[2px] border cursor-pointer ${
                      type === 'out'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-hard'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Kredit (Keluar)
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-1 font-body">
                  {type === 'in' 
                    ? 'Kas bertambah (iuran, sponsor, penjualan tiket/merch)' 
                    : 'Kas berkurang (sewa alat syuting, konsumsi, festival)'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Tanggal Transaksi *
                </label>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs px-3 py-2 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Nominal (IDR) *
                </label>
                <input
                  type="number"
                  placeholder="Contoh: 350000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs px-3 py-2 rounded-[2px] font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Kategori Kas *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Nomor Bukti / Kuitansi / Struk (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Struk Tokopedia #INV-881 atau Nota Bu Siti"
                  value={receiptNote}
                  onChange={(e) => setReceiptNote(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs px-3 py-2 rounded-[2px] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                Keterangan / Rincian Pengeluaran/Pemasukan *
              </label>
              <input
                type="text"
                placeholder="Contoh: Pembelian baterai Sony NP-F970 untuk syuting film pendek"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs px-3 py-2.5 rounded-[2px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                required
              />
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-[2px] uppercase cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
              >
                {editingId ? 'Simpan Perubahan' : 'Catat ke Buku Kas'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari transaksi atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-emerald-600 text-gray-900 text-xs pl-9 pr-3 py-2 rounded-[2px] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none"
          >
            <option value="all">Semua Tipe (Debit & Kredit)</option>
            <option value="in">Debit (Pemasukan Sahaja)</option>
            <option value="out">Kredit (Pengeluaran Sahaja)</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none max-w-[200px]"
          >
            <option value="all">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Running Balance Ledger Table */}
      <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
        {displayedTransactions.length === 0 ? (
          /* Empty state thin vector per PRD */
          <div className="p-16 text-center">
            <Vault className="w-12 h-12 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-semibold text-gray-900">Belum ada transaksi kas bulan ini.</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Klik &apos;Tambah Transaksi&apos; untuk memulai pencatatan kas masuk atau keluar organisasi.
            </p>
            <button
              onClick={handleOpenNewForm}
              className="mt-4 px-4 py-2 bg-emerald-700 text-white text-xs font-semibold rounded-[2px] uppercase cursor-pointer"
            >
              Tambah Transaksi Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3 px-3">Tipe</th>
                  <th className="py-3 px-4">Kategori Kas</th>
                  <th className="py-3 px-4">Keterangan / Rincian</th>
                  <th className="py-3 px-4 text-right">Debit (Masuk)</th>
                  <th className="py-3 px-4 text-right">Kredit (Keluar)</th>
                  <th className="py-3 px-4 text-right">Saldo Berjalan</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-body">
                {displayedTransactions.map((tx) => {
                  const runningAtRow = runningBalanceMap.get(tx.id) || 0;
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="py-3 px-4 font-mono text-gray-700 whitespace-nowrap">
                        {formatDateIndonesian(tx.transactionDate)}
                      </td>

                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] uppercase ${
                          tx.type === 'in'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {tx.type === 'in' ? 'Debit' : 'Kredit'}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-gray-600 text-[11px] whitespace-nowrap">
                        {tx.category}
                      </td>

                      <td className="py-3 px-4 text-gray-900 font-medium">
                        <div>{tx.description}</div>
                        {tx.receiptNote && (
                          <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                            Bukti: {tx.receiptNote}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                        {tx.type === 'in' ? formatCurrency(tx.amount) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-semibold text-rose-700 whitespace-nowrap">
                        {tx.type === 'out' ? formatCurrency(tx.amount) : '-'}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(runningAtRow)}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1">
                          <button
                            onClick={() => handleOpenEditForm(tx)}
                            title="Edit Transaksi"
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-[2px] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTargetTx(tx)}
                            title="Hapus Transaksi"
                            className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-[2px] transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus Transaksi Keuangan */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetTx}
        title="Hapus Catatan Transaksi Keuangan"
        itemName={deleteTargetTx?.description}
        message={
          deleteTargetTx
            ? `Apakah Anda yakin ingin menghapus catatan transaksi "${deleteTargetTx.description}" (${deleteTargetTx.type === 'in' ? 'Pemasukan' : 'Pengeluaran'} senilai ${formatCurrency(deleteTargetTx.amount)})? Buku kas dan neraca saldo akan diperbarui secara otomatis.`
            : undefined
        }
        onConfirm={() => {
          if (deleteTargetTx) {
            onDeleteFinance(deleteTargetTx.id);
            setFeedbackMsg(`Transaksi "${deleteTargetTx.description}" berhasil dihapus dari pembukuan!`);
            setTimeout(() => setFeedbackMsg(null), 4000);
            setDeleteTargetTx(null);
          }
        }}
        onClose={() => setDeleteTargetTx(null)}
      />

    </div>
  );
};
