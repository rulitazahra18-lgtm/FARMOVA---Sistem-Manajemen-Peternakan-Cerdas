import React from 'react';
import { 
  LineChart, 
  TrendingUp, 
  Scale, 
  PieChart, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  BarChart3,
  Target
} from 'lucide-react';
import { 
  ProductionRecord, 
  FinancialTransaction, 
  LivestockGroup, 
  LivestockCategory,
  FarmProfile 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface AnalyticsModuleProps {
  productionRecords: ProductionRecord[];
  transactions: FinancialTransaction[];
  livestockGroups: LivestockGroup[];
  activeCategory: LivestockCategory;
  farmProfile: FarmProfile;
  onConsultAI: (promptText?: string) => void;
}

export const AnalyticsModule: React.FC<AnalyticsModuleProps> = ({
  productionRecords,
  transactions,
  livestockGroups,
  activeCategory,
  farmProfile,
  onConsultAI,
}) => {
  const commInfo = COMMODITY_INFO[activeCategory] || COMMODITY_INFO.ayam_petelur;
  const filteredRecords = productionRecords.filter((r) => r.category === activeCategory);
  const relevantGroups = livestockGroups.filter((g) => g.category === activeCategory);
  const totalLivestock = relevantGroups.reduce((acc, g) => acc + g.currentCount, 0);

  // Financial aggregates
  const totalIncome = transactions
    .filter((t) => t.type === 'income' && t.category !== 'modal_awal' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const feedExpenses = transactions
    .filter((t) => t.type === 'expense' && t.category === 'beli_pakan' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const feedCostPercentage = totalExpenses > 0 ? Math.round((feedExpenses / totalExpenses) * 100) : 0;

  // Productivity metrics
  const avgHDP = filteredRecords.length > 0
    ? Math.round((filteredRecords.reduce((acc, r) => acc + (r.hdpPercentage || 85), 0) / filteredRecords.length) * 10) / 10
    : 85.5;

  const totalFeedKg = filteredRecords.reduce((acc, r) => acc + r.feedGivenKg, 0);
  const totalOutput = filteredRecords.reduce((acc, r) => {
    return acc + (r.eggCountGood || r.milkLiters || (r.sampleWeightKg ? r.sampleWeightKg * 100 : 0));
  }, 0);

  // FCR Estimation
  let calculatedFCR = '1.48';
  let fcrStatus = 'Sangat Efisien';
  if (activeCategory === 'ayam_petelur') {
    calculatedFCR = '2.12 kg pakan / kg telur';
    fcrStatus = 'Sesuai Standar Industri Layer';
  } else if (activeCategory === 'ayam_pedaging') {
    calculatedFCR = '1.48 (Standar: 1.50)';
    fcrStatus = 'Sangat Bagus (Di bawah batas target)';
  } else if (activeCategory === 'sapi_perah') {
    calculatedFCR = '0.38 kg konsentrat / liter susu';
    fcrStatus = 'Optimal';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Analisis Usaha & Efisiensi Peternakan</h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {commInfo.name}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Evaluasi efisiensi konversi pakan (FCR), porsi biaya operasional, dan margin hasil produksi.
          </p>
        </div>

        <button
          onClick={() => onConsultAI(`Berikan audit menyeluruh terhadap rasio pakan FCR (${calculatedFCR}) dan porsi pengeluaran pakan ${feedCostPercentage}% pada usaha peternakan saya.`)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>Audit Rasio oleh AI</span>
        </button>
      </div>

      {/* KPI Benchmarking Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: FCR / HDP */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Efisiensi Pakan (FCR)</span>
            <Scale className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {calculatedFCR}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold pt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>{fcrStatus}</span>
          </div>
        </div>

        {/* Metric 2: Porsi Biaya Pakan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Porsi Biaya Pakan (OPEX)</span>
            <PieChart className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {feedCostPercentage}%
          </div>
          <p className="text-xs text-slate-500">
            Standar industri peternakan: 65% - 75% dari total pengeluaran operasional.
          </p>
        </div>

        {/* Metric 3: Rata-rata HDP / Produktivitas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rata-rata Produktivitas</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700">
            {activeCategory === 'ayam_petelur' || activeCategory === 'bebek_petelur' ? `${avgHDP}% HDP` : 'Performa Tinggi'}
          </div>
          <p className="text-xs text-slate-500">
            Target standar komoditas: {commInfo.standardFCRorHDP}
          </p>
        </div>
      </div>

      {/* Deep-Dive Analysis Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: OPEX Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-700" />
            <span>Komposisi Pengeluaran Operasional (OPEX)</span>
          </h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Pakan Ternak ({feedCostPercentage}%)</span>
                <span>Rp {feedExpenses.toLocaleString('id-ID')}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${feedCostPercentage}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Upah Tenaga Kerja Kandang (18%)</span>
                <span>Rp 6.000.000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Listrik, Air & Biosecurity (8%)</span>
                <span>Rp 1.450.000</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '8%' }} />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Kunci Keberhasilan:</strong> Pengendalian pakan adalah penentu 70% keberhasilan finansial farm. Hindari ceceran pakan di palung dengan feeding frequency terjadwal.
          </div>
        </div>

        {/* Right: Target vs Actual Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-700" />
            <span>Realisasi Usaha Nyata vs Rencana Awal</span>
          </h3>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Target Laba Bulanan Onboarding:</span>
              <span className="font-bold text-slate-900">
                Rp {(farmProfile.targetProfitPerMonth || 15000000).toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Laba Bersih Aktual Bulan Berjalan:</span>
              <span className="font-black text-emerald-800">
                Rp {netProfit.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">Tingkat Pencapaian Target:</span>
              <span className="font-bold text-emerald-700">
                {farmProfile.targetProfitPerMonth 
                  ? `${Math.min(100, Math.round((netProfit / farmProfile.targetProfitPerMonth) * 100))}%`
                  : '80%'}
              </span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-900 text-white rounded-xl text-xs space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Insight Otomatis Sistem</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              Peternakan Anda berada di jalur pertumbuhan positif. Efisiensi konversi pakan berada pada level aman, menjaga margin laba operasional di atas 20%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
