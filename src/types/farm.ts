export type LivestockCategory = 
  | 'ayam_petelur' 
  | 'ayam_pedaging' 
  | 'bebek_petelur' 
  | 'sapi_perah' 
  | 'sapi_potong' 
  | 'kambing_domba';

export interface LivestockCommodityInfo {
  id: LivestockCategory;
  name: string;
  scientificUnit: string; // butir/kg/ekor/liter
  cycleDays: number;
  feedDailyPerHeadKg: number;
  standardFCRorHDP: string;
  icon: string;
}

export interface FarmProfile {
  id: string;
  farmName: string;
  ownerName: string;
  location: string;
  selectedCategories: LivestockCategory[];
  activeCategory: LivestockCategory;
  landAreaM2: number;
  barnCapacity: number;
  initialCapital: number;
  planningMethod: 'capital' | 'target';
  targetProfitPerMonth?: number;
  notes?: string;
  createdAt: string;
}

export interface Barn {
  id: string;
  name: string;
  category: LivestockCategory;
  capacity: number;
  currentCount: number;
  temperatureC?: number;
  humidityPct?: number;
  status: 'optimal' | 'warning' | 'critical';
}

export interface LivestockGroup {
  id: string;
  name: string;
  category: LivestockCategory;
  barnId: string;
  initialCount: number;
  currentCount: number;
  mortalityCount: number;
  arrivalDate: string;
  currentAgeWeeksOrMonths: string;
  phase: 'starter' | 'grower' | 'finisher' | 'layer' | 'laktasi' | 'bunting' | 'penggemukan';
  averageWeightKg?: number;
  healthStatus: 'sehat' | 'perhatian' | 'karantina';
  notes?: string;
}

export interface ProductionRecord {
  id: string;
  date: string;
  category: LivestockCategory;
  groupId: string;
  // Specific metrics based on species
  eggCountGood?: number; // Telur utuh (Ayam/Bebek Petelur)
  eggCountDamaged?: number; // Telur retak/rusak
  eggTotalKg?: number;
  eggTraysCount?: number; // Rak telur (30 butir per rak)
  milkLiters?: number; // Sapi Perah
  milkFatPct?: number;
  sampleWeightKg?: number; // Broiler / Sapi Potong / Kambing
  feedGivenKg: number;
  hdpPercentage?: number; // Hen-Day Production %
  mortalityToday: number;
  recordedBy: string;
  notes?: string;
}

export interface FeedInventoryItem {
  id: string;
  name: string;
  category: LivestockCategory | 'umum';
  type: 'konsentrat' | 'jagung' | 'dedak' | 'hijauan' | 'mineral' | 'starter' | 'finisher' | 'alternatif';
  currentStockKg: number;
  minThresholdKg: number;
  pricePerKg: number;
  supplier: string;
  lastRestockedDate: string;
  isAlternative?: boolean;
}

export interface AlternativeFeedItem {
  id: string;
  name: string;
  sourceType: 'serangga' | 'tanaman_air' | 'limbah_agro' | 'hijauan_unggul' | 'fermentasi';
  targetCategories: LivestockCategory[];
  proteinPct: number;
  energyKcalPerKg: number;
  maxSubstitutionPct: number; // Batas aman substitusi terhadap total ransum (%)
  estimatedCostPerKg: number;
  preparationMethod: string;
  cautions: string;
  nutritionalNote: string;
  isCustom?: boolean;
}

export interface SavedAlternativeRation {
  id: string;
  name: string;
  category: LivestockCategory;
  baseFeedName: string;
  baseFeedCostPerKg: number;
  alternativeFeedId: string;
  alternativeFeedName: string;
  substitutionPct: number;
  dailyTotalFeedKg: number;
  savingsPerDayRp: number;
  savingsPerMonthRp: number;
  blendedProteinPct: number;
  notes?: string;
  createdAt: string;
}

export interface MedicineInventoryItem {
  id: string;
  name: string;
  purpose: 'vaksin' | 'vitamin' | 'antibiotik' | 'disinfektan' | 'obat_cacing';
  targetCategory: LivestockCategory | 'umum';
  currentStockUnit: number;
  unit: string;
  expiryDate: string;
}

export interface FarmSchedule {
  id: string;
  title: string;
  category: LivestockCategory | 'semua';
  type: 'pakan' | 'vaksin' | 'kebersihan' | 'timbang' | 'pemerahan' | 'pemeriksaan';
  time: string; // e.g. "07:00"
  frequency: 'harian' | 'mingguan' | 'bulanan' | 'terjadwal';
  specificDay?: string;
  assignedTo: string;
  isCompleted: boolean;
  notes: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 'penjualan_telur' | 'penjualan_daging' | 'penjualan_susu' | 'penjualan_ternak' | 'beli_pakan' | 'beli_obat' | 'listrik_air' | 'upah_karyawan' | 'peralatan' | 'modal_awal' | 'lainnya';
  amount: number;
  isProjection: boolean; // Menandai estimasi vs aktual
  description: string;
  receiptNumber?: string;
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    title: string;
    type: FarmSchedule['type'];
    time: string;
  };
}

export interface OnboardingCalculationResult {
  recommendedCapacity: number;
  recommendedStock: number;
  feedNeededKgTotal: number;
  estimatedFeedCost: number;
  estimatedLivestockCost: number;
  estimatedOperationalCost: number;
  emergencyBufferCost: number;
  totalBudgetNeeded: number;
  estimatedRevenueMonthly: number;
  estimatedProfitMonthly: number;
  breakEvenMonths: number;
  feasibilityScore: 'Tinggi' | 'Moderat' | 'Butuh Penyesuaian';
  criticalNotes: string[];
}
