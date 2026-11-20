import React, { useState } from 'react';
import { 
  PlusCircle, 
  Egg, 
  Scale, 
  Milk, 
  Calendar, 
  Trash2, 
  Filter, 
  TrendingUp, 
  Sparkles, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { 
  ProductionRecord, 
  LivestockCategory, 
  LivestockGroup 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface ProductionModuleProps {
  productionRecords: ProductionRecord[];
  livestockGroups: LivestockGroup[];
  activeCategory: LivestockCategory;
  onAddRecord: (record: Omit<ProductionRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
}

export const ProductionModule: React.FC<ProductionModuleProps> = ({
  productionRecords,
  livestockGroups,
  activeCategory,
  onAddRecord,
  onDeleteRecord,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<LivestockCategory | 'all'>(activeCategory);

  // Form State for New Production Record
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState<LivestockCategory>(activeCategory);
  const [formGroupId, setFormGroupId] = useState<string>('');
  
  // Specific inputs
  const [formEggGood, setFormEggGood] = useState<number>(1080);
  const [formEggDamaged, setFormEggDamaged] = useState<number>(15);
  const [formEggKg, setFormEggKg] = useState<number>(68);
  const [formMilkLiters, setFormMilkLiters] = useState<number>(230);
  const [formMilkFat, setFormMilkFat] = useState<number>(4.0);
  const [formSampleWeight, setFormSampleWeight] = useState<number>(1.65);
  const [formFeedGiven, setFormFeedGiven] = useState<number>(144);
  const [formMortality, setFormMortality] = useState<number>(0);
  const [formRecorder, setFormRecorder] = useState<string>('Pak Joko (Anak Kandang)');
  const [formNotes, setFormNotes] = useState<string>('');

  const availableGroups = livestockGroups.filter((g) => g.category === formCategory);
  const commInfo = COMMODITY_INFO[formCategory] || COMMODITY_INFO.ayam_petelur;

  // Filtered list
  const filteredRecords = productionRecords.filter((r) => {
    if (selectedFilterCategory === 'all') return true;
    return r.category === selectedFilterCategory;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Auto calculate HDP %
  const currentGroup = livestockGroups.find((g) => g.id === (formGroupId || availableGroups[0]?.id));
  const autoHDP = currentGroup && currentGroup.currentCount > 0 && (formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur')
    ? Math.round(((formEggGood / currentGroup.currentCount) * 100) * 10) / 10
    : undefined;

  const autoTrays = Math.round((formEggGood / 30) * 10) / 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGroupId = formGroupId || availableGroups[0]?.id || 'grp-default';

    onAddRecord({
      date: formDate,
      category: formCategory,
      groupId: finalGroupId,
      eggCountGood: formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur' ? formEggGood : undefined,
      eggCountDamaged: formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur' ? formEggDamaged : undefined,
      eggTotalKg: formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur' ? formEggKg : undefined,
      eggTraysCount: formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur' ? autoTrays : undefined,
      milkLiters: formCategory === 'sapi_perah' ? formMilkLiters : undefined,
      milkFatPct: formCategory === 'sapi_perah' ? formMilkFat : undefined,
      sampleWeightKg: formCategory === 'ayam_pedaging' || formCategory === 'sapi_potong' ? formSampleWeight : undefined,
      feedGivenKg: formFeedGiven,
      hdpPercentage: autoHDP,
      mortalityToday: formMortality,
      recordedBy: formRecorder,
      notes: formNotes,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengelolaan & Pencatatan Produksi</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Sistem pencatatan semi-otomatis: masukkan hasil harian, kalkulasi HDP% dan FCR dihitung otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedFilterCategory}
              onChange={(e) => setSelectedFilterCategory(e.target.value as any)}
              className="bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="all">Semua Komoditas</option>
              {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                <option key={c} value={c}>{COMMODITY_INFO[c].name}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              setFormCategory(activeCategory);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Produksi Harian</span>
          </button>
        </div>
      </div>

      {/* Production History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-slate-800">
            <Calendar className="w-4 h-4 text-emerald-700" />
            <span>Riwayat Pencatatan Hasil Produksi ({filteredRecords.length} Catatan)</span>
          </div>
          <span className="text-xs text-slate-400">Diurutkan dari tanggal terbaru</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Komoditas & Batch</th>
                <th className="py-3 px-4">Hasil Produksi Utama</th>
                <th className="py-3 px-4">Efisiensi / HDP%</th>
                <th className="py-3 px-4">Pakan Diberikan</th>
                <th className="py-3 px-4">Mortalitas</th>
                <th className="py-3 px-4">Pencatat</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400 text-xs">
                    Belum ada data pencatatan produksi untuk filter ini. Silakan tambahkan catatan baru.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const comm = COMMODITY_INFO[rec.category] || COMMODITY_INFO.ayam_petelur;
                  const group = livestockGroups.find((g) => g.id === rec.groupId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                        {rec.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{comm.name}</div>
                        <div className="text-[11px] text-slate-500">{group?.name || rec.groupId}</div>
                      </td>
                      <td className="py-3 px-4">
                        {rec.eggCountGood ? (
                          <div>
                            <span className="font-bold text-emerald-800 text-sm">
                              {rec.eggCountGood.toLocaleString('id-ID')} Butir
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {rec.eggTraysCount} Rak ({rec.eggTotalKg} Kg) • Retak: {rec.eggCountDamaged || 0}
                            </span>
                          </div>
                        ) : rec.milkLiters ? (
                          <div>
                            <span className="font-bold text-blue-700 text-sm">
                              {rec.milkLiters} Liter
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              Kadar Lemak: {rec.milkFatPct || 4.0}%
                            </span>
                          </div>
                        ) : rec.sampleWeightKg ? (
                          <div>
                            <span className="font-bold text-slate-900 text-sm">
                              {rec.sampleWeightKg} Kg
                            </span>
                            <span className="text-[11px] text-slate-500 block">Bobot sampling</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {rec.hdpPercentage ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            rec.hdpPercentage >= 85 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            HDP {rec.hdpPercentage}%
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">Normal</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-700">
                        {rec.feedGivenKg} Kg
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${rec.mortalityToday > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                          {rec.mortalityToday} Ekor
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs">
                        {rec.recordedBy}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Catatan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL INPUT CATAT PRODUKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95">
            <div className="bg-[#112d1f] text-white px-5 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Catat Hasil Produksi Harian</h3>
                <p className="text-xs text-emerald-300">
                  Data otomatis menghitung rasio produktivitas dan pengurangan stok pakan.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-emerald-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Komoditas</label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value as any);
                      setFormGroupId('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                      <option key={c} value={c}>{COMMODITY_INFO[c].name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kelompok / Batch Ternak</label>
                <select
                  value={formGroupId}
                  onChange={(e) => setFormGroupId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                >
                  {availableGroups.length > 0 ? (
                    availableGroups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.currentCount} ekor - {g.phase})
                      </option>
                    ))
                  ) : (
                    <option value="">Semua Kelompok ({commInfo.name})</option>
                  )}
                </select>
              </div>

              {/* DYNAMIC FIELDS PER COMMODITY */}
              {(formCategory === 'ayam_petelur' || formCategory === 'bebek_petelur') && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center justify-between">
                    <span>Pencatatan Telur ({commInfo.name})</span>
                    {autoHDP !== undefined && (
                      <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        HDP Otomatis: {autoHDP}%
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Telur Utuh / Bagus (Butir)</label>
                      <input
                        type="number"
                        value={formEggGood}
                        onChange={(e) => setFormEggGood(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Telur Retak / Rusak (Butir)</label>
                      <input
                        type="number"
                        value={formEggDamaged}
                        onChange={(e) => setFormEggDamaged(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-rose-700"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Berat Total Timbang (Kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formEggKg}
                        onChange={(e) => setFormEggKg(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Hasil Rak (Auto 30 Butir/Rak)</label>
                      <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                        {autoTrays} Rak
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {formCategory === 'sapi_perah' && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-blue-900">Pencatatan Susu Sapi Segar</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Volume Susu Total (Liter)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formMilkLiters}
                        onChange={(e) => setFormMilkLiters(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Kadar Lemak / Fat (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formMilkFat}
                        onChange={(e) => setFormMilkFat(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {(formCategory === 'ayam_pedaging' || formCategory === 'sapi_potong' || formCategory === 'kambing_domba') && (
                <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3">
                  <div className="text-xs font-bold text-emerald-950">Sampling Bobot & Pertumbuhan</div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bobot Rata-rata Sampling (Kg/ekor)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formSampleWeight}
                      onChange={(e) => setFormSampleWeight(Number(e.target.value))}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Feed & Mortality */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Pakan Diberikan (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formFeedGiven}
                    onChange={(e) => setFormFeedGiven(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kematian Hari Ini (Ekor)</label>
                  <input
                    type="number"
                    value={formMortality}
                    onChange={(e) => setFormMortality(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-rose-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Petugas Pencatat</label>
                <input
                  type="text"
                  value={formRecorder}
                  onChange={(e) => setFormRecorder(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Misal: kondisi cuaca gerimis, nafsu makan tinggi..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
