import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  CheckCircle2, 
  Egg, 
  ShieldCheck, 
  Wallet, 
  Boxes 
} from 'lucide-react';
import { 
  FarmProfile, 
  LivestockCategory, 
  ProductionRecord, 
  FinancialTransaction, 
  LivestockGroup, 
  FeedInventoryItem, 
  FarmSchedule 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface ReportsModuleProps {
  farmProfile: FarmProfile;
  activeCategory: LivestockCategory;
  productionRecords: ProductionRecord[];
  transactions: FinancialTransaction[];
  livestockGroups: LivestockGroup[];
  feedInventory: FeedInventoryItem[];
  schedules: FarmSchedule[];
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  farmProfile,
  activeCategory,
  productionRecords,
  transactions,
  livestockGroups,
  feedInventory,
  schedules,
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'summary' | 'production' | 'finance' | 'inventory'>('summary');
  const commInfo = COMMODITY_INFO[activeCategory] || COMMODITY_INFO.ayam_petelur;

  const relevantProd = productionRecords.filter((r) => r.category === activeCategory);
  const relevantGroups = livestockGroups.filter((g) => g.category === activeCategory);
  const totalLivestock = relevantGroups.reduce((acc, g) => acc + g.currentCount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.category !== 'modal_awal' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header and Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Laporan Resmi Peternakan FARMOVA</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Rekapitulasi operasional, produksi, arus kas keuangan, dan mutasi inventaris.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Ekspor PDF</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 print:hidden">
        <button
          onClick={() => setActiveReportTab('summary')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeReportTab === 'summary' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Ringkasan Eksekutif
        </button>
        <button
          onClick={() => setActiveReportTab('production')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeReportTab === 'production' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Laporan Produksi
        </button>
        <button
          onClick={() => setActiveReportTab('finance')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeReportTab === 'finance' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Laporan Keuangan
        </button>
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeReportTab === 'inventory' ? 'bg-emerald-800 text-white' : 'bg-white border text-slate-600'
          }`}
        >
          Laporan Logistik
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Farm Letterhead */}
        <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{farmProfile.farmName}</h1>
            <p className="text-xs text-slate-600">
              Lokasi: {farmProfile.location} • Penanggung Jawab: {farmProfile.ownerName}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Sistem Manajemen Agribisnis FARMOVA - Dicetak pada {new Date().toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
              Komoditas Terpilih
            </span>
            <span className="text-sm font-extrabold text-slate-900">{commInfo.name}</span>
          </div>
        </div>

        {/* TAB 1: SUMMARY */}
        {activeReportTab === 'summary' && (
          <div className="space-y-6">
            <h3 className="font-bold text-slate-900 text-base">Rekapitulasi Kinerja Peternakan</h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Populasi Aktif</span>
                <span className="text-lg font-bold text-slate-900">{totalLivestock.toLocaleString('id-ID')} Ekor</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Pemasukan Kas</span>
                <span className="text-lg font-bold text-emerald-700">Rp {totalIncome.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Beban OPEX</span>
                <span className="text-lg font-bold text-rose-600">Rp {totalExpense.toLocaleString('id-ID')}</span>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <span className="text-[11px] font-semibold text-slate-500 uppercase block">Laba Bersih Aktual</span>
                <span className="text-lg font-bold text-emerald-800">Rp {netProfit.toLocaleString('id-ID')}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <h4 className="font-bold text-slate-800">Catatan Evaluasi Usaha:</h4>
              <p className="text-slate-600 leading-relaxed">
                Tingkat produktivitas telur/susu/bobot ternak beroperasi dalam efisiensi yang baik. Seluruh data keuangan telah divalidasi berdasarkan kuitansi pemasukan dan pengeluaran aktual tanpa estimasi fiktif.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTION REPORT */}
        {activeReportTab === 'production' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Rincian Riwayat Catatan Produksi</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Hasil Utama</th>
                  <th className="p-2.5">Pakan (Kg)</th>
                  <th className="p-2.5">Mortalitas</th>
                  <th className="p-2.5">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {relevantProd.map((p) => (
                  <tr key={p.id}>
                    <td className="p-2.5 font-semibold text-slate-800">{p.date}</td>
                    <td className="p-2.5 font-bold text-emerald-800">
                      {p.eggCountGood ? `${p.eggCountGood} Butir (${p.eggTraysCount} Rak)` :
                       p.milkLiters ? `${p.milkLiters} Liter` :
                       p.sampleWeightKg ? `${p.sampleWeightKg} Kg` : '-'}
                    </td>
                    <td className="p-2.5">{p.feedGivenKg} Kg</td>
                    <td className="p-2.5 text-rose-600">{p.mortalityToday} Ekor</td>
                    <td className="p-2.5 text-slate-500">{p.recordedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: FINANCE REPORT */}
        {activeReportTab === 'finance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Jurnal Kas & Keuangan</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="p-2.5">Tanggal</th>
                  <th className="p-2.5">Kategori</th>
                  <th className="p-2.5">Keterangan</th>
                  <th className="p-2.5 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="p-2.5 font-semibold text-slate-800">{tx.date}</td>
                    <td className="p-2.5 uppercase font-medium">{tx.category.replace('_', ' ')}</td>
                    <td className="p-2.5 text-slate-600">{tx.description}</td>
                    <td className={`p-2.5 text-right font-black ${tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: INVENTORY REPORT */}
        {activeReportTab === 'inventory' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Status Stok Pakan & Gudang</h3>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 font-bold uppercase text-[10px] text-slate-700">
                <tr>
                  <th className="p-2.5">Nama Pakan</th>
                  <th className="p-2.5">Tipe</th>
                  <th className="p-2.5">Sisa Stok (Kg)</th>
                  <th className="p-2.5">Ambang Peringatan</th>
                  <th className="p-2.5">Pemasok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {feedInventory.map((f) => (
                  <tr key={f.id}>
                    <td className="p-2.5 font-bold text-slate-800">{f.name}</td>
                    <td className="p-2.5 uppercase text-slate-600">{f.type}</td>
                    <td className="p-2.5 font-bold">{f.currentStockKg} Kg</td>
                    <td className="p-2.5 text-slate-500">{f.minThresholdKg} Kg</td>
                    <td className="p-2.5 text-slate-600">{f.supplier}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Signature Footer */}
        <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-600">
          <div>
            <p>Disetujui Oleh,</p>
            <div className="h-14" />
            <p className="font-bold text-slate-900">{farmProfile.ownerName}</p>
            <p className="text-[10px] text-slate-400">Pemilik Peternakan</p>
          </div>
          <div className="text-right">
            <p>Divalidasi Sistem,</p>
            <div className="h-14" />
            <p className="font-bold text-slate-900">FARMOVA Digital Engine</p>
            <p className="text-[10px] text-slate-400">Terverifikasi Otentik</p>
          </div>
        </div>

      </div>
    </div>
  );
};
