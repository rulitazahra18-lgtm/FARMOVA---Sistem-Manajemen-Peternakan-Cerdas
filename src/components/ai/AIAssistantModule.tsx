import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  PlusCircle, 
  CalendarClock, 
  Check, 
  User, 
  Lightbulb, 
  Loader2,
  ShieldCheck,
  RefreshCw,
  FileCheck2
} from 'lucide-react';
import { 
  AIChatMessage, 
  FarmProfile, 
  LivestockGroup, 
  ProductionRecord, 
  FeedInventoryItem, 
  FarmSchedule,
  LivestockCategory
} from '../../types/farm';
import { COMMODITY_INFO } from '../../data/initialData';
import { askFarmAIAssistant, runAIAnomalyDetection } from '../../services/api';

interface AIAssistantModuleProps {
  farmProfile: FarmProfile;
  activeCategory: LivestockCategory;
  livestockGroups: LivestockGroup[];
  productionRecords: ProductionRecord[];
  feedInventory: FeedInventoryItem[];
  schedules: FarmSchedule[];
  onAddScheduleFromAI: (schedule: Omit<FarmSchedule, 'id'>) => void;
  initialPrompt?: string;
}

export const AIAssistantModule: React.FC<AIAssistantModuleProps> = ({
  farmProfile,
  activeCategory,
  livestockGroups,
  productionRecords,
  feedInventory,
  schedules,
  onAddScheduleFromAI,
  initialPrompt,
}) => {
  const commInfo = COMMODITY_INFO[activeCategory] || COMMODITY_INFO.ayam_petelur;

  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: `Halo ${farmProfile.ownerName || 'Peternak'}! Saya adalah Asisten AI FARMOVA untuk peternakan **${farmProfile.farmName}**.\n\nSaya telah terhubung langsung dengan data rekaman kandang ${commInfo.name}, data pakan, dan riwayat produksi harian Anda. Ada yang ingin Anda konsultasikan hari ini?`,
      timestamp: 'Baru saja',
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [anomalyReport, setAnomalyReport] = useState<string | null>(null);
  const [isScanningAnomaly, setIsScanningAnomaly] = useState(false);
  const [addedScheduleIds, setAddedScheduleIds] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim()) {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsLoading(true);

    // Prepare live farm context
    const farmContext = {
      farmName: farmProfile.farmName,
      location: farmProfile.location,
      activeCommodity: commInfo.name,
      livestockCount: livestockGroups.filter((g) => g.category === activeCategory).reduce((acc, g) => acc + g.currentCount, 0),
      recentProduction: productionRecords.filter((r) => r.category === activeCategory).slice(0, 5),
      feedInventory: feedInventory.filter((f) => f.category === activeCategory || f.category === 'umum'),
      schedules: schedules.filter((s) => s.category === activeCategory).slice(0, 5),
    };

    try {
      const historyForAI = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const aiReply = await askFarmAIAssistant(textToSend, farmContext, historyForAI);

      // Check if AI suggested an action tag: [ACTION: title | category | time]
      let parsedAction: AIChatMessage['suggestedAction'] = undefined;
      const actionMatch = aiReply.match(/\[ACTION:\s*([^|]+)\|\s*([^|]+)\|\s*([^\]]+)\]/i);
      let cleanText = aiReply;

      if (actionMatch) {
        cleanText = aiReply.replace(/\[ACTION:[^\]]+\]/g, '').trim();
        parsedAction = {
          title: actionMatch[1].trim(),
          type: (actionMatch[2].trim().toLowerCase() as any) || 'pakan',
          time: actionMatch[3].trim() || '10:00',
        };
      }

      const assistantMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: parsedAction,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'Maaf, sambungan ke AI sedang lambat. Pastikan koneksi internet stabil dan data catatan kandang Anda tetap terisi dengan baik.',
        timestamp: 'Error',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanAnomaly = async () => {
    setIsScanningAnomaly(true);
    try {
      const relevantGroups = livestockGroups.filter((g) => g.category === activeCategory);
      const relevantProd = productionRecords.filter((r) => r.category === activeCategory);
      const relevantFeed = feedInventory.filter((f) => f.category === activeCategory);

      const report = await runAIAnomalyDetection(relevantGroups, relevantProd, relevantFeed, []);
      setAnomalyReport(report);
    } catch {
      setAnomalyReport('Pemeriksaan selesai: Seluruh indikator utama berada dalam ambang batas toleransi.');
    } finally {
      setIsScanningAnomaly(false);
    }
  };

  const handleScheduleAction = (msgId: string, action: NonNullable<AIChatMessage['suggestedAction']>) => {
    onAddScheduleFromAI({
      title: action.title,
      category: activeCategory,
      type: action.type,
      time: action.time,
      frequency: 'harian',
      assignedTo: 'Anak Kandang (Rekomendasi AI)',
      isCompleted: false,
      notes: 'Jadwal ditambahkan secara otomatis dari saran konsultasi Asisten AI FARMOVA.',
    });
    setAddedScheduleIds((prev) => [...prev, msgId]);
  };

  const quickChips = [
    `Analisis produktivitas ${commInfo.name} 5 hari terakhir`,
    `Apakah FCR dan takaran pakan saat ini sudah efisien?`,
    `Langkah pencegahan stres panas (heat stress) di kandang`,
    `Rekomendasi jadwal vaksin dan vitamin yang tepat`,
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Asisten AI Peternakan Cerdas</h2>
            <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Didukung Gemini 3.8
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analisis kondisi peternakan berbasis data riil pencatatan, deteksi dini penyakit, dan rekomendasi zoooteknis.
          </p>
        </div>

        <button
          onClick={handleScanAnomaly}
          disabled={isScanningAnomaly}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {isScanningAnomaly ? (
            <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-300" />
          )}
          <span>{isScanningAnomaly ? 'Memindai Anomali...' : 'Deteksi Anomali Otomatis'}</span>
        </button>
      </div>

      {/* Anomaly Scan Result Panel if triggered */}
      {anomalyReport && (
        <div className="p-5 bg-emerald-950 text-white rounded-2xl border border-emerald-800 shadow-md animate-in fade-in slide-in-from-top-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Hasil Audit Anomali & Rekomendasi Klinis</span>
            </div>
            <button
              onClick={() => setAnomalyReport(null)}
              className="text-xs text-emerald-400 hover:text-white"
            >
              Tutup
            </button>
          </div>
          <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed">
            {anomalyReport}
          </div>
        </div>
      )}

      {/* Main Chat Conversation Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[560px] overflow-hidden">
        
        {/* Messages List Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isActionAdded = addedScheduleIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm ${
                  isUser ? 'bg-slate-700' : 'bg-emerald-700'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* If assistant provided an actionable recommendation */}
                  {msg.suggestedAction && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">Rekomendasi Tindakan</span>
                        <span className="text-xs font-bold text-slate-900">{msg.suggestedAction.title} ({msg.suggestedAction.time})</span>
                      </div>
                      <button
                        onClick={() => handleScheduleAction(msg.id, msg.suggestedAction!)}
                        disabled={isActionAdded}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isActionAdded
                            ? 'bg-emerald-200 text-emerald-900 cursor-default'
                            : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm'
                        }`}
                      >
                        {isActionAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Sudah Dijadwalkan</span>
                          </>
                        ) : (
                          <>
                            <CalendarClock className="w-3.5 h-3.5" />
                            <span>Jadikan Jadwal</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <span className={`text-[10px] block mt-1 ${isUser ? 'text-slate-400 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                <span>Asisten AI sedang memeriksa konteks peternakan Anda...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Topik Cepat:
          </span>
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 rounded-lg whitespace-nowrap transition-colors cursor-pointer flex-shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan analisis produksi, takaran pakan, gejala penyakit..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-xs sm:text-sm text-slate-900"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
