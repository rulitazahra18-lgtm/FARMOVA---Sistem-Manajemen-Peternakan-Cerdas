import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  Receipt, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  FileText,
  BadgeAlert,
  Calendar
} from 'lucide-react';
import { FinancialTransaction } from '../../types/farm';

interface FinanceModuleProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

export const FinanceModule: React.FC<FinanceModuleProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [category, setCategory] = useState<FinancialTransaction['category']>('penjualan_telur');
  const [amount, setAmount] = useState<number>(1800000);
  const [isProjection, setIsProjection] = useState<boolean>(false);
  const [description, setDescription] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');

  // Calculations
  const initialCapitalTx = transactions.find((t) => t.category === 'modal_awal');
  const initialCapital = initialCapitalTx ? initialCapitalTx.amount : 0;

  const actualIncome = transactions
    .filter((t) => t.type === 'income' && t.category !== 'modal_awal' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const actualExpense = transactions
    .filter((t) => t.type === 'expense' && !t.isProjection)
    .reduce((acc, t) => acc + t.amount, 0);

  const netActualProfit = actualIncome - actualExpense;
  const currentCashBalance = initialCapital + actualIncome - actualExpense;

  const filteredTransactions = transactions.filter((t) => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction({
      date,
      type,
      category,
      amount,
      isProjection,
      description,
      receiptNumber: receiptNumber || undefined,
    });
    setIsModalOpen(false);
    setDescription('');
    setReceiptNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengelolaan Keuangan & Arus Kas</h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan kas riil, pemisahan biaya modal vs operasional, dan laporan laba/rugi aktual.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Catat Transaksi Kas</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Saldo Kas Berjalan</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">
            Rp {(currentCashBalance / 1000000).toFixed(2)} Jt
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Modal Awal: Rp {(initialCapital / 1000000).toFixed(0)} Jt
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Pendapatan Riil</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block">
            Rp {(actualIncome / 1000000).toFixed(2)} Jt
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Penjualan telur, susu & ternak
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Total Pengeluaran OPEX</span>
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-rose-600 mt-1 block">
            Rp {(actualExpense / 1000000).toFixed(2)} Jt
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Pakan, obat, listrik & upah
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Laba / Rugi Bersih Riil</span>
          <span className={`text-xl sm:text-2xl font-black mt-1 block ${netActualProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            Rp {(netActualProfit / 1000000).toFixed(2)} Jt
          </span>
          <span className="text-[11px] text-slate-500 block mt-1">
            Margin: {actualIncome > 0 ? `${Math.round((netActualProfit / actualIncome) * 100)}%` : '0%'}
          </span>
        </div>
      </div>

      {/* Transaction Table with Filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-700" />
            <h3 className="font-bold text-sm text-slate-800">
              Riwayat Transaksi Keuangan ({filteredTransactions.length} Transaksi)
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterType === 'income' ? 'bg-white text-emerald-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                filterType === 'expense' ? 'bg-white text-rose-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tanggal</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4">Deskripsi / No. Bukti</th>
                <th className="py-3 px-4">Status Data</th>
                <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      tx.type === 'income' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {tx.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{tx.description}</div>
                    {tx.receiptNumber && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        No. Bukti: {tx.receiptNumber}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    {tx.isProjection ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold border border-amber-200">
                        Perkiraan (Proyeksi)
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                        Nyata (Aktual)
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right font-black whitespace-nowrap">
                    <span className={tx.type === 'income' ? 'text-emerald-700' : 'text-rose-600'}>
                      {tx.type === 'income' ? '+' : '-'} Rp {tx.amount.toLocaleString('id-ID')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus Transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CATAT TRANSAKSI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-5 border border-slate-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 mb-1">Catat Transaksi Keuangan Peternakan</h3>
            <p className="text-xs text-slate-500 mb-4">
              Rekam mutasi kas riil peternakan untuk laporan laba/rugi transparan.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipe Transaksi</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      const newType = e.target.value as 'income' | 'expense';
                      setType(newType);
                      setCategory(newType === 'income' ? 'penjualan_telur' : 'beli_pakan');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                  >
                    <option value="income">Pemasukan (+)</option>
                    <option value="expense">Pengeluaran (-)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kategori Transaksi</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900 bg-white"
                >
                  {type === 'income' ? (
                    <>
                      <option value="penjualan_telur">Penjualan Telur</option>
                      <option value="penjualan_daging">Penjualan Daging / Panen Broiler</option>
                      <option value="penjualan_susu">Penjualan Susu Segar</option>
                      <option value="penjualan_ternak">Penjualan Bibit / Ternak Afkir</option>
                      <option value="modal_awal">Penyetoran Modal Awal</option>
                      <option value="lainnya">Pendapatan Lain-lain</option>
                    </>
                  ) : (
                    <>
                      <option value="beli_pakan">Pembelian Pakan Ternak</option>
                      <option value="beli_obat">Obat, Vaksin & Vitamin</option>
                      <option value="listrik_air">Biaya Listrik, Air & Gas</option>
                      <option value="upah_karyawan">Upah / Gaji Anak Kandang</option>
                      <option value="peralatan">Peralatan & Perawatan Fasilitas</option>
                      <option value="lainnya">Pengeluaran Operasional Lainnya</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nominal (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-bold text-xs">Rp</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Deskripsi Keterangan</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Contoh: Penjualan 60 kg telur ke toko sembako"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nomor Nota / Bukti (Opsional)</label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  placeholder="Contoh: INV/202611/008"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs text-slate-900"
                />
              </div>

              {/* Toggle Proyeksi vs Aktual */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Sifat Transaksi</span>
                  <span className="text-[11px] text-slate-500">Tandai jika masih berupa estimasi/proyeksi</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProjection}
                    onChange={(e) => setIsProjection(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
