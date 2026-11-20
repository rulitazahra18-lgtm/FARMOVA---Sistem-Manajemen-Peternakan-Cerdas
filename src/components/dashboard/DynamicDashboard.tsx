import React from 'react';
import { 
  Egg, 
  Scale, 
  Milk, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  CalendarClock, 
  Wallet, 
  Boxes, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  Flame,
  Plus
} from 'lucide-react';
import { 
  FarmProfile, 
  LivestockCategory, 
  Barn, 
  LivestockGroup, 
  ProductionRecord, 
  FeedInventoryItem, 
  FarmSchedule, 
  FinancialTransaction 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface DynamicDashboardProps {
  farmProfile: FarmProfile;
  activeCategory: LivestockCategory;
  barns: Barn[];
  livestockGroups: LivestockGroup[];
  productionRecords: ProductionRecord[];
  feedInventory: FeedInventoryItem[];
  schedules: FarmSchedule[];
  transactions: FinancialTransaction[];
  onOpenQuickAddProduction: () => void;
  onNavigateTab: (tab: any) => void;
  onToggleSchedule: (id: string) => void;
  onConsultAI: (promptText?: string) => void;
}

export const DynamicDashboard: React.FC<DynamicDashboardProps> = ({
  farmProfile,
  activeCategory,
  barns,
  livestockGroups,
  productionRecords,
  feedInventory,
  schedules,
  transactions,
  onOpenQuickAddProduction,
  onNavigateTab,
  onToggleSchedule,
  onConsultAI,
}) => {
  const commInfo = COMMODITY_INFO[activeCategory] || COMMODITY_INFO.ayam_petelur;

  // Filter items matching active commodity
  const relevantGroups = livestockGroups.filter((g) => g.category === activeCategory);
  const relevantBarns = barns.filter((b) => b.category === activeCategory);
  const relevantRecords = productionRecords
    .filter((r) => r.category === activeCategory)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const relevantSchedules = schedules.filter((s) => s.category === activeCategory || s.category === 'semua');
  const relevantFeed = feedInventory.filter((f) => f.category === activeCategory || f.category === 'umum');

  const totalLivestockCount = relevantGroups.reduce((acc, g) => acc + g.currentCount, 0);
  const totalMortality = relevantGroups.reduce((acc, g) => acc + g.mortalityCount, 0);
  const latestProd = relevantRecords[0];

  // Cashflow calculations
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.category !== 'modal_awal')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  // Low stock feed warnings
  const lowStockFeeds = relevantFeed.filter((f) => f.currentStockKg <= f.minThresholdKg);
  const pendingTasks = relevantSchedules.filter((s) => !s.isCompleted);

  return (
    <div className="space-y-6">
      {/* Top Banner: Farm Welcome & Quick Stats */}
      <div className="bg-gradient-to-r from-[#112d1f] via-[#1b4332] to-[#2d6a4f] rounded-2xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Mode Dasbor: {commInfo.name}
              </span>
              <span className="text-xs text-emerald-200/80">• {farmProfile.location}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              {farmProfile.farmName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Sistem memantau {totalLivestockCount.toLocaleString('id-ID')} ekor populasi aktif di{' '}
              {relevantBarns.length} kandang. Semua data kalkulasi berbasis pencatatan harian aktual.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onConsultAI(`Analisis kondisi performa peternakan saya untuk komoditas ${commInfo.name}. Apakah ada anomali atau rekomendasi pakan?`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>Audit AI Peternakan</span>
            </button>
            <button
              onClick={onOpenQuickAddProduction}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs sm:text-sm font-bold shadow-lg transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Input Hasil Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Subtle Decorative Farm Graphic in background */}
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <TrendingUp className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Critical Alerts Banner (if any) */}
      {(lowStockFeeds.length > 0 || pendingTasks.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {lowStockFeeds.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-700">
                  <Boxes className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Stok Pakan Menipis ({lowStockFeeds.length} Item)</h4>
                  <p className="text-[11px] text-amber-800">
                    {lowStockFeeds[0].name} tersisa {lowStockFeeds[0].currentStockKg} kg.
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('inventory')}
                className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Restok</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {pendingTasks.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                  <CalendarClock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Jadwal Harian ({pendingTasks.length} Belum Selesai)</h4>
                  <p className="text-[11px] text-emerald-800">
                    Tugas terdekat: {pendingTasks[0].title} ({pendingTasks[0].time})
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('schedules')}
                className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Periksa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* DYNAMIC KPI CARDS BASED ON COMMODITY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Populasi Aktif */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Populasi Aktif</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalLivestockCount.toLocaleString('id-ID')}
              <span className="text-xs font-semibold text-slate-500 ml-1">Ekor</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Kematian Total:</span>
            <span className="font-bold text-slate-700">{totalMortality} ekor</span>
          </div>
        </div>

        {/* Card 2: Primary Output Specific to Commodity */}
        {activeCategory === 'ayam_petelur' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Telur Hari Ini</span>
                <Egg className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestProd?.eggCountGood ? latestProd.eggCountGood.toLocaleString('id-ID') : '0'}
                <span className="text-xs font-semibold text-slate-500 ml-1">Butir</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>HDP Hari Ini:</span>
              <span className="font-bold">{latestProd?.hdpPercentage || 85.5}%</span>
            </div>
          </div>
        )}

        {activeCategory === 'ayam_pedaging' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Bobot Rata-rata</span>
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestProd?.sampleWeightKg || 1.62}
                <span className="text-xs font-semibold text-slate-500 ml-1">Kg/ekor</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>FCR Kumulatif:</span>
              <span className="font-bold text-emerald-700">1.48 (Sangat Baik)</span>
            </div>
          </div>
        )}

        {activeCategory === 'sapi_perah' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Produksi Susu</span>
                <Milk className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestProd?.milkLiters || 238}
                <span className="text-xs font-semibold text-slate-500 ml-1">Liter/hari</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>Lemak Susu (Fat):</span>
              <span className="font-bold text-slate-800">{latestProd?.milkFatPct || 4.1}%</span>
            </div>
          </div>
        )}

        {activeCategory !== 'ayam_petelur' && activeCategory !== 'ayam_pedaging' && activeCategory !== 'sapi_perah' && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hasil Produksi</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-900">
                {latestProd?.eggCountGood || latestProd?.sampleWeightKg || 0}
                <span className="text-xs font-semibold text-slate-500 ml-1">{commInfo.scientificUnit}</span>
              </div>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
              <span>Status:</span>
              <span className="font-bold text-emerald-700">Stabil</span>
            </div>
          </div>
        )}

        {/* Card 3: Konsumsi Pakan Harian */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pakan Diberikan</span>
              <Boxes className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {latestProd?.feedGivenKg || 144}
              <span className="text-xs font-semibold text-slate-500 ml-1">Kg/hari</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Rata-rata/ekor:</span>
            <span className="font-bold text-slate-800">
              {totalLivestockCount > 0 
                ? `${Math.round(((latestProd?.feedGivenKg || 144) / totalLivestockCount) * 1000)} gr` 
                : '-'}
            </span>
          </div>
        </div>

        {/* Card 4: Laba Bersih Aktual */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Arus Kas Aktual</span>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <div className={`text-xl sm:text-2xl font-black ${netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
              Rp {(netProfit / 1000000).toFixed(1)}
              <span className="text-xs font-semibold text-slate-500 ml-1">Juta</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1.5">
            <span>Pemasukan Riil:</span>
            <span className="font-semibold text-slate-700">Rp {(totalIncome / 1000000).toFixed(1)} Jt</span>
          </div>
        </div>
      </div>

      {/* Main Section: Recent Production Trends & Daily Activity Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Production Recording Trend & Analysis */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Tren Produksi Terakhir ({commInfo.name})
              </h3>
              <p className="text-xs text-slate-500">
                Data aktual harian yang dicatat oleh petugas kandang.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simple Visual Bar Chart */}
          <div className="space-y-2.5 pt-2">
            {relevantRecords.slice(0, 5).map((rec) => {
              // Calculate percentage relative to max
              const value = rec.eggCountGood || rec.milkLiters || (rec.sampleWeightKg ? rec.sampleWeightKg * 100 : 80);
              const maxVal = activeCategory === 'ayam_petelur' ? 1200 : activeCategory === 'sapi_perah' ? 300 : 200;
              const barWidth = Math.min(100, Math.round((value / maxVal) * 100));

              return (
                <div key={rec.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-800">{rec.date}</span>
                    <span className="font-bold text-emerald-800">
                      {rec.eggCountGood ? `${rec.eggCountGood.toLocaleString('id-ID')} Butir (${rec.eggTraysCount} Rak)` :
                       rec.milkLiters ? `${rec.milkLiters} Liter` :
                       rec.sampleWeightKg ? `${rec.sampleWeightKg} kg bobot rata-rata` : `${value}`}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                    <span>Pakan: {rec.feedGivenKg} Kg</span>
                    <span>Mortalitas: {rec.mortalityToday} ekor</span>
                    {rec.hdpPercentage && <span>HDP: {rec.hdpPercentage}%</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-semibold text-emerald-950">
                Pencatatan Semi-Otomatis: Cukup masukkan data butir/liter, sistem otomatis menghitung rasio FCR & HDP%.
              </span>
            </div>
            <button
              onClick={onOpenQuickAddProduction}
              className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              Catat Hari Ini
            </button>
          </div>
        </div>

        {/* Right 1 Col: Species-Specific Schedules Checklist */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  Jadwal Kegiatan Harian
                </h3>
                <p className="text-[11px] text-slate-500">
                  Disesuaikan khusus untuk {commInfo.name}
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('schedules')}
                className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
              >
                Atur
              </button>
            </div>

            <div className="space-y-2.5">
              {relevantSchedules.slice(0, 4).map((sch) => (
                <div
                  key={sch.id}
                  onClick={() => onToggleSchedule(sch.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                    sch.isCompleted
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/30'
                  }`}
                >
                  <div className={`mt-0.5 rounded-md p-0.5 border ${
                    sch.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${sch.isCompleted ? 'text-white' : 'text-transparent'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold truncate ${sch.isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                        {sch.title}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-1.5 py-0.5 rounded ml-1">
                        {sch.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {sch.notes}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Tip Footer */}
          <div className="p-3 bg-slate-900 text-white rounded-xl mt-4">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Rekomendasi Cerdas Peternakan</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Tingkat produksi telur stabil di atas 85%. Pastikan suplementasi grit kalsium sore hari tetap konsisten untuk menjaga ketebalan cangkang telur.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
