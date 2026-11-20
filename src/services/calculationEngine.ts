import { LivestockCategory, OnboardingCalculationResult } from '../types/farm';

export interface CalculationInput {
  method: 'capital' | 'target';
  category: LivestockCategory;
  capitalAmount?: number; // jika method 'capital'
  targetProfitPerMonth?: number; // jika method 'target'
  landAreaM2: number;
  barnCapacityLimit?: number;
  docOrSeedPrice?: number;
  feedPricePerKg?: number;
  sellingPricePerUnit?: number;
}

// Parameter referensi standar peternakan Indonesia
const COMMODITY_STANDARDS: Record<LivestockCategory, {
  spacePerHeadM2: number;
  feedDailyPerHeadKg: number;
  cycleLengthDays: number;
  defaultDOCPrice: number;
  defaultFeedPriceKg: number;
  defaultSellingPrice: number; // per butir telur, per kg daging, per liter susu
  productivityRate: number; // HDP 0.85, Broiler survival 0.96, Dairy 16 liter/day
  marginPerHeadEstimateMonth: number;
}> = {
  ayam_petelur: {
    spacePerHeadM2: 0.1, // 10-12 ekor per m2 kandang baterai
    feedDailyPerHeadKg: 0.115,
    cycleLengthDays: 560,
    defaultDOCPrice: 14000, // Pullet siap bertelur 16-18 minggu: ~Rp 75.000 - 85.000 / atau DOC ~Rp 14.000
    defaultFeedPriceKg: 7800,
    defaultSellingPrice: 1800, // Rp 1.800 per butir (~Rp 27.000/kg)
    productivityRate: 0.85, // 85% Hen Day
    marginPerHeadEstimateMonth: 18000, // Laba bersih ~Rp 18.000 per ekor per bulan
  },
  ayam_pedaging: {
    spacePerHeadM2: 0.1, // 10 ekor / m2 di closed house
    feedDailyPerHeadKg: 0.095,
    cycleLengthDays: 35,
    defaultDOCPrice: 7500, // DOC Broiler
    defaultFeedPriceKg: 9500,
    defaultSellingPrice: 21000, // Rp 21.000 / kg hidup
    productivityRate: 0.96, // 96% panen
    marginPerHeadEstimateMonth: 5500, // Laba bersih rata-rata Rp 5.000 - 6.500 per ekor per siklus
  },
  bebek_petelur: {
    spacePerHeadM2: 0.25, // 4 ekor / m2
    feedDailyPerHeadKg: 0.15,
    cycleLengthDays: 450,
    defaultDOCPrice: 12000,
    defaultFeedPriceKg: 6500,
    defaultSellingPrice: 2400, // Rp 2.400 per butir telur bebek
    productivityRate: 0.70, // 70% HDP
    marginPerHeadEstimateMonth: 16000,
  },
  sapi_perah: {
    spacePerHeadM2: 12, // 12 m2 per ekor sapi dewasa
    feedDailyPerHeadKg: 40,
    cycleLengthDays: 305, // masa laktasi
    defaultDOCPrice: 24000000, // Harga bibit dara bunting/laktasi Rp 24.000.000
    defaultFeedPriceKg: 1500, // Rata-rata campuran hijauan + konsentrat
    defaultSellingPrice: 7200, // Rp 7.200 per liter
    productivityRate: 17, // 17 liter per ekor per hari
    marginPerHeadEstimateMonth: 1200000, // Laba bersih Rp 1.200.000 - 1.500.000 per ekor/bulan
  },
  sapi_potong: {
    spacePerHeadM2: 8,
    feedDailyPerHeadKg: 25,
    cycleLengthDays: 120,
    defaultDOCPrice: 14000000, // Bakalan 300 kg
    defaultFeedPriceKg: 1800,
    defaultSellingPrice: 52000, // Rp 52.000 / kg hidup
    productivityRate: 1.2, // ADG 1.2 kg per hari
    marginPerHeadEstimateMonth: 950000,
  },
  kambing_domba: {
    spacePerHeadM2: 1.5,
    feedDailyPerHeadKg: 4.5,
    cycleLengthDays: 180,
    defaultDOCPrice: 1800000, // Bakalan cempe lepas sapih
    defaultFeedPriceKg: 1200,
    defaultSellingPrice: 65000, // per kg hidup
    productivityRate: 0.15, // ADG 150 gram/hari
    marginPerHeadEstimateMonth: 140000,
  },
};

