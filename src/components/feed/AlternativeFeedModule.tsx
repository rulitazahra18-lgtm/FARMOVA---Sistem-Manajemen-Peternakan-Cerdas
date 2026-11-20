import React, { useState, useMemo } from 'react';
import {
  Sprout,
  Calculator,
  Sparkles,
  PlusCircle,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  CalendarClock,
  Trash2,
  Loader2,
  BookmarkCheck,
  Filter,
  ShieldAlert,
  TrendingDown,
  FlaskConical,
  ArrowRight,
  Check
} from 'lucide-react';
import {
  AlternativeFeedItem,
  FeedInventoryItem,
  FarmSchedule,
  LivestockCategory,
  LivestockGroup,
  SavedAlternativeRation,
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';
import { generateAlternativeFeedFormula } from '../../services/api';

interface AlternativeFeedModuleProps {
  activeCategory: LivestockCategory;
  alternativeFeeds: AlternativeFeedItem[];
  savedRations: SavedAlternativeRation[];
  feedInventory: FeedInventoryItem[];
  livestockGroups: LivestockGroup[];
  onAddAlternativeFeed: (item: Omit<AlternativeFeedItem, 'id'>) => void;
  onDeleteAlternativeFeed: (id: string) => void;
  onSaveRation: (ration: Omit<SavedAlternativeRation, 'id'>) => void;
  onDeleteRation: (id: string) => void;
  onAddFeedToWarehouse: (item: Omit<FeedInventoryItem, 'id'>) => void;
  onAddSchedule: (schedule: Omit<FarmSchedule, 'id'>) => void;
  embedded?: boolean;
}

const SOURCE_LABELS: Record<AlternativeFeedItem['sourceType'], string> = {
  serangga: 'Serangga / Maggot',
  tanaman_air: 'Tanaman Air',
  limbah_agro: 'Limbah Agroindustri',
  hijauan_unggul: 'Hijauan Unggul',
  fermentasi: 'Fermentasi Probiotik',
};

export const AlternativeFeedModule: React.FC<AlternativeFeedModuleProps> = ({
  activeCategory,
  alternativeFeeds,
  savedRations,
  feedInventory,
  livestockGroups,
  onAddAlternativeFeed,
  onDeleteAlternativeFeed,
  onSaveRation,
  onDeleteRation,
  onAddFeedToWarehouse,
  onAddSchedule,
  embedded = false,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'calculator' | 'ai_formulator'>('catalog');
  const [filterCategory, setFilterCategory] = useState<LivestockCategory | 'all'>(activeCategory);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add Custom Alternative Feed Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSourceType, setNewSourceType] = useState<AlternativeFeedItem['sourceType']>('limbah_agro');
  const [newTargets, setNewTargets] = useState<LivestockCategory[]>([activeCategory]);
  const [newProtein, setNewProtein] = useState<number>(18);
  const [newEnergy, setNewEnergy] = useState<number>(2500);
  const [newMaxSub, setNewMaxSub] = useState<number>(15);
  const [newCostKg, setNewCostKg] = useState<number>(2000);
  const [newPrep, setNewPrep] = useState('');
  const [newCaution, setNewCaution] = useState('');

  // Warehouse Stock Quick Modal
  const [stockModalFeed, setStockModalFeed] = useState<AlternativeFeedItem | null>(null);
  const [stockKgInput, setStockKgInput] = useState<number>(200);
  const [stockMinThreshold, setStockMinThreshold] = useState<number>(50);
  const [stockSupplier, setStockSupplier] = useState<string>('Produksi Mandiri / Lokal');

  // Calculator / Simulator State
  const relevantGroups = livestockGroups.filter((g) => g.category === activeCategory);
  const activePopulation = relevantGroups.reduce((acc, g) => acc + g.currentCount, 0);
  const defaultDailyFeedKg = Math.max(
    10,
    Math.round(activePopulation * (COMMODITY_INFO[activeCategory]?.feedDailyPerHeadKg || 0.115))
  );

  const mainFeeds = feedInventory.filter((f) => !f.isAlternative && f.type !== 'alternatif');
  const [selectedBaseFeedId, setSelectedBaseFeedId] = useState<string>(mainFeeds[0]?.id || '');
  const [customBaseFeedPrice, setCustomBaseFeedPrice] = useState<number>(mainFeeds[0]?.pricePerKg || 9200);
  const [selectedAltId, setSelectedAltId] = useState<string>(alternativeFeeds[0]?.id || '');
  const [dailyFeedKg, setDailyFeedKg] = useState<number>(defaultDailyFeedKg);
  const [substitutionPct, setSubstitutionPct] = useState<number>(10);
  const [rationNameInput, setRationNameInput] = useState<string>('');

  // AI Formulator State
  const [localIngredientsInput, setLocalIngredientsInput] = useState<string>(
    'Ampas tahu basah Rp 900/kg, dedak padi halus Rp 3.200/kg, daun pepaya/singkong di sekitar kebun, dan EM4 peternakan'
  );
  const [aiNotesInput, setAiNotesInput] = useState<string>('Ingin menekan biaya pakan harian minimal 15% tanpa menurunkan produksi.');
  const [aiFormulaResult, setAiFormulaResult] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered catalog
  const filteredCatalog = useMemo(() => {
    if (filterCategory === 'all') return alternativeFeeds;
    return alternativeFeeds.filter((item) => item.targetCategories.includes(filterCategory));
  }, [alternativeFeeds, filterCategory]);

  // Selected items for Calculator
  const selectedBaseFeed = mainFeeds.find((f) => f.id === selectedBaseFeedId);
  const basePricePerKg = selectedBaseFeed ? selectedBaseFeed.pricePerKg : customBaseFeedPrice;
  const baseFeedName = selectedBaseFeed ? selectedBaseFeed.name : 'Pakan Utama Pabrikan';
  const baseProteinEst = activeCategory === 'ayam_petelur' ? 17.5 : activeCategory === 'ayam_pedaging' ? 21 : 16;

  const selectedAltFeed = alternativeFeeds.find((a) => a.id === selectedAltId) || alternativeFeeds[0];

  // Real-time Substitution Calculation
  const calc = useMemo(() => {
    const altRatio = substitutionPct / 100;
    const baseRatio = 1 - altRatio;
    const altKgPerDay = Math.round(dailyFeedKg * altRatio * 10) / 10;
    const baseKgPerDay = Math.round((dailyFeedKg - altKgPerDay) * 10) / 10;

    const altPrice = selectedAltFeed?.estimatedCostPerKg || 2000;
    const costBeforeDay = dailyFeedKg * basePricePerKg;
    const costAfterDay = baseKgPerDay * basePricePerKg + altKgPerDay * altPrice;
    const savingsPerDay = Math.round(costBeforeDay - costAfterDay);
    const savingsPerMonth = savingsPerDay * 30;
    const savingsPct = costBeforeDay > 0 ? Math.round((savingsPerDay / costBeforeDay) * 1000) / 10 : 0;

    const altProtein = selectedAltFeed?.proteinPct || 20;
    const blendedProtein = Math.round((baseProteinEst * baseRatio + altProtein * altRatio) * 10) / 10;
    const exceedsSafetyLimit = selectedAltFeed ? substitutionPct > selectedAltFeed.maxSubstitutionPct : false;

    return {
      altKgPerDay,
      baseKgPerDay,
      costBeforeDay,
      costAfterDay,
      savingsPerDay,
      savingsPerMonth,
      savingsPct,
      blendedProtein,
      exceedsSafetyLimit,
    };
  }, [dailyFeedKg, substitutionPct, basePricePerKg, selectedAltFeed, baseProteinEst]);

  // Handlers
  const handleSimulateItem = (item: AlternativeFeedItem) => {
    setSelectedAltId(item.id);
    setSubstitutionPct(Math.min(10, item.maxSubstitutionPct));
    setRationNameInput(`Ransum ${COMMODITY_INFO[activeCategory]?.name.split(' ')[0]} + ${item.name.split(' ')[0]} ${Math.min(10, item.maxSubstitutionPct)}%`);
    setActiveSubTab('calculator');
  };

  const handleSaveNewAltFeed = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAlternativeFeed({
      name: newName,
      sourceType: newSourceType,
      targetCategories: newTargets.length > 0 ? newTargets : [activeCategory],
      proteinPct: newProtein,
      energyKcalPerKg: newEnergy,
      maxSubstitutionPct: newMaxSub,
      estimatedCostPerKg: newCostKg,
      preparationMethod: newPrep || 'Campurkan merata atau fermentasi sesuai kebutuhan ternak.',
      cautions: newCaution || 'Lakukan adaptasi pakan secara bertahap selama 5-7 hari.',
      nutritionalNote: 'Bahan pakan alternatif lokal terinput oleh peternak.',
      isCustom: true,
    });
    setIsAddModalOpen(false);
    setNewName('');
    setNewPrep('');
    setNewCaution('');
    showToast('Bahan pakan alternatif baru berhasil ditambahkan ke katalog!');
  };

  const handleConfirmAddToWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockModalFeed) return;
    onAddFeedToWarehouse({
      name: `${stockModalFeed.name} (Alternatif)`,
      category: activeCategory,
      type: 'alternatif',
      currentStockKg: stockKgInput,
      minThresholdKg: stockMinThreshold,
      pricePerKg: stockModalFeed.estimatedCostPerKg,
      supplier: stockSupplier,
      lastRestockedDate: new Date().toISOString().split('T')[0],
      isAlternative: true,
    });
    showToast(`${stockModalFeed.name} (${stockKgInput} kg) berhasil masuk ke stok gudang Persediaan!`);
    setStockModalFeed(null);
  };

  const handleSaveCurrentRation = () => {
    if (!selectedAltFeed) return;
    const defaultTitle =
      rationNameInput.trim() ||
      `Campuran ${selectedAltFeed.name.split(' ')[0]} (${substitutionPct}%)`;

    onSaveRation({
      name: defaultTitle,
      category: activeCategory,
      baseFeedName,
      baseFeedCostPerKg: basePricePerKg,
      alternativeFeedId: selectedAltFeed.id,
      alternativeFeedName: selectedAltFeed.name,
      substitutionPct,
      dailyTotalFeedKg: dailyFeedKg,
      savingsPerDayRp: calc.savingsPerDay,
      savingsPerMonthRp: calc.savingsPerMonth,
      blendedProteinPct: calc.blendedProtein,
      notes: calc.exceedsSafetyLimit
        ? `PERINGATAN: Melebihi batas aman ${selectedAltFeed.maxSubstitutionPct}%. Pantau produktivitas harian.`
        : `Formulasi aman dalam batas rekomendasi (${selectedAltFeed.maxSubstitutionPct}%).`,
      createdAt: new Date().toISOString().split('T')[0],
    });
    showToast(`Formulasi "${defaultTitle}" tersimpan!`);
  };

  const handleCreatePrepSchedule = () => {
    if (!selectedAltFeed) return;
    onAddSchedule({
      title: `Persiapan & Pemberian Pakan Alternatif: ${selectedAltFeed.name} (${calc.altKgPerDay} Kg)`,
      category: activeCategory,
      type: 'pakan',
      time: '14:00',
      frequency: 'harian',
      assignedTo: 'Anak Kandang',
      isCompleted: false,
      notes: `Substitusi ${substitutionPct}% (${calc.altKgPerDay} kg) bersama ${calc.baseKgPerDay} kg pakan utama. Metode: ${selectedAltFeed.preparationMethod}`,
    });
    showToast('Jadwal persiapan pakan alternatif berhasil ditambahkan ke menu Jadwal & Kegiatan!');
  };

  const handleAskAIFormula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localIngredientsInput.trim() || isGeneratingAI) return;
    setIsGeneratingAI(true);
    try {
      const advice = await generateAlternativeFeedFormula({
        commodityName: COMMODITY_INFO[activeCategory]?.name || activeCategory,
        populationCount: activePopulation || 500,
        localIngredients: localIngredientsInput,
        currentFeedPricePerKg: basePricePerKg,
        targetNotes: aiNotesInput,
      });
      setAiFormulaResult(advice);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const toggleTargetCategory = (cat: LivestockCategory) => {
    setNewTargets((prev) =>
      prev.includes(cat) ? (prev.length > 1 ? prev.filter((c) => c !== cat) : prev) : [...prev, cat]
    );
  };

  const totalMonthlySavings = savedRations
    .filter((r) => r.category === activeCategory)
    .reduce((acc, r) => acc + r.savingsPerMonthRp, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-xl border border-emerald-700 flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner (standalone vs embedded inside Persediaan) */}
      {!embedded ? (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">Pakan Alternatif & Formulasi Hemat</h2>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                {COMMODITY_INFO[activeCategory]?.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tekan biaya pakan hingga 20-35% secara aman menggunakan bahan lokal (Maggot BSF, Azolla, Fermentasi Agroindustri) tanpa menurunkan produktivitas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('ai_formulator')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Racik Formulasi AI</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tambah Bahan Lokal</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-emerald-950">
              Pakan Alternatif & Simulasi Substitusi Hemat Biaya
            </h3>
            <p className="text-xs text-emerald-800/90 mt-0.5">
              Kelola bahan pakan lokal, hitung penghematan ransum, racik dengan AI, atau masukkan ke stok gudang.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveSubTab('ai_formulator')}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Racik AI</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Tambah Bahan Lokal</span>
            </button>
          </div>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Katalog Bahan Lokal</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{alternativeFeeds.length} Bahan</span>
          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
            {alternativeFeeds.filter((a) => a.targetCategories.includes(activeCategory)).length} cocok untuk komoditas ini
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Stok Alternatif Gudang</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">
            {feedInventory
              .filter((f) => f.isAlternative || f.type === 'alternatif')
              .reduce((acc, f) => acc + f.currentStockKg, 0)
              .toLocaleString('id-ID')}{' '}
            Kg
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Tersinkronisasi ke Persediaan</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Formulasi Tersimpan</span>
          <span className="text-xl font-black text-slate-900 mt-1 block">{savedRations.length} Resep</span>
          <span className="text-[11px] text-slate-500 block mt-1">Siap diterapkan di kandang</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Potensi Hemat / Bln</span>
            <TrendingDown className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl font-black text-emerald-700 mt-1 block">
            Rp {(totalMonthlySavings / 1000000).toFixed(2)} Jt
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">Estimasi efisiensi ransum aktif</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'catalog'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sprout className="w-4 h-4" />
          <span>Katalog Bahan Alternatif</span>
        </button>

        <button
          onClick={() => setActiveSubTab('calculator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'calculator'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Kalkulator Substitusi & Hemat Biaya</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ai_formulator')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
            activeSubTab === 'ai_formulator'
              ? 'bg-emerald-800 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>Konsultan Formulasi AI</span>
        </button>
      </div>

      {/* SUB-TAB 1: KATALOG PAKAN ALTERNATIF */}
      {activeSubTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">
              Menampilkan {filteredCatalog.length} bahan pakan alternatif terverifikasi zoooteknis
            </span>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl text-xs font-semibold text-slate-700 border border-slate-200 self-start sm:self-auto">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Komoditas Ternak</option>
                {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {COMMODITY_INFO[c].name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {SOURCE_LABELS[item.sourceType]}
                    </span>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      ~Rp {item.estimatedCostPerKg.toLocaleString('id-ID')}/kg
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-snug">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.nutritionalNote}</p>
                  </div>

                  {/* Nutrition Grid */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Protein</span>
                      <span className="text-xs font-black text-slate-900">{item.proteinPct}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Energi</span>
                      <span className="text-xs font-black text-slate-900">{item.energyKcalPerKg} Kkal</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Batas Aman</span>
                      <span className="text-xs font-black text-emerald-700">Maks {item.maxSubstitutionPct}%</span>
                    </div>
                  </div>

                  {/* Prep & Caution */}
                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                      <span className="font-bold text-slate-800 block text-[11px] mb-0.5">Cara Pengolahan:</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{item.preparationMethod}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-amber-900 leading-relaxed">{item.cautions}</p>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleSimulateItem(item)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Simulasikan</span>
                  </button>

                  <button
                    onClick={() => {
                      setStockModalFeed(item);
                      setStockKgInput(200);
                    }}
                    className="flex items-center justify-center gap-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                    title="Masukkan ke Gudang Persediaan"
                  >
                    <Boxes className="w-3.5 h-3.5 text-emerald-700" />
                    <span>+ Stok</span>
                  </button>

                  {item.isCustom && (
                    <button
                      onClick={() => onDeleteAlternativeFeed(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Bahan Kustom"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: KALKULATOR SUBSTITUSI & SAVED RATIONS */}
      {activeSubTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Simulator Controls & Live Results */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-5">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-700" />
                <span>Simulator Substitusi Pakan ({COMMODITY_INFO[activeCategory]?.name})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hitung takaran pencampuran dan penghematan biaya harian tanpa melampaui batas aman nutrisi ternak.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pakan Utama (Pabrikan/Konsentrat)
                </label>
                <select
                  value={selectedBaseFeedId}
                  onChange={(e) => {
                    setSelectedBaseFeedId(e.target.value);
                    const found = mainFeeds.find((f) => f.id === e.target.value);
                    if (found) setCustomBaseFeedPrice(found.pricePerKg);
                  }}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                >
                  {mainFeeds.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (Rp {f.pricePerKg.toLocaleString('id-ID')}/kg)
                    </option>
                  ))}
                  <option value="">Input Harga Pakan Manual</option>
                </select>
                {!selectedBaseFeed && (
                  <input
                    type="number"
                    value={customBaseFeedPrice}
                    onChange={(e) => setCustomBaseFeedPrice(Number(e.target.value))}
                    className="mt-2 w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    placeholder="Harga pakan utama (Rp/kg)"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Pilih Pakan Alternatif Pengganti
                </label>
                <select
                  value={selectedAltId}
                  onChange={(e) => setSelectedAltId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                >
                  {alternativeFeeds.map((alt) => (
                    <option key={alt.id} value={alt.id}>
                      {alt.name} (Rp {alt.estimatedCostPerKg.toLocaleString('id-ID')}/kg • Maks {alt.maxSubstitutionPct}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Total Kebutuhan Pakan Harian (Kg/Hari)
                </label>
                <input
                  type="number"
                  min="1"
                  value={dailyFeedKg}
                  onChange={(e) => setDailyFeedKg(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold text-slate-900"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Rekomendasi populasi {activePopulation} ekor: ~{defaultDailyFeedKg} kg/hari
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Nama Resep Formulasi (Untuk Disimpan)
                </label>
                <input
                  type="text"
                  value={rationNameInput}
                  onChange={(e) => setRationNameInput(e.target.value)}
                  placeholder={`Campuran ${selectedAltFeed?.name.split(' ')[0] || 'Alternatif'} ${substitutionPct}%`}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            {/* Slider Persentase Substitusi */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Persentase Substitusi Pakan Alternatif: <strong className="text-emerald-800 text-sm">{substitutionPct}%</strong>
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  calc.exceedsSafetyLimit
                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  Batas Aman: Maks {selectedAltFeed?.maxSubstitutionPct || 15}%
                </span>
              </div>

              <input
                type="range"
                min="2"
                max="40"
                step="1"
                value={substitutionPct}
                onChange={(e) => setSubstitutionPct(Number(e.target.value))}
                className="w-full accent-emerald-700 cursor-pointer"
              />

              {calc.exceedsSafetyLimit && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-900">
                  <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Peringatan Nutrisi:</strong> Substitusi {substitutionPct}% melebihi batas aman biologis untuk{' '}
                    <strong>{selectedAltFeed?.name}</strong> (maksimal {selectedAltFeed?.maxSubstitutionPct}%). Risiko penurunan HDP telur, bobot, atau gangguan cerna.
                  </p>
                </div>
              )}
            </div>

            {/* Output Comparison Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Takaran Pakan Utama</span>
                <span className="text-base font-black text-slate-900">{calc.baseKgPerDay} Kg/hr</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">Takaran Alternatif</span>
                <span className="text-base font-black text-emerald-800">{calc.altKgPerDay} Kg/hr</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Protein Campuran</span>
                <span className="text-base font-black text-slate-900">~{calc.blendedProtein}% PK</span>
              </div>
              <div className="p-3 bg-emerald-800 text-white rounded-xl shadow-sm">
                <span className="text-[10px] font-bold text-emerald-200 uppercase block">Penghematan / Bulan</span>
                <span className="text-base font-black">
                  Rp {(calc.savingsPerMonth / 1000000).toFixed(2)} Jt
                </span>
                <span className="text-[10px] text-emerald-200 block">Turun {calc.savingsPct}% biaya pakan</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={handleCreatePrepSchedule}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
              >
                <CalendarClock className="w-4 h-4 text-emerald-700" />
                <span>Buat Jadwal Persiapan Pakan</span>
              </button>

              <button
                onClick={handleSaveCurrentRation}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>Simpan Formulasi Ransum</span>
              </button>
            </div>
          </div>

          {/* Right 1 Col: Saved Rations */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Formulasi Tersimpan</h4>
              <span className="text-xs text-slate-500">{savedRations.length} Resep</span>
            </div>

            {savedRations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                Belum ada formulasi tersimpan. Gunakan kalkulator di sebelah kiri untuk menyimpan resep hemat biaya.
              </p>
            ) : (
              <div className="space-y-3">
                {savedRations.map((rat) => (
                  <div
                    key={rat.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {COMMODITY_INFO[rat.category]?.name.split(' ')[0]} • Sub {rat.substitutionPct}%
                        </span>
                        <h5 className="font-bold text-slate-900 text-xs mt-1">{rat.name}</h5>
                      </div>
                      <button
                        onClick={() => onDeleteRation(rat.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Hapus Resep"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-600 space-y-0.5">
                      <div>Alternatif: <strong>{rat.alternativeFeedName}</strong></div>
                      <div>Total Pakan: {rat.dailyTotalFeedKg} kg/hari • Est. Protein: {rat.blendedProteinPct}%</div>
                      <div className="text-emerald-700 font-bold">
                        Hemat Rp {rat.savingsPerMonthRp.toLocaleString('id-ID')}/bulan
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: KONSULTAN FORMULASI AI */}
      {activeSubTab === 'ai_formulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleAskAIFormula} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-base">Racik Formulasi Pakan Lokal dengan AI</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Sebutkan bahan baku atau limbah pertanian murah yang tersedia di daerah Anda. Ahli Nutrisi AI FARMOVA akan meracik rasio aman untuk <strong>{COMMODITY_INFO[activeCategory]?.name}</strong>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Bahan Pakan Lokal yang Tersedia di Sekitar Farm
              </label>
              <textarea
                rows={4}
                value={localIngredientsInput}
                onChange={(e) => setLocalIngredientsInput(e.target.value)}
                placeholder="Contoh: Ampas kelapa, keong mas sawah, dedak padi, eceng gondok..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Target & Kondisi Khusus Ternak
              </label>
              <input
                type="text"
                value={aiNotesInput}
                onChange={(e) => setAiNotesInput(e.target.value)}
                placeholder="Contoh: Fokus mempertahankan ukuran telur atau penggemukan cepat..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
              Konteks Terbaca Otomatis: <strong>{activePopulation || 500} ekor {COMMODITY_INFO[activeCategory]?.name}</strong> • Harga pakan utama referensi <strong>Rp {basePricePerKg.toLocaleString('id-ID')}/kg</strong>.
            </div>

            <button
              type="submit"
              disabled={isGeneratingAI || !localIngredientsInput.trim()}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menghitung Profil Nutrisi & Fermentasi...</span>
                </>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4" />
                  <span>Susun Formula Pakan Alternatif AI</span>
                </>
              )}
            </button>
          </form>

          {/* AI Result Box */}
          <div className="bg-[#112d1f] text-white rounded-2xl border border-emerald-900 shadow-sm p-5 sm:p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-800/70 pb-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Hasil Rekomendasi Formulator Nutrisi</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-200">
                  Berbasis Literatur Zooteknik
                </span>
              </div>

              {aiFormulaResult ? (
                <div className="text-xs sm:text-sm text-emerald-50/95 whitespace-pre-line leading-relaxed max-h-[420px] overflow-y-auto pr-1">
                  {aiFormulaResult}
                </div>
              ) : (
                <div className="py-16 text-center text-emerald-200/60 text-xs space-y-2">
                  <FlaskConical className="w-10 h-10 mx-auto opacity-40" />
                  <p>
                    Masukkan daftar bahan baku lokal di panel sebelah kiri, lalu klik <strong>"Susun Formula Pakan Alternatif AI"</strong> untuk mendapatkan komposisi persentase, metode fermentasi, dan analisis penghematannya.
                  </p>
                </div>
              )}
            </div>

            {aiFormulaResult && (
              <div className="mt-4 pt-3 border-t border-emerald-800/70 flex items-center justify-between text-[11px] text-emerald-300">
                <span>Selalu lakukan uji coba bertahap selama 5-7 hari.</span>
                <button
                  onClick={() => setActiveSubTab('calculator')}
                  className="flex items-center gap-1 font-bold text-white hover:underline cursor-pointer"
                >
                  <span>Buka Kalkulator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL TAMBAH BAHAN PAKAN ALTERNATIF KUSTOM */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-slate-200 my-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Tambah Bahan Pakan Alternatif Lokal</h3>
                <p className="text-xs text-slate-500">Catat bahan pakan lokal baru beserta profil nutrisi dan batas amannya.</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-800">✕</button>
            </div>

            <form onSubmit={handleSaveNewAltFeed} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Bahan Pakan</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Keong Mas Rebus Giling / Tepung Daun Kelor"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sumber Bahan</label>
                  <select
                    value={newSourceType}
                    onChange={(e) => setNewSourceType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    {(Object.keys(SOURCE_LABELS) as AlternativeFeedItem['sourceType'][]).map((k) => (
                      <option key={k} value={k}>{SOURCE_LABELS[k]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Estimasi Biaya (Rp/Kg)</label>
                  <input
                    type="number"
                    value={newCostKg}
                    onChange={(e) => setNewCostKg(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Protein (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newProtein}
                    onChange={(e) => setNewProtein(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Energi (Kkal)</label>
                  <input
                    type="number"
                    value={newEnergy}
                    onChange={(e) => setNewEnergy(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Batas Aman (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={newMaxSub}
                    onChange={(e) => setNewMaxSub(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cocok Untuk Ternak</label>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((cat) => {
                    const selected = newTargets.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleTargetCategory(cat)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer flex items-center gap-1 ${
                          selected
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {selected && <Check className="w-3 h-3" />}
                        <span>{COMMODITY_INFO[cat].name.split(' (')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cara Pengolahan / Fermentasi</label>
                <textarea
                  rows={2}
                  value={newPrep}
                  onChange={(e) => setNewPrep(e.target.value)}
                  placeholder="Contoh: Rebus 15 menit, tiriskan, lalu giling halus bersama dedak..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Peringatan / Batasan Risiko</label>
                <input
                  type="text"
                  value={newCaution}
                  onChange={(e) => setNewCaution(e.target.value)}
                  placeholder="Contoh: Hindari pemberian berlebihan pada fase starter"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan ke Katalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MASUKKAN KE STOK GUDANG PERSEDIAAN */}
      {stockModalFeed && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Masukkan ke Stok Gudang</h3>
            <p className="text-xs text-slate-500 mb-4">
              Catat persediaan <strong>{stockModalFeed.name}</strong> ke modul Persediaan agar terpantau otomatis.
            </p>

            <form onSubmit={handleConfirmAddToWarehouse} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Jumlah Stok Awal (Kg)</label>
                <input
                  type="number"
                  min="1"
                  value={stockKgInput}
                  onChange={(e) => setStockKgInput(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-emerald-800"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Batas Peringatan Menipis (Kg)</label>
                <input
                  type="number"
                  min="1"
                  value={stockMinThreshold}
                  onChange={(e) => setStockMinThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Sumber / Pemasok Lokal</label>
                <input
                  type="text"
                  value={stockSupplier}
                  onChange={(e) => setStockSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setStockModalFeed(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan ke Persediaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
