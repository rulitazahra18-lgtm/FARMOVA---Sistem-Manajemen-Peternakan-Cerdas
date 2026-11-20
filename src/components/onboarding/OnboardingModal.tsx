import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft, 
  Layers, 
  Wallet, 
  Target, 
  HelpCircle,
  Building2,
  TrendingUp,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  FarmProfile, 
  LivestockCategory, 
  OnboardingCalculationResult 
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';
import { calculateFarmFeasibility } from '../../services/calculationEngine';
import { evaluateFeasibilityWithAI } from '../../services/api';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: FarmProfile;
  onSaveProfile: (profile: FarmProfile, initialResult?: OnboardingCalculationResult) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [farmName, setFarmName] = useState(currentProfile.farmName || 'Peternakan Berkah Nusantara');
  const [ownerName, setOwnerName] = useState(currentProfile.ownerName || 'Haji Ahmad Santoso');
  const [location, setLocation] = useState(currentProfile.location || 'Sukabumi, Jawa Barat');
  const [planningMethod, setPlanningMethod] = useState<'capital' | 'target'>(currentProfile.planningMethod || 'capital');
  const [selectedCategories, setSelectedCategories] = useState<LivestockCategory[]>(
    currentProfile.selectedCategories.length > 0 ? currentProfile.selectedCategories : ['ayam_petelur']
  );
  const [activePrimaryCategory, setActivePrimaryCategory] = useState<LivestockCategory>(
    currentProfile.activeCategory || 'ayam_petelur'
  );

  // Financial & Facility Inputs
  const [initialCapital, setInitialCapital] = useState<number>(currentProfile.initialCapital || 100000000);
  const [targetProfitPerMonth, setTargetProfitPerMonth] = useState<number>(currentProfile.targetProfitPerMonth || 15000000);
  const [landAreaM2, setLandAreaM2] = useState<number>(currentProfile.landAreaM2 || 1000);
  const [barnCapacity, setBarnCapacity] = useState<number>(currentProfile.barnCapacity || 2000);

  // Price parameters overrides (optional)
  const [customFeedPrice, setCustomFeedPrice] = useState<number>(7800);
  const [customSellingPrice, setCustomSellingPrice] = useState<number>(1850);

  // Calculation & AI Evaluation
  const [calcResult, setCalcResult] = useState<OnboardingCalculationResult | null>(null);
  const [aiReview, setAiReview] = useState<string>('');
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleCategory = (cat: LivestockCategory) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length === 1) return; // Keep at least one
      const updated = selectedCategories.filter((c) => c !== cat);
      setSelectedCategories(updated);
      if (activePrimaryCategory === cat) {
        setActivePrimaryCategory(updated[0]);
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleRunCalculation = async () => {
    const result = calculateFarmFeasibility({
      method: planningMethod,
      category: activePrimaryCategory,
      capitalAmount: initialCapital,
      targetProfitPerMonth,
      landAreaM2,
      barnCapacityLimit: barnCapacity,
      feedPricePerKg: customFeedPrice,
      sellingPricePerUnit: customSellingPrice,
    });
    setCalcResult(result);
    setStep(3);

    // Call AI Evaluation
    setIsLoadingAI(true);
    try {
      const evaluation = await evaluateFeasibilityWithAI(planningMethod, {
        farmName,
        category: activePrimaryCategory,
        capital: initialCapital,
        targetProfit: targetProfitPerMonth,
        landAreaM2,
        barnCapacity,
      }, result);
      setAiReview(evaluation);
    } catch {
      setAiReview('Rencana usaha memiliki parameter yang realistis. Pastikan ketersediaan pasokan pakan dan bibit berkualitas.');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleConfirmAndFinish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const updatedProfile: FarmProfile = {
      ...currentProfile,
      farmName,
      ownerName,
      location,
      planningMethod,
      selectedCategories,
      activeCategory: activePrimaryCategory,
      landAreaM2,
      barnCapacity,
      initialCapital,
      targetProfitPerMonth,
    };

    onSaveProfile(updatedProfile, calcResult || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#112d1f] text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-700/80 text-emerald-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pengaturan & Perencanaan Peternakan</h2>
              <p className="text-xs text-emerald-300">
                Langkah {step} dari 4: {
                  step === 1 ? 'Profil & Pemilihan Komoditas' :
                  step === 2 ? 'Metode & Parameter Finansial' :
                  step === 3 ? 'Kalkulasi Kelayakan & Evaluasi AI' :
                  'Konfirmasi & Ringkasan Rencana'
                }
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="grid grid-cols-4 bg-slate-100 h-1.5">
          <div className={`h-full bg-emerald-600 transition-all ${step >= 1 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-emerald-600 transition-all ${step >= 2 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-emerald-600 transition-all ${step >= 3 ? 'opacity-100' : 'opacity-0'}`} />
          <div className={`h-full bg-emerald-600 transition-all ${step >= 4 ? 'opacity-100' : 'opacity-0'}`} />
        </div>

        {/* Body Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">

          {/* STEP 1: PROFIL & KOMODITAS */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Peternakan
                  </label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="Contoh: Peternakan Barokah Jaya"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nama Pemilik / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Contoh: H. Ahmad Santoso"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Lokasi Peternakan (Wilayah / Kabupaten)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Sukabumi, Jawa Barat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
                />
              </div>

              {/* Commodity Selector (Multi-select) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Pilih Komoditas Ternak yang Dikelola (Bisa Lebih Dari 1)
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold">
                    {selectedCategories.length} Dipilih
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(COMMODITY_INFO) as LivestockCategory[]).map((catKey) => {
                    const info = COMMODITY_INFO[catKey];
                    const isSelected = selectedCategories.includes(catKey);
                    const isPrimary = activePrimaryCategory === catKey;

                    return (
                      <div
                        key={catKey}
                        onClick={() => toggleCategory(catKey)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-xs sm:text-sm">{info.name}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          Satuan: {info.scientificUnit}
                        </span>

                        {isSelected && (
                          <div className="mt-2 pt-1 border-t border-emerald-200/60 flex items-center justify-between">
                            <span className="text-[10px] text-emerald-800 font-medium">Komoditas Utama?</span>
                            <input
                              type="radio"
                              name="primaryCat"
                              checked={isPrimary}
                              onChange={() => setActivePrimaryCategory(catKey)}
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: METODE PERENCANAAN & PARAMETER */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Planning Method Card Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Pendekatan Perencanaan Usaha
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setPlanningMethod('capital')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      planningMethod === 'capital'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Metode Sesuai Modal (Budget-First)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Sistem menghitung kapasitas ternak maksimal, kebutuhan pakan, dan proyeksi keuntungan berdasarkan anggaran dana yang Anda miliki saat ini.
                    </p>
                  </div>

                  <div
                    onClick={() => setPlanningMethod('target')}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                      planningMethod === 'target'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
                        <Target className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">Metode Sesuai Target (Goal-First)</h4>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Tentukan target laba bersih per bulan. Sistem akan menghitung mundur populasi ternak, luas kandang, dan estimasi modal yang wajib disiapkan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Inputs based on Method */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                {planningMethod === 'capital' ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Total Modal Awal yang Tersedia (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">Rp</span>
                      <input
                        type="number"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(Number(e.target.value))}
                        className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 font-semibold"
                        placeholder="Contoh: 100000000"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Format: Rp {initialCapital.toLocaleString('id-ID')}
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Target Keuntungan Bersih Per Bulan (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-sm">Rp</span>
                      <input
                        type="number"
                        value={targetProfitPerMonth}
                        onChange={(e) => setTargetProfitPerMonth(Number(e.target.value))}
                        className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900 font-semibold"
                        placeholder="Contoh: 15000000"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Target: Rp {targetProfitPerMonth.toLocaleString('id-ID')} / bulan
                    </p>
                  </div>
                )}

                {/* Facility Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Luas Lahan yang Tersedia (m²)
                    </label>
                    <input
                      type="number"
                      value={landAreaM2}
                      onChange={(e) => setLandAreaM2(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Kapasitas Kandang Maksimal (Ekor)
                    </label>
                    <input
                      type="number"
                      value={barnCapacity}
                      onChange={(e) => setBarnCapacity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm text-slate-900"
                    />
                  </div>
                </div>

                {/* Local Price Assumptions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Asumsi Harga Pakan (Rp/Kg)
                    </label>
                    <input
                      type="number"
                      value={customFeedPrice}
                      onChange={(e) => setCustomFeedPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Asumsi Harga Jual Hasil (Rp/Satuan)
                    </label>
                    <input
                      type="number"
                      value={customSellingPrice}
                      onChange={(e) => setCustomSellingPrice(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: HASIL KALKULASI & EVALUASI AI */}
          {step === 3 && calcResult && (
            <div className="space-y-6">
              {/* Feasibility Badge */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                calcResult.feasibilityScore === 'Tinggi' 
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : calcResult.feasibilityScore === 'Moderat'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                {calcResult.feasibilityScore === 'Tinggi' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">Status Kelayakan: {calcResult.feasibilityScore}</h4>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/80 font-semibold border">
                      BEP: ~{calcResult.breakEvenMonths} Bulan
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90 leading-relaxed">
                    Berdasarkan perhitungan teknis agribisnis untuk komoditas{' '}
                    <strong>{COMMODITY_INFO[activePrimaryCategory]?.name}</strong>.
                  </p>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Rekomendasi Populasi</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {calcResult.recommendedStock.toLocaleString('id-ID')} Ekor
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Kebutuhan Pakan / Bln</span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {calcResult.feedNeededKgTotal.toLocaleString('id-ID')} Kg
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Estimasi Omzet / Bln</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-700">
                    Rp {(calcResult.estimatedRevenueMonthly / 1000000).toFixed(1)} Jt
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Estimasi Laba Bersih</span>
                  <span className="text-base sm:text-lg font-bold text-emerald-800">
                    Rp {(calcResult.estimatedProfitMonthly / 1000000).toFixed(1)} Jt/bln
                  </span>
                </div>
              </div>

              {/* Budget Allocation Breakdown */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
                  Rincian Anggaran Kebutuhan & Dana Darurat
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Biaya Pembelian Bibit / DOC / Bakalan:</span>
                    <span className="font-semibold text-slate-900">Rp {calcResult.estimatedLivestockCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Biaya Pakan Fase Awal (1 Bulan):</span>
                    <span className="font-semibold text-slate-900">Rp {calcResult.estimatedFeedCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Cadangan Dana Darurat (Buffer Medis & Cuaca):</span>
                    <span className="font-semibold text-amber-700">Rp {calcResult.emergencyBufferCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between py-1.5 font-bold text-slate-900 text-sm">
                    <span>Total Estimasi Modal Disiapkan:</span>
                    <span className="text-emerald-700">Rp {calcResult.totalBudgetNeeded.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* AI Expert Review */}
              <div className="p-4 rounded-xl bg-emerald-950 text-white border border-emerald-800 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Audit Cerdas AI Peternakan FARMOVA</span>
                  {isLoadingAI && <Loader2 className="w-3.5 h-3.5 animate-spin ml-2" />}
                </div>
                <div className="text-xs text-emerald-100/90 whitespace-pre-line leading-relaxed">
                  {aiReview || 'Sedang menghubungkan ke mesin analisis Gemini AI...'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: KONFIRMASI & PERSETUJUAN */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Siap Memulai Pengelolaan Peternakan</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Data perencanaan awal akan disinkronkan ke dalam sistem dasbor operasional Anda. Seluruh catatan dapat diperbarui sewaktu-waktu seiring data riil di kandang.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Ringkasan Konfigurasi Peternakan
                </h4>
                <div className="grid grid-cols-2 gap-y-2 text-slate-600">
                  <div>Peternakan: <strong className="text-slate-900">{farmName}</strong></div>
                  <div>Pemilik: <strong className="text-slate-900">{ownerName}</strong></div>
                  <div>Lokasi: <strong className="text-slate-900">{location}</strong></div>
                  <div>Komoditas Utama: <strong className="text-slate-900">{COMMODITY_INFO[activePrimaryCategory]?.name}</strong></div>
                  <div>Metode Usaha: <strong className="text-slate-900">{planningMethod === 'capital' ? 'Sesuai Modal' : 'Sesuai Target Laba'}</strong></div>
                  <div>Luas Lahan: <strong className="text-slate-900">{landAreaM2} m²</strong></div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Prinsip FARMOVA:</strong> Angka hasil perhitungan ini merupakan proyeksi agribisnis awal. Setelah masuk ke dasbor, sistem akan menggunakan <strong>data pencatatan riil harian</strong> sebagai dasar analisis performa aktual.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Batal
            </button>
          )}

          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <span>Lanjut ke Parameter</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 2 && (
            <button
              onClick={handleRunCalculation}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>Hitung Kelayakan & Audit AI</span>
            </button>
          )}

          {step === 3 && (
            <button
              onClick={() => setStep(4)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-md shadow-emerald-950/20"
            >
              <span>Setujui & Konfirmasi Data</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {step === 4 && (
            <button
              onClick={handleConfirmAndFinish}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-lg shadow-emerald-950/30"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Simpan & Masuk Dasbor</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
