import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  PlusCircle, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Pill, 
  Trash2, 
  Clock, 
  Truck,
  CheckCircle2,
  Sprout
} from 'lucide-react';
import { 
  FeedInventoryItem, 
  MedicineInventoryItem, 
  LivestockCategory,
  AlternativeFeedItem,
  SavedAlternativeRation,
  LivestockGroup,
  FarmSchedule
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';
import { AlternativeFeedModule } from '../feed/AlternativeFeedModule';

interface InventoryModuleProps {
  feedInventory: FeedInventoryItem[];
  medicineInventory: MedicineInventoryItem[];
  activeCategory: LivestockCategory;
  onUpdateFeedStock: (id: string, deltaKg: number) => void;
  onAddFeedItem: (item: Omit<FeedInventoryItem, 'id'>) => void;
  onAddMedicineItem: (item: Omit<MedicineInventoryItem, 'id'>) => void;
  onDeleteFeedItem: (id: string) => void;
  alternativeFeeds: AlternativeFeedItem[];
  savedRations: SavedAlternativeRation[];
  livestockGroups: LivestockGroup[];
  onAddAlternativeFeed: (item: Omit<AlternativeFeedItem, 'id'>) => void;
  onDeleteAlternativeFeed: (id: string) => void;
  onSaveRation: (ration: Omit<SavedAlternativeRation, 'id'>) => void;
  onDeleteRation: (id: string) => void;
  onAddSchedule: (schedule: Omit<FarmSchedule, 'id'>) => void;
}

export const InventoryModule: React.FC<InventoryModuleProps> = ({
  feedInventory,
  medicineInventory,
  activeCategory,
  onUpdateFeedStock,
  onAddFeedItem,
  onAddMedicineItem,
  onDeleteFeedItem,
  alternativeFeeds,
  savedRations,
  livestockGroups,
  onAddAlternativeFeed,
  onDeleteAlternativeFeed,
  onSaveRation,
  onDeleteRation,
  onAddSchedule,
}) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'alternative_feed' | 'medicine'>('feed');
  const [isAddFeedOpen, setIsAddFeedOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedFeedId, setSelectedFeedId] = useState<string>('');
  const [restockAmountKg, setRestockAmountKg] = useState<number>(500);

  // New Feed Form State
  const [feedName, setFeedName] = useState('');
  const [feedCategory, setFeedCategory] = useState<LivestockCategory | 'umum'>(activeCategory);
  const [feedType, setFeedType] = useState<FeedInventoryItem['type']>('konsentrat');
  const [feedStock, setFeedStock] = useState<number>(1000);
  const [feedThreshold, setFeedThreshold] = useState<number>(500);
  const [feedPriceKg, setFeedPriceKg] = useState<number>(8500);
  const [feedSupplier, setFeedSupplier] = useState('');

  const lowStockCount = feedInventory.filter((f) => f.currentStockKg <= f.minThresholdKg).length;

  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFeedId) return;
    onUpdateFeedStock(selectedFeedId, restockAmountKg);
    setIsRestockModalOpen(false);
  };

  const handleCreateFeedSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddFeedItem({
      name: feedName,
      category: feedCategory,
      type: feedType,
      currentStockKg: feedStock,
      minThresholdKg: feedThreshold,
      pricePerKg: feedPriceKg,
      supplier: feedSupplier || 'Supplier Lokal',
      lastRestockedDate: new Date().toISOString().split('T')[0],
    });
    setIsAddFeedOpen(false);
    setFeedName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengelolaan Persediaan & Logistik</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Monitoring stok pakan utama, pakan alternatif & formulasi, obat/vaksin, serta peringatan stok menipis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsAddFeedOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Item Pakan</span>
          </button>
        </div>
      </div>

      {/* Tabs Pill Selector */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'feed'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Persediaan Pakan Ternak</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-amber-950 font-black">
              {lowStockCount} Peringatan
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alternative_feed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'alternative_feed'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Pakan Alternatif</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
            activeTab === 'alternative_feed'
              ? 'bg-emerald-600 text-emerald-100'
              : 'bg-emerald-100 text-emerald-800'
          }`}>
            {alternativeFeeds.length} Bahan
          </span>
        </button>

        <button
          onClick={() => setActiveTab('medicine')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeTab === 'medicine'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>Vaksin & Suplemen Obat</span>
        </button>
      </div>

      {/* TAB 1: PAKAN TERNAK */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {feedInventory.map((item) => {
              const isLow = item.currentStockKg <= item.minThresholdKg;
              // Assuming ~150kg/day consumption for estimate
              const daysRemaining = Math.max(1, Math.round(item.currentStockKg / 140));

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isLow 
                      ? 'bg-amber-50/70 border-amber-300 shadow-sm' 
                      : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        item.type === 'alternatif' || item.isAlternative
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {item.type}
                      </span>
                      {isLow ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Menipis!
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Aman
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{item.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Supplier: {item.supplier}
                    </p>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs text-slate-500">Sisa Stok:</span>
                        <span className="text-lg font-black text-slate-900">
                          {item.currentStockKg.toLocaleString('id-ID')}{' '}
                          <span className="text-xs font-semibold text-slate-500">Kg</span>
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Batas Aman: {item.minThresholdKg} kg</span>
                        <span className="font-semibold text-slate-600">~{daysRemaining} Hari Pakai</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedFeedId(item.id);
                        setIsRestockModalOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ArrowDownCircle className="w-3.5 h-3.5" />
                      <span>Restok</span>
                    </button>

                    <button
                      onClick={() => onDeleteFeedItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: PAKAN ALTERNATIF */}
      {activeTab === 'alternative_feed' && (
        <AlternativeFeedModule
          embedded
          activeCategory={activeCategory}
          alternativeFeeds={alternativeFeeds}
          savedRations={savedRations}
          feedInventory={feedInventory}
          livestockGroups={livestockGroups}
          onAddAlternativeFeed={onAddAlternativeFeed}
          onDeleteAlternativeFeed={onDeleteAlternativeFeed}
          onSaveRation={onSaveRation}
          onDeleteRation={onDeleteRation}
          onAddFeedToWarehouse={onAddFeedItem}
          onAddSchedule={onAddSchedule}
        />
      )}

      {/* TAB 3: OBAT & VAKSIN */}
      {activeTab === 'medicine' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">
            Daftar Stok Vaksin, Vitamin & Disinfektan Farm
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nama Produk</th>
                  <th className="py-3 px-4">Tujuan / Fungsi</th>
                  <th className="py-3 px-4">Sasaran Ternak</th>
                  <th className="py-3 px-4">Stok Saat Ini</th>
                  <th className="py-3 px-4">Masa Kedaluwarsa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicineInventory.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{med.name}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-[10px] text-slate-600">
                      {med.purpose}
                    </td>
                    <td className="py-3 px-4">
                      {med.targetCategory === 'umum' ? 'Semua Ternak' : COMMODITY_INFO[med.targetCategory]?.name}
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      {med.currentStockUnit} <span className="text-xs font-normal text-slate-500">{med.unit}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-xs">{med.expiryDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL RESTOK PAKAN */}
      {isRestockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Penerimaan Barang Pakan (Restok)</h3>
            <p className="text-xs text-slate-500 mb-4">
              Tambahkan jumlah kilogram pakan yang baru masuk ke gudang penyimpanan.
            </p>

            <form onSubmit={handleRestockSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Tambahan (Kg)</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmountKg}
                  onChange={(e) => setRestockAmountKg(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Konfirmasi Masuk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ITEM PAKAN BARU */}
      {isAddFeedOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Daftarkan Jenis Pakan Baru</h3>
            <p className="text-xs text-slate-500 mb-4">
              Masukkan spesifikasi pakan konsentrat, bahan baku, atau pakan formulasi.
            </p>

            <form onSubmit={handleCreateFeedSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Pakan</label>
                <input
                  type="text"
                  value={feedName}
                  onChange={(e) => setFeedName(e.target.value)}
                  placeholder="Contoh: Dedak Padi Halus Super"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Pakan</label>
                  <select
                    value={feedType}
                    onChange={(e) => setFeedType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    <option value="konsentrat">Konsentrat</option>
                    <option value="jagung">Jagung Giling</option>
                    <option value="dedak">Dedak / Bekatul</option>
                    <option value="starter">Pakan Starter</option>
                    <option value="finisher">Pakan Finisher</option>
                    <option value="hijauan">Hijauan / Silase</option>
                    <option value="mineral">Mineral Premix</option>
                    <option value="alternatif">Pakan Alternatif Lokal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stok Awal (Kg)</label>
                  <input
                    type="number"
                    value={feedStock}
                    onChange={(e) => setFeedStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batas Minimum Peringatan (Kg)</label>
                  <input
                    type="number"
                    value={feedThreshold}
                    onChange={(e) => setFeedThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Harga Beli (Rp/Kg)</label>
                  <input
                    type="number"
                    value={feedPriceKg}
                    onChange={(e) => setFeedPriceKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Toko / Supplier</label>
                <input
                  type="text"
                  value={feedSupplier}
                  onChange={(e) => setFeedSupplier(e.target.value)}
                  placeholder="Contoh: Koperasi Tani Makmur"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddFeedOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Item Pakan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
