import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Bot, 
  Download, 
  Upload, 
  Layers, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';
import { FarmProfile, LivestockCategory } from '../../types/farm';
import { COMMODITY_INFO, INITIAL_FARM_PROFILE } from '../../data/initialData';

interface SettingsModuleProps {
  farmProfile: FarmProfile;
  onUpdateProfile: (profile: FarmProfile) => void;
  onResetAllData: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  farmProfile,
  onUpdateProfile,
  onResetAllData,
  onOpenOnboarding,
}) => {
  const [farmName, setFarmName] = useState(farmProfile.farmName);
  const [ownerName, setOwnerName] = useState(farmProfile.ownerName);
  const [location, setLocation] = useState(farmProfile.location);
  const [landAreaM2, setLandAreaM2] = useState<number>(farmProfile.landAreaM2);
  const [barnCapacity, setBarnCapacity] = useState<number>(farmProfile.barnCapacity);
  const [allowAIDataAnalysis, setAllowAIDataAnalysis] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      ...farmProfile,
      farmName,
      ownerName,
      location,
      landAreaM2,
      barnCapacity,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleExportBackup = () => {
    const backupData = {
      farmProfile,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${farmProfile.farmName.replace(/\s+/g, '_')}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Sistem & Profil Peternakan</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola identitas usaha, izin privasi AI, dan pencadangan data peternakan.
          </p>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-300"
        >
          <Layers className="w-4 h-4 text-emerald-700" />
          <span>Buka Ulang Wizard Rencana Usaha</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Form Profile */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base border-b border-slate-100 pb-3">
            Informasi Pokok Usaha Peternakan
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Peternakan</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nama Pemilik / Manajer</label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Lokasi Peternakan</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Luas Lahan Terdaftar (m²)</label>
                <input
                  type="number"
                  value={landAreaM2}
                  onChange={(e) => setLandAreaM2(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kapasitas Kandang Maksimal (Ekor)</label>
                <input
                  type="number"
                  value={barnCapacity}
                  onChange={(e) => setBarnCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900"
                  required
                />
              </div>
            </div>

            {/* AI Permission Toggle (PRD Section 7.5) */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                  <Bot className="w-4 h-4 text-emerald-700" />
                  <span>Izin Penggunaan Konteks Data oleh Asisten AI</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Izinkan model Gemini menganalisis data produksi & pakan untuk mendeteksi anomali.
                </p>
              </div>
              <input
                type="checkbox"
                checked={allowAIDataAnalysis}
                onChange={(e) => setAllowAIDataAnalysis(e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              {isSaved ? (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  Profil berhasil diperbarui!
                </span>
              ) : <div />}

              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Data Backup & Reset */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Cadangkan Data (Backup)</span>
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh salinan JSON seluruh data transaksi, riwayat produksi, kelompok ternak, dan jadwal untuk arsip lokal.
            </p>
            <button
              onClick={handleExportBackup}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-300"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Arsip Backup JSON</span>
            </button>
          </div>

          <div className="bg-rose-50 rounded-2xl border border-rose-200 p-5 space-y-3">
            <h4 className="font-bold text-rose-950 text-sm flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Data ke Standar Demo</span>
            </h4>
            <p className="text-xs text-rose-800 leading-relaxed">
              Mengembalikan seluruh data peternakan ke dataset awal FARMOVA untuk demonstrasi.
            </p>
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke kondisi awal?')) {
                  onResetAllData();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Seluruh Data</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
