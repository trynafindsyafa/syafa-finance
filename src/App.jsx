import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { 
  CreditCard, 
  Wallet, 
  FolderPlus, 
  History, 
  LogOut, 
  BarChart3, 
  Plus, 
  Trash2, 
  Save, 
  ArrowUpRight, 
  ArrowDownLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
  Pencil,
  Target,
  Trophy,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('transaksi');

  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State - Dompet (Tambah)
  const [walletName, setWalletName] = useState('');
  const [walletBalance, setWalletBalance] = useState('');

  // Form State - Dompet (Edit)
  const [editingWallet, setEditingWallet] = useState(null);
  const [editWalletName, setEditWalletName] = useState('');
  const [editWalletBalance, setEditWalletBalance] = useState('');

  // Form State - Kategori (Tambah)
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('expense');

  // Form State - Kategori (Edit)
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCatName, setEditCatName] = useState('');
  const [editCatType, setEditCatType] = useState('expense');

  // Form State - Transaksi
  const [transTitle, setTransTitle] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transType, setTransType] = useState('expense');
  const [selectedWallet, setSelectedWallet] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Target Tabungan State
  const [targetBalanceInput, setTargetBalanceInput] = useState('');
  const [targetBalance, setTargetBalance] = useState(() => {
    const saved = localStorage.getItem('syafa_target_balance');
    return saved ? parseFloat(saved) : 700000;
  });
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchWallets();
      fetchCategories();
      fetchTransactions();
    }
  }, [session]);

  useEffect(() => {
    if (wallets.length > 0 && !selectedWallet) {
      setSelectedWallet(wallets[0].id);
    }
  }, [wallets]);

  const filteredCategories = categories.filter((c) => c.type === transType);
  useEffect(() => {
    if (filteredCategories.length > 0) {
      setSelectedCategory(filteredCategories[0].id);
    } else {
      setSelectedCategory('');
    }
  }, [transType, categories]);

  const fetchWallets = async () => {
    const { data, error } = await supabase.from('wallets').select('*');
    if (error) console.error('Error fetch wallets:', error);
    if (data) setWallets(data);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) console.error('Error fetch categories:', error);
    if (data) setCategories(data);
  };

  const fetchTransactions = async () => {
    const { data, error } = await supabase.from('transactions').select('*');
    if (error) {
      console.error('Error fetch transactions:', error);
    } else if (data) {
      setTransactions(data);
    }
  };

  const handleAuth = async (isSignUp = false) => {
    setLoading(true);
    let result = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (result.error) {
      showToast(result.error.message, 'error');
    } else {
      showToast(isSignUp ? 'Pendaftaran berhasil!' : 'Selamat datang kembali!');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    showToast('Berhasil logout', 'info');
  };

  const handleSaveTarget = (e) => {
    e.preventDefault();
    let inputVal = parseFloat(targetBalanceInput || 0);
    if (isNaN(inputVal) || inputVal <= 0) {
      showToast('Masukkan target nominal yang valid!', 'error');
      return;
    }

    let finalTarget = inputVal < 1000 ? inputVal * 1000 : inputVal;
    setTargetBalance(finalTarget);
    localStorage.setItem('syafa_target_balance', finalTarget.toString());
    setIsEditingTarget(false);
    setTargetBalanceInput('');
    showToast(`Target saldo diubah menjadi Rp ${finalTarget.toLocaleString('id-ID')}`);
  };

  const handleAddWallet = async (e) => {
    e.preventDefault();
    if (!walletName) return;

    let inputVal = parseFloat(walletBalance || 0);
    let balanceNum = (inputVal > 0 && inputVal < 1000) ? inputVal * 1000 : inputVal;

    const { error } = await supabase.from('wallets').insert([
      {
        user_id: session.user.id,
        name: walletName,
        balance: balanceNum,
      },
    ]);

    if (error) {
      showToast(`Gagal menambah dompet: ${error.message}`, 'error');
    } else {
      showToast(`Dompet "${walletName}" berhasil ditambahkan!`);
      setWalletName('');
      setWalletBalance('');
      fetchWallets();
    }
  };

  const startEditWallet = (wallet) => {
    setEditingWallet(wallet.id);
    setEditWalletName(wallet.name);
    setEditWalletBalance(wallet.balance.toString());
  };

  const cancelEditWallet = () => {
    setEditingWallet(null);
    setEditWalletName('');
    setEditWalletBalance('');
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    if (!editWalletName || !editingWallet) return;

    let inputVal = parseFloat(editWalletBalance || 0);
    let balanceNum = (inputVal > 0 && inputVal < 1000) ? inputVal * 1000 : inputVal;

    const { error } = await supabase
      .from('wallets')
      .update({
        name: editWalletName,
        balance: balanceNum,
      })
      .eq('id', editingWallet);

    if (error) {
      showToast(`Gagal memperbarui dompet: ${error.message}`, 'error');
    } else {
      showToast(`Dompet "${editWalletName}" berhasil diperbarui!`);
      cancelEditWallet();
      fetchWallets();
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!catName) return;

    const { error } = await supabase.from('categories').insert([
      { name: catName, type: catType }
    ]);

    if (error) {
      showToast(`Gagal menambah kategori: ${error.message}`, 'error');
    } else {
      showToast(`Kategori "${catName}" berhasil ditambahkan!`);
      setCatName('');
      fetchCategories();
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory(category.id);
    setEditCatName(category.name);
    setEditCatType(category.type);
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setEditCatName('');
    setEditCatType('expense');
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editCatName || !editingCategory) return;

    const { error } = await supabase
      .from('categories')
      .update({
        name: editCatName,
        type: editCatType,
      })
      .eq('id', editingCategory);

    if (error) {
      showToast(`Gagal memperbarui kategori: ${error.message}`, 'error');
    } else {
      showToast(`Kategori "${editCatName}" berhasil diperbarui!`);
      cancelEditCategory();
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus kategori: ${error.message}`, 'error');
    } else {
      showToast(`Kategori "${name}" telah dihapus!`);
      fetchCategories();
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!transTitle || !transAmount || !selectedCategory || !selectedWallet) {
      showToast('Mohon lengkapi semua data transaksi!', 'error');
      return;
    }

    let inputVal = parseFloat(transAmount);
    if (isNaN(inputVal) || inputVal <= 0) {
      showToast('Masukkan nominal transaksi yang valid!', 'error');
      return;
    }

    let amountNum = inputVal < 1000 ? inputVal * 1000 : inputVal;

    const { error: transError } = await supabase.from('transactions').insert([
      {
        user_id: session.user.id,
        title: transTitle,
        amount: amountNum,
        type: transType,
        category_id: selectedCategory,
        wallet_id: selectedWallet,
        date: new Date().toISOString(),
      },
    ]);

    if (transError) {
      showToast(`Gagal mencatat transaksi: ${transError.message}`, 'error');
      return;
    }

    const targetWallet = wallets.find((w) => w.id === selectedWallet);
    if (targetWallet) {
      const currentBalance = Number(targetWallet.balance || 0);
      const newBalance = transType === 'income' 
        ? currentBalance + amountNum 
        : currentBalance - amountNum;

      await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('id', selectedWallet);
    }

    const jenisText = transType === 'income' ? 'Pemasukan' : 'Pengeluaran';
    showToast(`${jenisText} "Rp ${amountNum.toLocaleString('id-ID')}" berhasil dicatat!`);

    setTransTitle('');
    setTransAmount('');
    fetchTransactions();
    fetchWallets();
  };

  const handleDeleteTransaction = async (id, walletId, amount, type) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) {
      showToast(`Gagal menghapus: ${error.message}`, 'error');
      return;
    }

    const targetWallet = wallets.find((w) => w.id === walletId);
    if (targetWallet) {
      const currentBalance = Number(targetWallet.balance || 0);
      const amountNum = Number(amount);
      const restoredBalance = type === 'income' 
        ? currentBalance - amountNum 
        : currentBalance + amountNum;

      await supabase
        .from('wallets')
        .update({ balance: restoredBalance })
        .eq('id', walletId);
    }

    showToast('Transaksi berhasil dihapus & saldo dikembalikan!');
    fetchTransactions();
    fetchWallets();
  };

  const getCategoryName = (catId) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.name : '-';
  };

  const getWalletName = (wId) => {
    const found = wallets.find((w) => w.id === wId);
    return found ? found.name : '-';
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '-';

    const dateOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    const formattedDate = d.toLocaleDateString('id-ID', dateOptions);
    const formattedTime = d.toLocaleTimeString('id-ID', timeOptions);

    return `${formattedDate} • ${formattedTime}`;
  };

  // Perhitungan Saldo Total & Target
  const totalWalletBalance = wallets.reduce((acc, curr) => acc + Number(curr.balance || 0), 0);
  const remainingTarget = targetBalance - totalWalletBalance;
  const progressPercentage = Math.min(Math.max((totalWalletBalance / targetBalance) * 100, 0), 100);

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const totalExpense = expenseTransactions.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  // Kalkulasi Statistik Bulanan
  const monthlyStats = transactions.reduce((acc, t) => {
    const d = new Date(t.date || t.created_at);
    if (isNaN(d.getTime())) return acc;

    const monthKey = d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    if (!acc[monthKey]) {
      acc[monthKey] = { income: 0, expense: 0, count: 0 };
    }

    if (t.type === 'income') {
      acc[monthKey].income += Number(t.amount || 0);
    } else {
      acc[monthKey].expense += Number(t.amount || 0);
    }
    acc[monthKey].count += 1;

    return acc;
  }, {});

  const navItems = [
    { id: 'transaksi', label: 'Catat', fullLabel: 'Catat Transaksi', icon: CreditCard },
    { id: 'dompet', label: 'Dompet', fullLabel: 'Dompet', icon: Wallet },
    { id: 'kategori', label: 'Kategori', fullLabel: 'Kategori', icon: FolderPlus },
    { id: 'riwayat', label: 'Riwayat', fullLabel: 'Riwayat', icon: History },
    { id: 'target', label: 'Target', fullLabel: 'Target', icon: Target },
  ];

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200">
          <div className="flex justify-center items-center gap-2 mb-6">
            <BarChart3 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-indigo-600">Syafa Finance</h1>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
              <input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => handleAuth(false)}
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition text-sm shadow-md shadow-indigo-200"
              >
                Login
              </button>
              <button
                onClick={() => handleAuth(true)}
                disabled={loading}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg transition text-sm border border-slate-300"
              >
                Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 pb-20 md:pb-6">
      
      {/* TOAST NOTIFICATION POPUP */}
      {toast.show && (
        <div
          className={`fixed top-4 left-4 right-4 md:left-auto md:right-5 z-50 flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
          <button
            onClick={() => setToast({ ...toast, show: false })}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* NAVBAR LEBAR 100% UNTUK LAPTOP & MOBILE */}
      <nav className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md sticky top-0 z-40 w-full">
        <div className="w-full px-6 md:px-10 py-3 flex items-center justify-between gap-4 relative">
          
          <div className="flex items-center gap-2 shrink-0">
            <BarChart3 className="w-6 h-6 text-white" />
            <h1 className="text-lg sm:text-xl font-bold tracking-wide">Syafa Finance</h1>
          </div>

          {/* Navigasi Desktop Terpusat */}
          <div className="hidden md:flex items-center gap-1 bg-indigo-800/40 p-1 rounded-xl backdrop-blur-sm border border-indigo-400/20 absolute left-1/2 -translate-x-1/2">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-indigo-600 shadow-md font-semibold'
                      : 'text-indigo-100 hover:bg-indigo-500/30'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-indigo-100'}`} />
                  <span>{item.fullLabel}</span>
                </button>
              );
            })}
          </div>

          {/* User Email & Logout */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-block text-xs text-indigo-100 bg-indigo-800/50 px-3 py-1.5 rounded-full border border-indigo-400/30 truncate max-w-[150px] md:max-w-[200px]">
              {session.user.email}
            </span>
            <button
              onClick={handleLogout}
              className="bg-red-500/80 hover:bg-red-600 text-white text-xs px-2.5 py-1.5 rounded-lg transition shadow-sm font-medium shrink-0 flex items-center gap-1"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </nav>

      {/* KONTEN UTAMA */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 my-4 space-y-6">
        
        {/* TAB 1: CATAT TRANSAKSI */}
        {activeTab === 'transaksi' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-800">Catat Transaksi Baru</h2>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Keterangan Transaksi</label>
                  <input
                    type="text"
                    placeholder="Masukkan Keterangan"
                    value={transTitle}
                    onChange={(e) => setTransTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition"
                    required
                  />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-500">Nominal (Rp)</label>
                    <span className="text-[10px] text-indigo-600 font-medium">*Ketik 50 = Rp 50.000</span>
                  </div>
                  <input
                    type="number"
                    placeholder="Masukkan Nominal"
                    value={transAmount}
                    onChange={(e) => setTransAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold text-slate-800 transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Tipe Transaksi</label>
                  <select
                    value={transType}
                    onChange={(e) => setTransType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition bg-white"
                  >
                    <option value="expense">Pengeluaran (-)</option>
                    <option value="income">Pemasukan (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Kategori</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition bg-white"
                  >
                    {filteredCategories.length === 0 ? (
                      <option value="">-- Kategori Kosong --</option>
                    ) : (
                      filteredCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Pilih Dompet</label>
                  <select
                    value={selectedWallet}
                    onChange={(e) => setSelectedWallet(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm transition bg-white"
                  >
                    {wallets.length === 0 ? (
                      <option value="">-- Dompet Kosong --</option>
                    ) : (
                      wallets.map((w) => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md shadow-indigo-100 text-sm flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Transaksi</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: DOMPET */}
        {activeTab === 'dompet' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Kelola Dompet / Rekening</h2>
              </div>
              <div className="bg-indigo-50 text-indigo-700 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border border-indigo-100 self-start sm:self-auto">
                Total Saldo: Rp {totalWalletBalance.toLocaleString('id-ID')}
              </div>
            </div>

            {editingWallet ? (
              <form onSubmit={handleUpdateWallet} className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                    <Pencil className="w-4 h-4" /> Edit Dompet
                  </h4>
                  <button type="button" onClick={cancelEditWallet} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Dompet</label>
                    <input
                      type="text"
                      placeholder="Nama Dompet"
                      value={editWalletName}
                      onChange={(e) => setEditWalletName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
                      required
                    />
                  </div>
                  <div className="w-full sm:w-56">
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-slate-500">Saldo (Rp)</label>
                    </div>
                    <input
                      type="number"
                      placeholder="Masukkan Nominal"
                      value={editWalletBalance}
                      onChange={(e) => setEditWalletBalance(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold bg-white"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditWallet}
                      className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddWallet} className="flex flex-col sm:flex-row gap-3 mb-6 items-stretch sm:items-end">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Nama Dompet</label>
                  <input
                    type="text"
                    placeholder="Nama Dompet (BCA, Cash, GoPay)"
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                    required
                  />
                </div>
                <div className="w-full sm:w-56">
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-500">Saldo Awal (Rp)</label>
                  </div>
                  <input
                    type="number"
                    placeholder="Masukkan Nominal"
                    value={walletBalance}
                    onChange={(e) => setWalletBalance(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              {wallets.length === 0 ? (
                <p className="text-slate-400 text-sm col-span-full text-center py-6">Belum ada dompet terdaftar.</p>
              ) : (
                wallets.map((w) => (
                  <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:border-indigo-200 hover:bg-indigo-50/30 transition flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{w.name}</span>
                        <button
                          onClick={() => startEditWallet(w)}
                          className="text-slate-400 hover:text-indigo-600 p-1 rounded-md hover:bg-indigo-50 transition"
                          title="Edit Dompet"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-1">
                        Rp {Number(w.balance || 0).toLocaleString('id-ID')}
                      </h3>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: KATEGORI */}
        {activeTab === 'kategori' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Kelola Kategori Transaksi</h2>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                Total: {categories.length} Kategori
              </span>
            </div>

            {editingCategory ? (
              <form onSubmit={handleUpdateCategory} className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 mb-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-indigo-900 flex items-center gap-1.5">
                    <Pencil className="w-4 h-4" /> Edit Kategori
                  </h4>
                  <button type="button" onClick={cancelEditCategory} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Nama Kategori"
                    value={editCatName}
                    onChange={(e) => setEditCatName(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
                    required
                  />
                  <select
                    value={editCatType}
                    onChange={(e) => setEditCatType(e.target.value)}
                    className="w-full sm:w-44 px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="expense">Pengeluaran</option>
                    <option value="income">Pemasukan</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditCategory}
                      className="flex-1 sm:flex-none bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-4 py-2 rounded-xl text-sm transition"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Nama Kategori (misal: Makanan, Belanja, Gaji)"
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                  required
                />
                <select
                  value={catType}
                  onChange={(e) => setCatType(e.target.value)}
                  className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white"
                >
                  <option value="expense">Pengeluaran</option>
                  <option value="income">Pemasukan</option>
                </select>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-sm flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah</span>
                </button>
              </form>
            )}

            <div className="flex flex-wrap gap-2">
              {categories.length === 0 ? (
                <p className="text-slate-400 text-sm py-4">Belum ada kategori terdaftar.</p>
              ) : (
                categories.map((c) => (
                  <div
                    key={c.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 shadow-sm transition ${
                      c.type === 'income'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/70'
                        : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/70'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      {c.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownLeft className="w-3.5 h-3.5 text-rose-600" />}
                      {c.name}
                    </span>
                    <div className="flex items-center gap-1 border-l pl-1.5 border-slate-300/60 ml-0.5">
                      <button
                        onClick={() => startEditCategory(c)}
                        className="hover:opacity-75 transition p-0.5"
                        title="Edit Kategori"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="hover:opacity-75 transition p-0.5 text-rose-600"
                        title="Hapus Kategori"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RIWAYAT */}
        {activeTab === 'riwayat' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-800">Riwayat Transaksi</h2>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Total: {transactions.length}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* KOLOM PEMASUKAN */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 border-b border-emerald-100 pb-3">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <ArrowUpRight className="w-5 h-5" />
                    <h3 className="font-bold text-sm sm:text-base">Pemasukan</h3>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
                    + Rp {totalIncome.toLocaleString('id-ID')}
                  </span>
                </div>

                {incomeTransactions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Belum ada pemasukan.</p>
                ) : (
                  <div className="space-y-3">
                    {incomeTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-emerald-50/30 hover:bg-emerald-50/60 transition gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{t.title}</h4>
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                              <span className="bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60 truncate max-w-[100px]">
                                {getCategoryName(t.category_id)}
                              </span>
                              <span className="bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60 truncate max-w-[100px]">
                                {getWalletName(t.wallet_id)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{formatDateTime(t.date || t.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-xs sm:text-sm text-emerald-600 whitespace-nowrap">
                            + Rp {Number(t.amount || 0).toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(t.id, t.wallet_id, t.amount, t.type)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* KOLOM PENGELUARAN */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 border-b border-rose-100 pb-3">
                  <div className="flex items-center gap-2 text-rose-700">
                    <ArrowDownLeft className="w-5 h-5" />
                    <h3 className="font-bold text-sm sm:text-base">Pengeluaran</h3>
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100">
                    - Rp {totalExpense.toLocaleString('id-ID')}
                  </span>
                </div>

                {expenseTransactions.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">Belum ada pengeluaran.</p>
                ) : (
                  <div className="space-y-3">
                    {expenseTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-rose-100 bg-rose-50/30 hover:bg-rose-50/60 transition gap-2"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                            <ArrowDownLeft className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden">
                            <h4 className="font-semibold text-slate-800 text-xs sm:text-sm truncate">{t.title}</h4>
                            <div className="flex flex-wrap items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                              <span className="bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60 truncate max-w-[100px]">
                                {getCategoryName(t.category_id)}
                              </span>
                              <span className="bg-white px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60 truncate max-w-[100px]">
                                {getWalletName(t.wallet_id)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                              <Clock className="w-2.5 h-2.5 text-slate-400" />
                              <span className="truncate">{formatDateTime(t.date || t.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-xs sm:text-sm text-rose-600 whitespace-nowrap">
                            - Rp {Number(t.amount || 0).toLocaleString('id-ID')}
                          </span>
                          <button
                            onClick={() => handleDeleteTransaction(t.id, t.wallet_id, t.amount, t.type)}
                            className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 5: TARGET TABUNGAN & STATISTIK BULANAN */}
        {activeTab === 'target' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            {/* KARTU PROGRES TARGET */}
            <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-indigo-700/50 relative overflow-hidden">
              <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
                <Trophy className="w-48 h-48 sm:w-56 sm:h-56 text-white" />
              </div>

              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/60 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg text-white">Target Saldo Akhir Bulan</h3>
                    <p className="text-[11px] sm:text-xs text-indigo-200">Pantau progres pencapaian target tabunganmu</p>
                  </div>
                </div>

                {isEditingTarget ? (
                  <form onSubmit={handleSaveTarget} className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      placeholder="Target (Masukkan Nominal Targetmu)"
                      value={targetBalanceInput}
                      onChange={(e) => setTargetBalanceInput(e.target.value)}
                      className="px-3 py-1.5 rounded-xl border border-indigo-400 bg-indigo-950/80 text-white text-xs sm:text-sm focus:outline-none flex-1 sm:w-44"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs px-3 py-1.5 rounded-xl font-medium transition"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTarget(false)}
                      className="bg-indigo-900/80 hover:bg-indigo-900 text-indigo-200 text-xs px-3 py-1.5 rounded-xl font-medium transition"
                    >
                      Batal
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => {
                      setTargetBalanceInput(targetBalance.toString());
                      setIsEditingTarget(true);
                    }}
                    className="self-start sm:self-auto bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-100 text-xs px-3 py-1.5 rounded-xl border border-indigo-400/30 transition flex items-center gap-1 font-medium"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Ubah Target</span>
                  </button>
                )}
              </div>

              {/* Rincian Angka Target */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 relative z-10">
                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/50">
                  <span className="text-[11px] text-indigo-300 block mb-0.5">Saldo Saat Ini</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    Rp {totalWalletBalance.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/50">
                  <span className="text-[11px] text-indigo-300 block mb-0.5">Target Bulan Ini</span>
                  <span className="text-base sm:text-lg font-bold text-indigo-200">
                    Rp {targetBalance.toLocaleString('id-ID')}
                  </span>
                </div>

                <div className="bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/50">
                  <span className="text-[11px] text-indigo-300 block mb-0.5">
                    {remainingTarget <= 0 ? 'Status Target' : 'Kekurangan Saldo'}
                  </span>
                  <span
                    className={`text-base sm:text-lg font-bold ${
                      remainingTarget <= 0 ? 'text-emerald-400' : 'text-rose-300'
                    }`}
                  >
                    {remainingTarget <= 0
                      ? '🎉 Target Tercapai!'
                      : `Kurang Rp ${remainingTarget.toLocaleString('id-ID')}`}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative z-10">
                <div className="flex justify-between items-center text-xs text-indigo-200 mb-1 font-medium">
                  <span>Progres Pencapaian</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-indigo-950/80 rounded-full h-3 border border-indigo-800/80 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      progressPercentage >= 100
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-300'
                        : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                    }`}
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* TABEL STATISTIK SALDO BULANAN */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">Statistik Saldo Per Bulan</h3>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  Rekap Bulanan
                </span>
              </div>

              {Object.keys(monthlyStats).length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs sm:text-sm">Belum ada riwayat transaksi bulanan.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(monthlyStats).map(([month, stat]) => {
                    const netIncome = stat.income - stat.expense;
                    return (
                      <div
                        key={month}
                        className="p-3.5 sm:p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition"
                      >
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            {month}
                          </h4>
                          <span className="text-[10px] sm:text-xs text-slate-500 font-medium bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                            {stat.count} Transaksi
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          <div className="bg-emerald-50/60 p-2.5 rounded-lg border border-emerald-100">
                            <span className="text-[10px] text-emerald-700 block">Total Pemasukan</span>
                            <span className="font-bold text-emerald-600 text-xs sm:text-sm">
                              + Rp {stat.income.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="bg-rose-50/60 p-2.5 rounded-lg border border-rose-100">
                            <span className="text-[10px] text-rose-700 block">Total Pengeluaran</span>
                            <span className="font-bold text-rose-600 text-xs sm:text-sm">
                              - Rp {stat.expense.toLocaleString('id-ID')}
                            </span>
                          </div>

                          <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-100">
                            <span className="text-[10px] text-indigo-700 block">Hasil Bersih Bulan Ini</span>
                            <span
                              className={`font-bold text-xs sm:text-sm ${
                                netIncome >= 0 ? 'text-indigo-600' : 'text-rose-600'
                              }`}
                            >
                              {netIncome >= 0 ? '+' : ''} Rp {netIncome.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </main>

      {/* BOTTOM NAVIGATION (KHUSUS TAMPILAN MOBILE) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 px-2 py-1.5 flex justify-around items-center">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full py-1 rounded-xl transition-all ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-indigo-50' : ''}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}