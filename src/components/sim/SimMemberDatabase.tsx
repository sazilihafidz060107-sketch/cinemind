import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Download, 
  X, 
  CheckCircle,
  AlertCircle,
  Filter,
  UserCheck
} from 'lucide-react';
import { Member } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface SimMemberDatabaseProps {
  members: Member[];
  onSaveMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
}

export const SimMemberDatabase: React.FC<SimMemberDatabaseProps> = ({
  members,
  onSaveMember,
  onDeleteMember,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [divisionFilter, setDivisionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nim, setNim] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [batch, setBatch] = useState<string>('2024');
  const [division, setDivision] = useState<Member['division']>('Produksi Film');
  const [status, setStatus] = useState<Member['status']>('Aktif');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState<Member | null>(null);

  const divisionsList: Member['division'][] = [
    'BPH',
    'Media & Informasi',
    'Produksi Film',
    'Pengembangan SDM',
    'Hubungan Eksternal',
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setNim('');
    setName('');
    setBatch('2025');
    setDivision('Produksi Film');
    setStatus('Aktif');
    setPhone('');
    setEmail('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Member) => {
    setEditingId(m.id);
    setNim(m.nim);
    setName(m.name);
    setBatch(m.batch);
    setDivision(m.division);
    setStatus(m.status);
    setPhone(m.phone || '');
    setEmail(m.email || '');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!nim.trim() || !name.trim()) {
      setFormError('NIM dan Nama Lengkap anggota wajib diisi.');
      return;
    }

    const member: Member = {
      id: editingId || `m-${Date.now()}`,
      nim: nim.trim(),
      name: name.trim(),
      batch,
      division,
      status,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
    };

    onSaveMember(member);
    setIsModalOpen(false);
    setFeedbackMsg(editingId ? `Data anggota "${member.name}" berhasil diperbarui!` : `Anggota baru "${member.name}" (${member.nim}) berhasil ditambahkan!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const filteredMembers = members.filter((m) => {
    const matchDiv = divisionFilter === 'all' || m.division === divisionFilter;
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.email && m.email.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchDiv && matchStatus && matchSearch;
  });

  const handleExportCSV = () => {
    const headers = ['NIM', 'Nama Lengkap', 'Angkatan', 'Divisi', 'Status', 'Kontak WhatsApp', 'Email'];
    const rows = filteredMembers.map((m) => [
      `"${m.nim}"`,
      `"${m.name.replace(/"/g, '""')}"`,
      m.batch,
      `"${m.division}"`,
      m.status,
      m.phone || '-',
      m.email || '-',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DATABASE_ANGGOTA_CINEMIND_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white border border-gray-200 p-6 rounded-[2px] shadow-hard flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-gray-500 mb-1">
            <span>DATABASE KEANGGOTAAN</span>
            <span>•</span>
            <span className="text-blue-600 font-bold">KADERISASI & SDM</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-gray-900 tracking-tight">
            Data Anggota Himpunan Cinemind
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 font-body mt-1">
            Basis data terpusat anggota aktif, jajaran kepengurusan kabinet, dan anggota magang sinematografi.
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
            onClick={handleOpenAdd}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Anggota</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {feedbackMsg && (
        <div 
          role="status" 
          aria-live="polite"
          className="p-3.5 bg-blue-50 border border-blue-300 text-blue-900 text-xs font-medium rounded-[2px] flex items-center justify-between shadow-sm animate-in fade-in"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
          <button 
            onClick={() => setFeedbackMsg(null)}
            className="text-blue-700 hover:text-blue-950 p-1 cursor-pointer"
            title="Tutup pemberitahuan"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 p-4 rounded-[2px] shadow-hard flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari NIM atau nama anggota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-300 focus:border-blue-600 text-gray-900 text-xs pl-9 pr-3 py-2 rounded-[2px] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <select
            value={divisionFilter}
            onChange={(e) => setDivisionFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none"
          >
            <option value="all">Semua Divisi</option>
            {divisionsList.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-800 text-xs px-2.5 py-1.5 rounded-[2px] focus:outline-none"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Magang">Magang</option>
            <option value="Demisioner">Demisioner</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-[2px] shadow-hard overflow-hidden">
        {filteredMembers.length === 0 ? (
          <div className="p-16 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3 stroke-[1.5]" />
            <h3 className="text-sm font-semibold text-gray-900">Tidak ada anggota yang cocok.</h3>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Sesuaikan kata kunci pencarian atau filter divisi di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-mono uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">NIM</th>
                  <th className="py-3 px-4">Nama Lengkap</th>
                  <th className="py-3 px-3">Angkatan</th>
                  <th className="py-3 px-4">Divisi / Departemen</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-4">Kontak / Email</th>
                  <th className="py-3 px-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-body">
                {filteredMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    
                    <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      {m.nim}
                    </td>

                    <td className="py-3 px-4 font-semibold text-gray-900">
                      {m.name}
                    </td>

                    <td className="py-3 px-3 font-mono text-gray-700">
                      {m.batch}
                    </td>

                    <td className="py-3 px-4 text-gray-800">
                      <span className="font-medium">{m.division}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-[2px] uppercase ${
                        m.status === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : m.status === 'Magang'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        {m.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      <div>{m.phone || '-'}</div>
                      <div className="text-gray-400">{m.email || ''}</div>
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center space-x-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          title="Edit Anggota"
                          className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-[2px] transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetMember(m)}
                          title="Hapus Anggota"
                          className="p-1.5 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-[2px] transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Add / Edit Member */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative bg-white rounded-[2px] max-w-lg w-full my-auto overflow-hidden shadow-2xl border border-gray-300 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="font-display text-xl font-bold uppercase text-gray-900">
                {editingId ? 'Edit Data Anggota' : 'Tambah Anggota Himpunan Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-300 rounded-[2px] flex items-center space-x-2 text-rose-800 text-xs font-medium">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    NIM Mahasiswa *
                  </label>
                  <input
                    type="text"
                    value={nim}
                    onChange={(e) => setNim(e.target.value)}
                    placeholder="Contoh: 241150091"
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px] font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Angkatan *
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="Contoh: 2024"
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px] font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Daffa Nugraha"
                  className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px] font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Divisi *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value as Member['division'])}
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px]"
                  >
                    {divisionsList.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Status Keanggotaan *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Member['status'])}
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px]"
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Magang">Magang</option>
                    <option value="Demisioner">Demisioner</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxxx"
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase mb-1 font-mono">
                    Email Mahasiswa
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@cinemind.org"
                    className="w-full bg-white border border-gray-300 text-xs px-3 py-2 rounded-[2px]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-[2px] uppercase cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold uppercase tracking-wider rounded-[2px] shadow-hard cursor-pointer"
                >
                  Simpan Data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus Anggota */}
      <DeleteConfirmModal
        isOpen={!!deleteTargetMember}
        title="Hapus Data Anggota Organisasi"
        itemName={deleteTargetMember ? `${deleteTargetMember.name} (${deleteTargetMember.nim})` : undefined}
        message={
          deleteTargetMember
            ? `Apakah Anda yakin ingin menghapus data anggota ${deleteTargetMember.name} (NIM ${deleteTargetMember.nim}, Divisi ${deleteTargetMember.division})? Tindakan ini akan menghapus data dari basis data himpunan.`
            : undefined
        }
        onConfirm={() => {
          if (deleteTargetMember) {
            onDeleteMember(deleteTargetMember.id);
            setFeedbackMsg(`Data anggota ${deleteTargetMember.name} berhasil dihapus!`);
            setTimeout(() => setFeedbackMsg(null), 4000);
            setDeleteTargetMember(null);
          }
        }}
        onClose={() => setDeleteTargetMember(null)}
      />

    </div>
  );
};
