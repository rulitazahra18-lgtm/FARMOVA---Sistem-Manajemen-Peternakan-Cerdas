import React, { useState, useEffect } from 'react';
import { 
  FarmProfile, 
  Barn, 
  LivestockGroup, 
  ProductionRecord, 
  FeedInventoryItem, 
  MedicineInventoryItem, 
  FarmSchedule, 
  FinancialTransaction, 
  LivestockCategory,
  OnboardingCalculationResult,
  AlternativeFeedItem,
  SavedAlternativeRation
} from './types/farm';
import { 
  INITIAL_FARM_PROFILE, 
  INITIAL_BARNS, 
  INITIAL_LIVESTOCK_GROUPS, 
  INITIAL_PRODUCTION_RECORDS, 
  INITIAL_FEED_INVENTORY, 
  INITIAL_MEDICINE_INVENTORY, 
  INITIAL_SCHEDULES, 
  INITIAL_TRANSACTIONS,
  INITIAL_ALTERNATIVE_FEEDS,
  INITIAL_SAVED_RATIONS,
  COMMODITY_INFO
} from './data/initialData';

// Layout Components
import { Header } from './components/layout/Header';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { MobileNavbar } from './components/layout/MobileNavbar';

// Feature Modules
import { DynamicDashboard } from './components/dashboard/DynamicDashboard';
import { ProductionModule } from './components/production/ProductionModule';
import { LivestockModule } from './components/livestock/LivestockModule';
import { ScheduleModule } from './components/schedules/ScheduleModule';
import { FinanceModule } from './components/finances/FinanceModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { AnalyticsModule } from './components/analytics/AnalyticsModule';
import { AIAssistantModule } from './components/ai/AIAssistantModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { OnboardingModal } from './components/onboarding/OnboardingModal';

