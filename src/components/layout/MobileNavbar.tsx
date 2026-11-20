import React from 'react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Egg, 
  CalendarClock, 
  Bot, 
  Menu
} from 'lucide-react';
import { TabKey } from './Sidebar';

interface MobileNavbarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  onOpenMoreMenu: () => void;
  pendingTasksCount: number;
}

export const MobileNavbar: React.FC<MobileNavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenMoreMenu,
  pendingTasksCount,
}) => {
  const bottomItems: Array<{
    key: TabKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    hasBadge?: boolean;
  }> = [
    { key: 'dashboard', label: 'Dasbor', icon: LayoutDashboard },
    { key: 'livestock', label: 'Ternak', icon: ShieldCheck },
    { key: 'production', label: 'Produksi', icon: Egg },
    { key: 'schedules', label: 'Jadwal', icon: CalendarClock, hasBadge: pendingTasksCount > 0 },
    { key: 'ai_assistant', label: 'Asisten AI', icon: Bot },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#112d1f] text-slate-200 border-t border-emerald-900/60 shadow-lg">
      <div className="grid grid-cols-6 items-center h-16 px-1">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 relative transition-colors ${
                isActive ? 'text-emerald-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.hasBadge && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-[#112d1f]" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[50px]">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* 6th Button: More Menu (Keuangan, Persediaan, Analisis, Laporan, Pengaturan) */}
        <button
          onClick={onOpenMoreMenu}
          className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200"
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] mt-1 tracking-tight">Lainnya</span>
        </button>
      </div>
    </div>
  );
};
