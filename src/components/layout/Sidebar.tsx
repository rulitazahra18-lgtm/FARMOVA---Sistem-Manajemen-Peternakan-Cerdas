import React from 'react';
import { 
  LayoutDashboard, 
  Egg, 
  ShieldCheck, 
  CalendarClock, 
  Wallet, 
  Boxes, 
  LineChart, 
  Bot, 
  FileText, 
  Settings,
  Sparkles,
  ChevronRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

export type TabKey = 
  | 'dashboard'
  | 'production'
  | 'livestock'
  | 'schedules'
  | 'finances'
  | 'inventory'
  | 'analytics'
  | 'ai_assistant'
  | 'reports'
  | 'settings';

interface SidebarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  pendingTasksCount: number;
  lowStockCount: number;
  onOpenOnboarding: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingTasksCount,
  lowStockCount,
  onOpenOnboarding,
}) => {
  const menuItems: Array<{
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { key: 'dashboard', label: 'Ringkasan Peternakan', icon: LayoutDashboard },
    { key: 'production', label: 'Produksi', icon: Egg },
    { key: 'livestock', label: 'Pengelolaan Ternak', icon: ShieldCheck },
    { 
      key: 'schedules', 
      label: 'Jadwal & Kegiatan', 
      icon: CalendarClock,
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-emerald-800 text-emerald-100',
    },
    { key: 'finances', label: 'Keuangan', icon: Wallet },
    { 
      key: 'inventory', 
      label: 'Persediaan', 
      icon: Boxes,
      badge: lowStockCount > 0 ? `${lowStockCount} Peringatan` : undefined,
      badgeColor: 'bg-amber-700 text-amber-100',
    },
    { key: 'analytics', label: 'Analisis Usaha', icon: LineChart },
    { 
      key: 'ai_assistant', 
      label: 'Asisten AI Peternakan', 
      icon: Bot,
      badge: 'Cerdas',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40',
    },
    { key: 'reports', label: 'Laporan', icon: FileText },
    { key: 'settings', label: 'Pengaturan Peternakan', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#112d1f] text-slate-100 min-h-screen border-r border-emerald-900/60 select-none flex-shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-emerald-900/50">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <TrendingUp className="w-5 h-5 text-emerald-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">FARMOVA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-300 border border-emerald-700">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-emerald-400 font-medium">Sistem Manajemen Peternakan</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-500/80">
          Menu Utama
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-950/30 font-semibold'
                  : 'text-emerald-100/80 hover:bg-emerald-900/50 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-emerald-900 text-emerald-200'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Planning Method / Quick Simulation Box in Sidebar */}
      <div className="p-3 border-t border-emerald-900/50">
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/60">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kalkulator Rencana</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug mb-2.5">
            Simulasi modal vs target laba peternakan dengan AI audit.
          </p>
          <button
            onClick={onOpenOnboarding}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>Atur Rencana Usaha</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