export function calculateFarmFeasibility(input: CalculationInput): OnboardingCalculationResult {
  const std = COMMODITY_STANDARDS[input.category] || COMMODITY_STANDARDS.ayam_petelur;
  const feedPrice = input.feedPricePerKg || std.defaultFeedPriceKg;
  const seedPrice = input.docOrSeedPrice || std.defaultDOCPrice;
  const sellPrice = input.sellingPricePerUnit || std.defaultSellingPrice;

  const maxDensityByLand = Math.floor(input.landAreaM2 / std.spacePerHeadM2);
  const physicalLimit = input.barnCapacityLimit && input.barnCapacityLimit > 0 
    ? Math.min(input.barnCapacityLimit, maxDensityByLand)
    : maxDensityByLand;

  const criticalNotes: string[] = [];

  if (input.method === 'capital') {
    const capital = input.capitalAmount || 50000000;
    
    // Alokasi modal: 
    // 35% Bibit, 45% Pakan siklus awal, 10% Operasional (listrik, vaksin), 10% Dana Darurat
    const budgetForSeeds = capital * 0.35;
    const affordableHeadsByCapital = Math.max(1, Math.floor(budgetForSeeds / seedPrice));
    
    // Populasi yang direkomendasikan adalah minimum antara keterbatasan modal dan kapasitas kandang/lahan
    let recommendedStock = Math.min(affordableHeadsByCapital, physicalLimit);
    if (recommendedStock < 1) recommendedStock = 1;

    if (affordableHeadsByCapital > physicalLimit) {
      criticalNotes.push(`Kapasitas lahan/kandang (${physicalLimit} ekor) membatasi jumlah ternak walaupun modal Anda mencukupi untuk ${affordableHeadsByCapital} ekor.`);
    }

    const estimatedLivestockCost = recommendedStock * seedPrice;
    const feedNeededKgMonthly = recommendedStock * std.feedDailyPerHeadKg * 30;
    const estimatedFeedCostMonthly = feedNeededKgMonthly * feedPrice;
    
    // Dana darurat 10% modal
    const emergencyBufferCost = capital * 0.10;
    const estimatedOperationalCost = capital * 0.10;
    const totalBudgetNeeded = estimatedLivestockCost + (estimatedFeedCostMonthly * 2) + estimatedOperationalCost + emergencyBufferCost;

    // Estimasi pendapatan bulanan
    let estimatedRevenueMonthly = 0;
    if (input.category === 'ayam_petelur' || input.category === 'bebek_petelur') {
      const dailyEggs = recommendedStock * std.productivityRate;
      estimatedRevenueMonthly = dailyEggs * 30 * sellPrice;
    } else if (input.category === 'sapi_perah') {
      const dailyLiters = recommendedStock * std.productivityRate;
      estimatedRevenueMonthly = dailyLiters * 30 * sellPrice;
    } else {
      // Pedaging / Penggemukan
      estimatedRevenueMonthly = recommendedStock * std.marginPerHeadEstimateMonth * 1.8;
    }

    const estimatedProfitMonthly = recommendedStock * std.marginPerHeadEstimateMonth;
    const breakEvenMonths = estimatedProfitMonthly > 0 
      ? Math.round((totalBudgetNeeded / estimatedProfitMonthly) * 10) / 10 
      : 24;

    let feasibilityScore: 'Tinggi' | 'Moderat' | 'Butuh Penyesuaian' = 'Tinggi';
    if (emergencyBufferCost < capital * 0.08 || breakEvenMonths > 24) {
      feasibilityScore = 'Moderat';
    }
    if (capital < seedPrice * 5) {
      feasibilityScore = 'Butuh Penyesuaian';
      criticalNotes.push('Modal awal sangat tipis untuk skala ekonomis peternakan komersial.');
    }

    return {
      recommendedCapacity: physicalLimit,
      recommendedStock,
      feedNeededKgTotal: Math.round(feedNeededKgMonthly),
      estimatedFeedCost: Math.round(estimatedFeedCostMonthly),
      estimatedLivestockCost: Math.round(estimatedLivestockCost),
      estimatedOperationalCost: Math.round(estimatedOperationalCost),
      emergencyBufferCost: Math.round(emergencyBufferCost),
      totalBudgetNeeded: Math.round(totalBudgetNeeded),
      estimatedRevenueMonthly: Math.round(estimatedRevenueMonthly),
      estimatedProfitMonthly: Math.round(estimatedProfitMonthly),
      breakEvenMonths,
      feasibilityScore,
      criticalNotes,
    };
  } else {
    // Method Target Keuntungan
    const targetProfit = input.targetProfitPerMonth || 10000000;
    const neededStock = Math.ceil(targetProfit / std.marginPerHeadEstimateMonth);
    const recommendedStock = neededStock;
    const neededLandM2 = Math.ceil(neededStock * std.spacePerHeadM2);

    if (neededLandM2 > input.landAreaM2) {
      criticalNotes.push(`Untuk mencapai target laba Rp ${targetProfit.toLocaleString('id-ID')}/bulan, dibutuhkan lahan/kandang minimal ${neededLandM2} m² (saat ini tersedia ${input.landAreaM2} m²).`);
    }

    const estimatedLivestockCost = neededStock * seedPrice;
    const feedNeededKgMonthly = neededStock * std.feedDailyPerHeadKg * 30;
    const estimatedFeedCostMonthly = feedNeededKgMonthly * feedPrice;
    const estimatedOperationalCost = estimatedFeedCostMonthly * 0.15;
    const emergencyBufferCost = (estimatedLivestockCost + estimatedFeedCostMonthly) * 0.12;
    const totalBudgetNeeded = estimatedLivestockCost + (estimatedFeedCostMonthly * 2) + estimatedOperationalCost + emergencyBufferCost;

    let estimatedRevenueMonthly = 0;
    if (input.category === 'ayam_petelur' || input.category === 'bebek_petelur') {
      estimatedRevenueMonthly = (neededStock * std.productivityRate) * 30 * sellPrice;
    } else if (input.category === 'sapi_perah') {
      estimatedRevenueMonthly = (neededStock * std.productivityRate) * 30 * sellPrice;
    } else {
      estimatedRevenueMonthly = targetProfit * 1.8;
    }

    const breakEvenMonths = Math.round((totalBudgetNeeded / targetProfit) * 10) / 10;

    let feasibilityScore: 'Tinggi' | 'Moderat' | 'Butuh Penyesuaian' = 'Tinggi';
    if (neededLandM2 > input.landAreaM2) {
      feasibilityScore = 'Butuh Penyesuaian';
    } else if (totalBudgetNeeded > 200000000) {
      feasibilityScore = 'Moderat';
    }

    return {
      recommendedCapacity: physicalLimit,
      recommendedStock,
      feedNeededKgTotal: Math.round(feedNeededKgMonthly),
      estimatedFeedCost: Math.round(estimatedFeedCostMonthly),
      estimatedLivestockCost: Math.round(estimatedLivestockCost),
      estimatedOperationalCost: Math.round(estimatedOperationalCost),
      emergencyBufferCost: Math.round(emergencyBufferCost),
      totalBudgetNeeded: Math.round(totalBudgetNeeded),
      estimatedRevenueMonthly: Math.round(estimatedRevenueMonthly),
      estimatedProfitMonthly: Math.round(targetProfit),
      breakEvenMonths,
      feasibilityScore,
      criticalNotes,
    };
  }
}