// Icons for Mobile Drawer
import { 
  X, 
  Wallet, 
  Boxes, 
  LineChart, 
  FileText, 
  Settings as SettingsIcon,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // Persistence via localStorage with defaults
  const [farmProfile, setFarmProfile] = useState<FarmProfile>(() => {
    const saved = localStorage.getItem('farmova_profile');
    return saved ? JSON.parse(saved) : INITIAL_FARM_PROFILE;
  });

  const [activeCategory, setActiveCategory] = useState<LivestockCategory>(() => {
    return farmProfile.activeCategory || 'ayam_petelur';
  });

  const [barns, setBarns] = useState<Barn[]>(() => {
    const saved = localStorage.getItem('farmova_barns');
    return saved ? JSON.parse(saved) : INITIAL_BARNS;
  });

  const [livestockGroups, setLivestockGroups] = useState<LivestockGroup[]>(() => {
    const saved = localStorage.getItem('farmova_groups');
    return saved ? JSON.parse(saved) : INITIAL_LIVESTOCK_GROUPS;
  });

  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() => {
    const saved = localStorage.getItem('farmova_production');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION_RECORDS;
  });

  const [feedInventory, setFeedInventory] = useState<FeedInventoryItem[]>(() => {
    const saved = localStorage.getItem('farmova_feed');
    return saved ? JSON.parse(saved) : INITIAL_FEED_INVENTORY;
  });

  const [medicineInventory, setMedicineInventory] = useState<MedicineInventoryItem[]>(() => {
    const saved = localStorage.getItem('farmova_medicine');
    return saved ? JSON.parse(saved) : INITIAL_MEDICINE_INVENTORY;
  });

  const [schedules, setSchedules] = useState<FarmSchedule[]>(() => {
    const saved = localStorage.getItem('farmova_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('farmova_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [alternativeFeeds, setAlternativeFeeds] = useState<AlternativeFeedItem[]>(() => {
    const saved = localStorage.getItem('farmova_alt_feeds');
    return saved ? JSON.parse(saved) : INITIAL_ALTERNATIVE_FEEDS;
  });

  const [savedRations, setSavedRations] = useState<SavedAlternativeRation[]>(() => {
    const saved = localStorage.getItem('farmova_saved_rations');
    return saved ? JSON.parse(saved) : INITIAL_SAVED_RATIONS;
  });

  // UI Navigation & Modals State
  const [currentTab, setCurrentTab] = useState<TabKey>('dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [initialAIPrompt, setInitialAIPrompt] = useState<string | undefined>(undefined);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('farmova_profile', JSON.stringify(farmProfile));
  }, [farmProfile]);

  useEffect(() => {
    localStorage.setItem('farmova_barns', JSON.stringify(barns));
  }, [barns]);

  useEffect(() => {
    localStorage.setItem('farmova_groups', JSON.stringify(livestockGroups));
  }, [livestockGroups]);

  useEffect(() => {
    localStorage.setItem('farmova_production', JSON.stringify(productionRecords));
  }, [productionRecords]);

  useEffect(() => {
    localStorage.setItem('farmova_feed', JSON.stringify(feedInventory));
  }, [feedInventory]);

  useEffect(() => {
    localStorage.setItem('farmova_medicine', JSON.stringify(medicineInventory));
  }, [medicineInventory]);

  useEffect(() => {
    localStorage.setItem('farmova_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('farmova_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('farmova_alt_feeds', JSON.stringify(alternativeFeeds));
  }, [alternativeFeeds]);

  useEffect(() => {
    localStorage.setItem('farmova_saved_rations', JSON.stringify(savedRations));
  }, [savedRations]);

  // Handler: Switch active category
  const handleSelectCategory = (cat: LivestockCategory) => {
    setActiveCategory(cat);
    setFarmProfile((prev) => ({
      ...prev,
      activeCategory: cat,
    }));
  };

  // Handler: Save profile from onboarding
  const handleSaveProfile = (updatedProfile: FarmProfile, calcResult?: OnboardingCalculationResult) => {
    setFarmProfile(updatedProfile);
    setActiveCategory(updatedProfile.activeCategory);

    // If calculation result exists and planning was modified, add/adjust initial capital if needed
    if (calcResult) {
      // Check if modal awal transaction exists
      const hasInitialCapital = transactions.some((t) => t.category === 'modal_awal');
      if (!hasInitialCapital) {
        const capitalTx: FinancialTransaction = {
          id: `tx-init-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'income',
          category: 'modal_awal',
          amount: updatedProfile.initialCapital,
          isProjection: false,
          description: `Penyetoran Modal Usaha Awal (${updatedProfile.farmName})`,
        };
        setTransactions((prev) => [capitalTx, ...prev]);
      }
    }
  };

  // Production Handlers
  const handleAddProductionRecord = (record: Omit<ProductionRecord, 'id'>) => {
    const newRecord: ProductionRecord = {
      ...record,
      id: `prod-${Date.now()}`,
    };
    setProductionRecords((prev) => [newRecord, ...prev]);

    // Also deduct feed from matching feed inventory item automatically!
    setFeedInventory((prev) =>
      prev.map((item) => {
        if (item.category === record.category) {
          const newStock = Math.max(0, item.currentStockKg - record.feedGivenKg);
          return { ...item, currentStockKg: newStock };
        }
        return item;
      })
    );

    // Also record mortality if any into group
    if (record.mortalityToday > 0 && record.groupId) {
      handleRecordMortality(record.groupId, record.mortalityToday, 'Mortalitas tercatat di form harian');
    }
  };

  const handleDeleteProductionRecord = (id: string) => {
    setProductionRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // Livestock Handlers
  const handleAddGroup = (group: Omit<LivestockGroup, 'id'>) => {
    const newGrp: LivestockGroup = {
      ...group,
      id: `grp-${Date.now()}`,
    };
    setLivestockGroups((prev) => [...prev, newGrp]);

    // Update barn current count
    setBarns((prev) =>
      prev.map((b) => (b.id === group.barnId ? { ...b, currentCount: b.currentCount + group.initialCount } : b))
    );
  };

  const handleRecordMortality = (groupId: string, count: number, reason: string) => {
    setLivestockGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const newCurrent = Math.max(0, g.currentCount - count);
          const newMortality = g.mortalityCount + count;
          return {
            ...g,
            currentCount: newCurrent,
            mortalityCount: newMortality,
            notes: `${g.notes || ''} [${new Date().toLocaleDateString('id-ID')} Mati ${count} ekor: ${reason}]`,
          };
        }
        return g;
      })
    );

    // Also update barn capacity occupancy
    const targetGroup = livestockGroups.find((g) => g.id === groupId);
    if (targetGroup) {
      setBarns((prev) =>
        prev.map((b) =>
          b.id === targetGroup.barnId ? { ...b, currentCount: Math.max(0, b.currentCount - count) } : b
        )
      );
    }
  };

  const handleAddBarn = (barn: Omit<Barn, 'id'>) => {
    const newBarn: Barn = {
      ...barn,
      id: `barn-${Date.now()}`,
    };
    setBarns((prev) => [...prev, newBarn]);
  };

  // Schedule Handlers
  const handleToggleSchedule = (id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleAddSchedule = (schedule: Omit<FarmSchedule, 'id'>) => {
    const newSchedule: FarmSchedule = {
      ...schedule,
      id: `sch-${Date.now()}`,
    };
    setSchedules((prev) => [newSchedule, ...prev]);
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // Finance Handlers
  const handleAddTransaction = (transaction: Omit<FinancialTransaction, 'id'>) => {
    const newTx: FinancialTransaction = {
      ...transaction,
      id: `tx-${Date.now()}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Inventory Handlers
  const handleUpdateFeedStock = (id: string, deltaKg: number) => {
    setFeedInventory((prev) =>
      prev.map((f) => (f.id === id ? { ...f, currentStockKg: f.currentStockKg + deltaKg } : f))
    );
  };

  const handleAddFeedItem = (item: Omit<FeedInventoryItem, 'id'>) => {
    const newFeed: FeedInventoryItem = {
      ...item,
      id: `feed-${Date.now()}`,
    };
    setFeedInventory((prev) => [...prev, newFeed]);
  };

  const handleAddMedicineItem = (item: Omit<MedicineInventoryItem, 'id'>) => {
    const newMed: MedicineInventoryItem = {
      ...item,
      id: `med-${Date.now()}`,
    };
    setMedicineInventory((prev) => [...prev, newMed]);
  };

  const handleDeleteFeedItem = (id: string) => {
    setFeedInventory((prev) => prev.filter((f) => f.id !== id));
  };

  // Alternative Feed Handlers
  const handleAddAlternativeFeed = (item: Omit<AlternativeFeedItem, 'id'>) => {
    const newItem: AlternativeFeedItem = {
      ...item,
      id: `alt-${Date.now()}`,
    };
    setAlternativeFeeds((prev) => [newItem, ...prev]);
  };

  const handleDeleteAlternativeFeed = (id: string) => {
    setAlternativeFeeds((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveRation = (ration: Omit<SavedAlternativeRation, 'id'>) => {
    const newRation: SavedAlternativeRation = {
      ...ration,
      id: `rat-${Date.now()}`,
    };
    setSavedRations((prev) => [newRation, ...prev]);
  };

  const handleDeleteRation = (id: string) => {
    setSavedRations((prev) => prev.filter((r) => r.id !== id));
  };

  // Reset demo data
  const handleResetAllData = () => {
    localStorage.clear();
    setFarmProfile(INITIAL_FARM_PROFILE);
    setActiveCategory(INITIAL_FARM_PROFILE.activeCategory);
    setBarns(INITIAL_BARNS);
    setLivestockGroups(INITIAL_LIVESTOCK_GROUPS);
    setProductionRecords(INITIAL_PRODUCTION_RECORDS);
    setFeedInventory(INITIAL_FEED_INVENTORY);
    setMedicineInventory(INITIAL_MEDICINE_INVENTORY);
    setSchedules(INITIAL_SCHEDULES);
    setTransactions(INITIAL_TRANSACTIONS);
    setAlternativeFeeds(INITIAL_ALTERNATIVE_FEEDS);
    setSavedRations(INITIAL_SAVED_RATIONS);
    setCurrentTab('dashboard');
  };

  // Quick consult AI shortcut
  const handleConsultAI = (promptText?: string) => {
    setInitialAIPrompt(promptText);
    setCurrentTab('ai_assistant');
  };

  // Counts for Badges
  const pendingTasksCount = schedules.filter(
    (s) => (s.category === activeCategory || s.category === 'semua') && !s.isCompleted
  ).length;

  const lowStockCount = feedInventory.filter(
    (f) => (f.category === activeCategory || f.category === 'umum') && f.currentStockKg <= f.minThresholdKg
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        pendingTasksCount={pendingTasksCount}
        lowStockCount={lowStockCount}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        {/* Sticky Top Header */}
        <Header
          farmProfile={farmProfile}
          activeCategory={activeCategory}
          onSelectCategory={handleSelectCategory}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onQuickAddProduction={() => setCurrentTab('production')}
          urgentAlertsCount={lowStockCount + (pendingTasksCount > 3 ? 1 : 0)}
        />

        {/* View Routing Based on currentTab */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <DynamicDashboard
              farmProfile={farmProfile}
              activeCategory={activeCategory}
              barns={barns}
              livestockGroups={livestockGroups}
              productionRecords={productionRecords}
              feedInventory={feedInventory}
              schedules={schedules}
              transactions={transactions}
              onOpenQuickAddProduction={() => setCurrentTab('production')}
              onNavigateTab={setCurrentTab}
              onToggleSchedule={handleToggleSchedule}
              onConsultAI={handleConsultAI}
            />
          )}

          {currentTab === 'production' && (
            <ProductionModule
              productionRecords={productionRecords}
              livestockGroups={livestockGroups}
              activeCategory={activeCategory}
              onAddRecord={handleAddProductionRecord}
              onDeleteRecord={handleDeleteProductionRecord}
            />
          )}

          {currentTab === 'livestock' && (
            <LivestockModule
              barns={barns}
              livestockGroups={livestockGroups}
              activeCategory={activeCategory}
              onAddGroup={handleAddGroup}
              onRecordMortality={handleRecordMortality}
              onAddBarn={handleAddBarn}
            />
          )}

          {currentTab === 'schedules' && (
            <ScheduleModule
              schedules={schedules}
              activeCategory={activeCategory}
              onToggleSchedule={handleToggleSchedule}
              onAddSchedule={handleAddSchedule}
              onDeleteSchedule={handleDeleteSchedule}
            />
          )}

          {currentTab === 'finances' && (
            <FinanceModule
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryModule
              feedInventory={feedInventory}
              medicineInventory={medicineInventory}
              activeCategory={activeCategory}
              onUpdateFeedStock={handleUpdateFeedStock}
              onAddFeedItem={handleAddFeedItem}
              onAddMedicineItem={handleAddMedicineItem}
              onDeleteFeedItem={handleDeleteFeedItem}
              alternativeFeeds={alternativeFeeds}
              savedRations={savedRations}
              livestockGroups={livestockGroups}
              onAddAlternativeFeed={handleAddAlternativeFeed}
              onDeleteAlternativeFeed={handleDeleteAlternativeFeed}
              onSaveRation={handleSaveRation}
              onDeleteRation={handleDeleteRation}
              onAddSchedule={handleAddSchedule}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsModule
              productionRecords={productionRecords}
              transactions={transactions}
              livestockGroups={livestockGroups}
              activeCategory={activeCategory}
              farmProfile={farmProfile}
              onConsultAI={handleConsultAI}
            />
          )}

          {currentTab === 'ai_assistant' && (
            <AIAssistantModule
              farmProfile={farmProfile}
              activeCategory={activeCategory}
              livestockGroups={livestockGroups}
              productionRecords={productionRecords}
              feedInventory={feedInventory}
              schedules={schedules}
              onAddScheduleFromAI={handleAddSchedule}
              initialPrompt={initialAIPrompt}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsModule
              farmProfile={farmProfile}
              activeCategory={activeCategory}
              productionRecords={productionRecords}
              transactions={transactions}
              livestockGroups={livestockGroups}
              feedInventory={feedInventory}
              schedules={schedules}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsModule
              farmProfile={farmProfile}
              onUpdateProfile={setFarmProfile}
              onResetAllData={handleResetAllData}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNavbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenMoreMenu={() => setIsMobileDrawerOpen(true)}
        pendingTasksCount={pendingTasksCount}
      />

      {/* Mobile "More" Drawer Modal */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm md:hidden flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl p-5 border-t border-slate-200 animate-in slide-in-from-bottom duration-200 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="font-bold text-slate-900 text-sm">Menu Tambahan FARMOVA</span>
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-3">
              <button
                onClick={() => {
                  setCurrentTab('finances');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Keuangan & Kas</h4>
                    <p className="text-xs text-slate-500">Pemasukan, pengeluaran & laba bersih</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setCurrentTab('inventory');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Persediaan & Pakan</h4>
                    <p className="text-xs text-slate-500">Stok pakan, pakan alternatif, obat & logistik</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setCurrentTab('analytics');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
                    <LineChart className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Analisis Usaha</h4>
                    <p className="text-xs text-slate-500">FCR, efisiensi pakan & performa</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setCurrentTab('reports');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Laporan Resmi</h4>
                    <p className="text-xs text-slate-500">Cetak & ekspor data peternakan</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setCurrentTab('settings');
                  setIsMobileDrawerOpen(false);
                }}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                    <SettingsIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">Pengaturan</h4>
                    <p className="text-xs text-slate-500">Profil & pencadangan data</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>

              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setIsOnboardingOpen(true);
                }}
                className="mt-2 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-emerald-800 text-white font-bold text-xs"
              >
                <Layers className="w-4 h-4" />
                <span>Simulasi Rencana Usaha (Wizard)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding & Business Planning Wizard Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        currentProfile={farmProfile}
        onSaveProfile={handleSaveProfile}
      />
    </div>
  );
}
