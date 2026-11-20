import React, { useState } from 'react';
import { 
  CalendarClock, 
  CheckCircle2, 
  PlusCircle, 
  Trash2, 
  Filter, 
  Bell, 
  Sparkles,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import { FarmSchedule, LivestockCategory } from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface ScheduleModuleProps {
  schedules: FarmSchedule[];
  activeCategory: LivestockCategory;
  onToggleSchedule: (id: string) => void;
  onAddSchedule: (schedule: Omit<FarmSchedule, 'id'>) => void;
  onDeleteSchedule: (id: string) => void;
}

export const ScheduleModule: React.FC<ScheduleModuleProps> = ({
  schedules,
  activeCategory,
  onToggleSchedule,
  onAddSchedule,
  onDeleteSchedule,
}) => {
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<LivestockCategory | 'semua'>(activeCategory);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<LivestockCategory | 'semua'>(activeCategory);
  const [type, setType] = useState<FarmSchedule['type']>('pakan');
  const [time, setTime] = useState('08:00');
  const [frequency, setFrequency] = useState<FarmSchedule['frequency']>('harian');
  const [assignedTo, setAssignedTo] = useState('Pak Joko');
  const [notes, setNotes] = useState('');

  const filteredSchedules = schedules.filter((s) => {
    if (selectedFilterCategory === 'semua') return true;
    return s.category === selectedFilterCategory || s.category === 'semua';
  });

  const completedCount = filteredSchedules.filter((s) => s.isCompleted).length;
  const pendingCount = filteredSchedules.filter((s) => !s.isCompleted).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSchedule({
      title,
      category,
      type,
      time,
      frequency,
      assignedTo,
      isCompleted: false,
      notes,
    });
    setIsAddModalOpen(false);
    setTitle('');
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Jadwal & Kegiatan Peternakan</h2>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Spesifik Per Spesies
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Sistem membedakan jadwal pakan, vaksin, dan sanitasi sesuai kebutuhan biologis masing-masing ternak.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Commodity Filter */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Komoditas</option>
              {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                <option key={c} value={c}>{COMMODITY_INFO[c].name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setCategory(activeCategory);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Jadwal</span>
          </button>
        </div>
      </div>

      {/* Progress Counter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Total Kegiatan</span>
            <span className="text-2xl font-black text-slate-900 mt-0.5 block">{filteredSchedules.length}</span>
          </div>
          <CalendarClock className="w-8 h-8 text-slate-300" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Selesai Dikerjakan</span>
            <span className="text-2xl font-black text-emerald-700 mt-0.5 block">{completedCount}</span>
          </div>
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">Menunggu Eksekusi</span>
            <span className="text-2xl font-black text-amber-700 mt-0.5 block">{pendingCount}</span>
          </div>
          <Clock className="w-8 h-8 text-amber-400" />
        </div>
      </div>

      {/* Schedules List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <span className="font-bold text-sm text-slate-800">Daftar Jadwal & Checklist Harian</span>
          <span className="text-xs text-slate-400">Klik lingkaran untuk menandai tugas selesai</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredSchedules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tidak ada jadwal kegiatan untuk komoditas ini. Silakan buat jadwal baru.
            </div>
          ) : (
            filteredSchedules.map((item) => {
              const comm = item.category !== 'semua' ? COMMODITY_INFO[item.category] : null;

              return (
                <div
                  key={item.id}
                  className={`p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    item.isCompleted ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <button
                      onClick={() => onToggleSchedule(item.id)}
                      className={`mt-1 p-1 rounded-lg border transition-colors cursor-pointer ${
                        item.isCompleted
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white hover:border-emerald-500'
                      }`}
                      title="Tandai Selesai"
                    >
                      <CheckCircle2 className={`w-4 h-4 ${item.isCompleted ? 'text-white' : 'text-slate-300'}`} />
                    </button>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className={`text-sm sm:text-base font-bold ${
                          item.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'
                        }`}>
                          {item.title}
                        </h4>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                          {item.type}
                        </span>
                        {comm && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {comm.name}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {item.notes}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-emerald-700" />
                          {item.time} ({item.frequency})
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <User className="w-3.5 h-3.5" />
                          Petugas: {item.assignedTo}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => onDeleteSchedule(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Jadwal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL TAMBAH JADWAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Tambah Jadwal Kegiatan Ternak</h3>
            <p className="text-xs text-slate-500 mb-4">
              Buat jadwal terarah untuk pakan, vaksin, sanitasi, atau pemerahan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kegiatan</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Pemberian Vitamin Anti-Stres Siang"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Komoditas</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    <option value="semua">Semua Ternak</option>
                    {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                      <option key={c} value={c}>{COMMODITY_INFO[c].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori Tugas</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    <option value="pakan">Pemberian Pakan</option>
                    <option value="vaksin">Vaksin & Vitamin</option>
                    <option value="kebersihan">Kebersihan & Sanitasi</option>
                    <option value="timbang">Sampling Timbang</option>
                    <option value="pemerahan">Pemerahan Susu</option>
                    <option value="pemeriksaan">Pemeriksaan Harian</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Waktu Pelaksanaan</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Frekuensi</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    <option value="harian">Harian</option>
                    <option value="mingguan">Mingguan</option>
                    <option value="bulanan">Bulanan</option>
                    <option value="terjadwal">Satu Kali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Penanggung Jawab (Petugas)</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Contoh: Pak Joko / Rian"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instruksi & Catatan Detail</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Contoh: Campurkan 5 gram multivitamin ke 10 liter air galon pakan..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
