import React from 'react';
import { 
  Bell, 
  Sparkles, 
  PlusCircle, 
  Layers, 
  ChevronDown,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { FarmProfile, LivestockCategory } from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';

interface HeaderProps {
  farmProfile: FarmProfile;
  activeCategory: LivestockCategory;
  onSelectCategory: (cat: LivestockCategory) => void;
  onOpenOnboarding: () => void;
  onQuickAddProduction: () => void;
  urgentAlertsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  farmProfile,
  activeCategory,
  onSelectCategory,
  onOpenOnboarding,
  onQuickAddProduction,
  urgentAlertsCount,
}) => {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const currentComm = COMMODITY_INFO[activeCategory] || COMMODITY_INFO.ayam_petelur;

  const todayStr = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 px-4 sm:px-6 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: Farm Info & Commodity Switcher */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-emerald-900 transition-colors cursor-pointer text-left"
              title="Ganti Komoditas Ternak Aktif"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-emerald-700 block">
                  Komoditas Aktif
                </span>
                <span className="text-sm font-bold text-emerald-950 flex items-center gap-1">
                  {currentComm.name}
                  <ChevronDown className="w-4 h-4 text-emerald-700" />
                </span>
              </div>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Pilih Komoditas Peternakan
                </div>
                {farmProfile.selectedCategories.map((catKey) => {
                  const comm = COMMODITY_INFO[catKey];
                  const isActive = activeCategory === catKey;
                  return (
                    <button
                      key={catKey}
                      onClick={() => {
                        onSelectCategory(catKey);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
                        isActive 
                          ? 'bg-emerald-600 text-white font-medium' 
                          : 'text-slate-800 hover:bg-emerald-50'
                      }`}
                    >
                      <span>{comm?.name || catKey}</span>
                      {isActive && <span className="text-xs bg-emerald-700 px-1.5 py-0.5 rounded">Aktif</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="hidden lg:block border-l border-slate-200 pl-3">
            <h1 className="text-sm font-bold text-slate-900">{farmProfile.farmName}</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              {todayStr}
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 justify-end">
          {/* Quick Add Production */}
          <button
            onClick={onQuickAddProduction}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Catat Produksi</span>
          </button>

          {/* Recalculate / Onboarding Wizard */}
          <button
            onClick={onOpenOnboarding}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-medium rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Buka Simulasi & Perencanaan Kelayakan Usaha"
          >
            <Layers className="w-4 h-4 text-emerald-700" />
            <span>Simulasi Rencana</span>
          </button>

          {/* Urgent Alert Pill if any */}
          {urgentAlertsCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-semibold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>{urgentAlertsCount} Peringatan</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
