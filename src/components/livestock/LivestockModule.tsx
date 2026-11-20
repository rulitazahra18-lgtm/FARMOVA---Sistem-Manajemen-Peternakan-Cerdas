import React, { useState } from 'react';
import { 
  ShieldCheck, 
  PlusCircle, 
  AlertTriangle, 
  Building2, 
  Activity, 
  ArrowRightLeft, 
  Skull, 
  Layers,
  Sparkles,
  Calendar
} from 'lucide-react';
import { 
  Barn, 
  LivestockGroup, 
  LivestockCategory 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface LivestockModuleProps {
  barns: Barn[];
  livestockGroups: LivestockGroup[];
  activeCategory: LivestockCategory;
  onAddGroup: (group: Omit<LivestockGroup, 'id'>) => void;
  onRecordMortality: (groupId: string, count: number, reason: string) => void;
  onAddBarn: (barn: Omit<Barn, 'id'>) => void;
}

export const LivestockModule: React.FC<LivestockModuleProps> = ({
  barns,
  livestockGroups,
  activeCategory,
  onAddGroup,
  onRecordMortality,
  onAddBarn,
}) => {
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [isAddBarnOpen, setIsAddBarnOpen] = useState(false);
  const [isMortalityOpen, setIsMortalityOpen] = useState(false);
  const [selectedGroupForMortality, setSelectedGroupForMortality] = useState<string>('');
  const [mortalityCountInput, setMortalityCountInput] = useState<number>(1);
  const [mortalityReasonInput, setMortalityReasonInput] = useState<string>('Gejala panas berlebih (heat stress)');

  // Form New Group
  const [groupName, setGroupName] = useState('');
  const [groupCategory, setGroupCategory] = useState<LivestockCategory>(activeCategory);
  const [groupBarnId, setGroupBarnId] = useState('');
  const [groupCount, setGroupCount] = useState<number>(500);
  const [groupAge, setGroupAge] = useState<string>('24 Minggu');
  const [groupPhase, setGroupPhase] = useState<LivestockGroup['phase']>('layer');
  const [groupAvgWeight, setGroupAvgWeight] = useState<number>(1.85);
  const [groupNotes, setGroupNotes] = useState('');

  // Form New Barn
  const [barnName, setBarnName] = useState('');
  const [barnCategory, setBarnCategory] = useState<LivestockCategory>(activeCategory);
  const [barnCapacity, setBarnCapacity] = useState<number>(1000);

  const filteredBarns = barns.filter((b) => b.category === activeCategory);
  const filteredGroups = livestockGroups.filter((g) => g.category === activeCategory);

  const totalLivestock = filteredGroups.reduce((acc, g) => acc + g.currentCount, 0);
  const totalDead = filteredGroups.reduce((acc, g) => acc + g.mortalityCount, 0);
  const survivalRate = totalLivestock + totalDead > 0 
    ? Math.round(((totalLivestock) / (totalLivestock + totalDead)) * 1000) / 10 
    : 100;

  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    onAddGroup({
      name: groupName || `Batch ${COMMODITY_INFO[groupCategory]?.name} Baru`,
      category: groupCategory,
      barnId: groupBarnId || filteredBarns[0]?.id || 'barn-01',
      initialCount: groupCount,
      currentCount: groupCount,
      mortalityCount: 0,
      arrivalDate: new Date().toISOString().split('T')[0],
      currentAgeWeeksOrMonths: groupAge,
      phase: groupPhase,
      averageWeightKg: groupAvgWeight,
      healthStatus: 'sehat',
      notes: groupNotes,
    });
    setIsAddGroupOpen(false);
    setGroupName('');
  };

  const handleSaveBarn = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBarn({
      name: barnName || 'Kandang Baru',
      category: barnCategory,
      capacity: barnCapacity,
      currentCount: 0,
      temperatureC: 27.0,
      humidityPct: 70,
      status: 'optimal',
    });
    setIsAddBarnOpen(false);
    setBarnName('');
  };

  const handleSaveMortality = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupForMortality) return;
    onRecordMortality(selectedGroupForMortality, mortalityCountInput, mortalityReasonInput);
    setIsMortalityOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header and Summary Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengelolaan Ternak & Kandang</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pantau sebaran populasi, kelompok umur, mutasi, dan riwayat mortalitas ternak aktif.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedGroupForMortality(filteredGroups[0]?.id || '');
              setIsMortalityOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Skull className="w-4 h-4 text-rose-600" />
            <span>Catat Kematian / Afkir</span>
          </button>

          <button
            onClick={() => setIsAddBarnOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-slate-600" />
            <span>Tambah Kandang</span>
          </button>

          <button
            onClick={() => setIsAddGroupOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Batch Ternak</span>
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Populasi</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {totalLivestock.toLocaleString('id-ID')} Ekor
          </span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            Tingkat Hidup (Livability): {survivalRate}%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kandang Beroperasi</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {filteredBarns.length} Unit
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Kapasitas: {filteredBarns.reduce((acc, b) => acc + b.capacity, 0).toLocaleString('id-ID')} ekor
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Kelompok / Batch</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {filteredGroups.length} Batch
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Status sehat & aktif
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Kematian Kumulatif</span>
          <span className="text-xl font-black text-rose-600 mt-1 block">
            {totalDead} Ekor
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Ambang wajar industri: &lt; 2.5%
          </span>
        </div>
      </div>

      {/* Kandang / Barns Overview Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Kondisi Kandang & Fasilitas</h3>
          </div>
          <span className="text-xs text-slate-500">Kepadatan & Mikroklimat Terpantau</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filteredBarns.map((barn) => {
            const occupancyPct = Math.round((barn.currentCount / barn.capacity) * 100);
            return (
              <div key={barn.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm">{barn.name}</h4>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {barn.status}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Terisi: {barn.currentCount} / {barn.capacity} ekor</span>
                    <span className="font-bold text-slate-900">{occupancyPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${occupancyPct > 90 ? 'bg-amber-500' : 'bg-emerald-600'}`}
                      style={{ width: `${Math.min(100, occupancyPct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200">
                  <span>Suhu: {barn.temperatureC || 27}°C</span>
                  <span>Kelembaban: {barn.humidityPct || 68}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Batch / Livestock Groups List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Daftar Populasi Batch Ternak Aktif</span>
          </div>
          <span className="text-xs text-slate-500">{filteredGroups.length} Batch terdaftar</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredGroups.map((grp) => {
            const barn = barns.find((b) => b.id === grp.barnId);
            return (
              <div key={grp.id} className="p-4 sm:p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{grp.name}</h4>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Fase {grp.phase}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                      {grp.currentAgeWeeksOrMonths}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Kandang: <strong className="text-slate-800">{barn?.name || grp.barnId}</strong> • Tanggal Masuk: {grp.arrivalDate}
                  </p>
                  {grp.notes && (
                    <p className="text-xs text-slate-600 bg-slate-100/70 p-2 rounded-lg mt-1">
                      {grp.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-6 border-t sm:border-t-0 pt-2 sm:pt-0">
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Jumlah Saat Ini</span>
                    <span className="text-lg font-black text-slate-900">
                      {grp.currentCount.toLocaleString('id-ID')} Ekor
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Awal: {grp.initialCount} • Mati: {grp.mortalityCount}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedGroupForMortality(grp.id);
                      setIsMortalityOpen(true);
                    }}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Catat Kematian Batch Ini"
                  >
                    <Skull className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Afkir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL CATAT KEMATIAN */}
      {isMortalityOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Pencatatan Kematian / Afkir Populasi</h3>
            <p className="text-xs text-slate-500 mb-4">
              Sistem akan mengurangi populasi aktif dan mencatat histori untuk audit kematian peternakan.
            </p>

            <form onSubmit={handleSaveMortality} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pilih Batch Ternak</label>
                <select
                  value={selectedGroupForMortality}
                  onChange={(e) => setSelectedGroupForMortality(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  required
                >
                  {filteredGroups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.currentCount} ekor aktif)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Ekor Mati / Dipotong Afkir</label>
                <input
                  type="number"
                  min="1"
                  value={mortalityCountInput}
                  onChange={(e) => setMortalityCountInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-rose-700"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Penyebab / Indikasi Gejala</label>
                <input
                  type="text"
                  value={mortalityReasonInput}
                  onChange={(e) => setMortalityReasonInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  placeholder="Misal: Heat stress, prolapsus, afkir produksi rendah..."
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsMortalityOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Pengurangan Populasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BATCH */}
      {isAddGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Tambah Batch / Kelompok Ternak Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan kedatangan bibit/DOC baru atau koloni ternak ke dalam kandang.
            </p>

            <form onSubmit={handleSaveGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama / Kode Batch</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Batch Isa Brown Nov 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Komoditas</label>
                  <select
                    value={groupCategory}
                    onChange={(e) => setGroupCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                      <option key={c} value={c}>{COMMODITY_INFO[c].name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kandang Penempatan</label>
                  <select
                    value={groupBarnId}
                    onChange={(e) => setGroupBarnId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    {barns.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Ekor Awal</label>
                  <input
                    type="number"
                    value={groupCount}
                    onChange={(e) => setGroupCount(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Umur Saat Ini</label>
                  <input
                    type="text"
                    value={groupAge}
                    onChange={(e) => setGroupAge(e.target.value)}
                    placeholder="Contoh: 18 Minggu / 25 Hari"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddGroupOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH KANDANG */}
      {isAddBarnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Tambah Kandang Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Daftarkan fasilitas kandang baru beserta kapasitas daya tampung.
            </p>

            <form onSubmit={handleSaveBarn} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Kandang</label>
                <input
                  type="text"
                  value={barnName}
                  onChange={(e) => setBarnName(e.target.value)}
                  placeholder="Contoh: Kandang Baterai Layer C"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Daya Tampung / Kapasitas (Ekor)</label>
                <input
                  type="number"
                  value={barnCapacity}
                  onChange={(e) => setBarnCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddBarnOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Kandang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
