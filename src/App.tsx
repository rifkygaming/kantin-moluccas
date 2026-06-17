/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Utensils, 
  Plus, 
  Minus, 
  Trash2, 
  ClipboardList, 
  CheckCircle2, 
  RotateCcw, 
  Coffee, 
  Cookie,
  User,
  Hash,
  Wallet,
  Receipt,
  Printer,
  ChevronRight,
  MapPin,
  Truck,
  ExternalLink,
  Info,
  Clock,
  Sparkles,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import data dan tipe data yang sudah kita buat tadi
import { MenuItem, CartItem, OrderDetails } from './types';
import { DAFTAR_MENU } from './data/menu';

export default function App() {
  // ==========================================
  // STATE DAN STATE HANDLER (KHAS PEMULA / RE-USABLE)
  // ==========================================

  // State untuk mencari makanan / minuman
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State untuk menyaring kategori (semua, makanan, minuman, cemilan)
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');

  // State untuk menyimpan daftar item di keranjang belanja
  const [cart, setCart] = useState<CartItem[]>([]);

  // State untuk input form rincian pesanan (ditambah alamat, kurir, catatanDriver)
  const [formOrder, setFormOrder] = useState<OrderDetails>({
    namaPemesan: '',
    nomorMeja: '',
    tipePesanan: 'dine-in',
    metodeBayar: 'tunai',
    alamatPengiriman: '',
    metodeKirim: 'kurir-kedai',
    catatanDriver: '',
  });

  // State dialog GoFood & Online Order
  const [activeGoFoodItem, setActiveGoFoodItem] = useState<MenuItem | null>(null);
  const [showGoFoodHub, setShowGoFoodHub] = useState<boolean>(false);

  // State untuk menampilkan struk belanja (Modal Checkout Sukses)
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<{
    idOrder: string;
    items: CartItem[];
    details: OrderDetails;
    subtotal: number;
    pajak: number;
    ongkir: number;
    total: number;
    waktu: string;
  } | null>(null);

  // State untuk menampung error form validation (ditambah alamat)
  const [formErrors, setFormErrors] = useState<{ nama?: string; meja?: string; alamat?: string }>({});

  // State catatan sementara sebelum dimasukkan ke keranjang
  const [tempNotes, setTempNotes] = useState<{ [itemId: string]: string }>({});

  // ==========================================
  // FUNGSI MEMO / LOGIKA PENCARIAN & FILTER
  // ==========================================
  const filteredMenuProducts = useMemo(() => {
    return DAFTAR_MENU.filter((item) => {
      // Filter berdasarkan kategori tab
      const matchCategory = selectedCategory === 'semua' || item.kategori === selectedCategory;
      // Filter dengan kata kunci pencarian menggunakan lower case
      const matchSearch = item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.fitur.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory]);

  // ==========================================
  // FUNGSI AKSI KERANJANG (CART OPERATIONS)
  // ==========================================

  // Fungsi tambah makanan ke keranjang
  const handleAddToCart = (item: MenuItem) => {
    if (!item.tersedia) return; // Mencegah masuk keranjang jika stok kosong

    setCart((prevCart) => {
      // Cek apakah item sudah ada di keranjang sebelumnya
      const existingProductIndex = prevCart.findIndex((cartItem) => cartItem.menuItem.id === item.id);
      
      if (existingProductIndex > -1) {
        // Jika sudah ada, tambahkan kuantitasnya saja
        const newCart = [...prevCart];
        newCart[existingProductIndex].jumlah += 1;
        // Pertahankan catatan lama atau gabungkan dengan yang baru
        return newCart;
      } else {
        // Jika belum ada, masukkan item baru
        return [...prevCart, { 
          menuItem: item, 
          jumlah: 1, 
          catatan: tempNotes[item.id] || '' 
        }];
      }
    });

    // Reset catatan sementara setelah ditambahkan
    setTempNotes(prev => {
      const updated = { ...prev };
      delete updated[item.id];
      return updated;
    });
  };

  // Fungsi kurangi jumlah item atau hapus jika kuantitasnya 1
  const handleRemoveFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((cartItem) => cartItem.menuItem.id === itemId);
      if (existingIndex === -1) return prevCart;

      const newCart = [...prevCart];
      if (newCart[existingIndex].jumlah > 1) {
        newCart[existingIndex].jumlah -= 1;
        return newCart;
      } else {
        // Hapus jika tinggal satu item
        return prevCart.filter((cartItem) => cartItem.menuItem.id !== itemId);
      }
    });
  };

  // Fungsi hapus total item tanpa batasan jumlah
  const handleTrashCartItem = (itemId: string) => {
    setCart((prevCart) => prevCart.filter((cartItem) => cartItem.menuItem.id !== itemId));
  };

  // Fungsi mengganti teks catatan belanja per item
  const handleUpdateItemNote = (itemId: string, noteText: string) => {
    setCart((prevCart) => {
      return prevCart.map((cartItem) => {
        if (cartItem.menuItem.id === itemId) {
          return { ...cartItem, catatan: noteText };
        }
        return cartItem;
      });
    });
  };

  // ==========================================
  // PERHITUNGAN TOTAL BIAYA (MATHEMATICS LOGIC)
  // ==========================================
  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.menuItem.harga * curr.jumlah), 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    // Biaya layanan atau admin sebesar 10% (mirip ppn / kasir kantin asli)
    return Math.round(cartSubtotal * 0.1);
  }, [cartSubtotal]);

  // Biaya Ongkos Kirim untuk Pesanan Online
  const deliveryFee = useMemo(() => {
    if (formOrder.tipePesanan !== 'online-delivery') return 0;
    if (formOrder.metodeKirim === 'gojek') return 15000;
    if (formOrder.metodeKirim === 'grab') return 16000;
    return 10000; // kurir internal kedai khas Maluku
  }, [formOrder.tipePesanan, formOrder.metodeKirim]);

  const totalPayment = useMemo(() => {
    return cartSubtotal + taxAmount + deliveryFee;
  }, [cartSubtotal, taxAmount, deliveryFee]);

  // Total kuantitas barang di keranjang
  const totalCartItemsCount = useMemo(() => {
    return cart.reduce((acc, curr) => acc + curr.jumlah, 0);
  }, [cart]);

  // ==========================================
  // LOGIKA CHECKOUT & VALIDASI FORM
  // ==========================================
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reset error terlebih dahulu
    const errors: { nama?: string; meja?: string; alamat?: string } = {};

    // Validasi dasar: Nama pembeli tidak boleh kosong
    if (!formOrder.namaPemesan.trim()) {
      errors.nama = 'Nama pemesan wajib diisi!';
    }

    // Validasi nomor meja jika memesan Dine-In (makan di tempat)
    if (formOrder.tipePesanan === 'dine-in' && !formOrder.nomorMeja.trim()) {
      errors.meja = 'Nomor meja harus diisi jika makan di tempat!';
    }

    // Validasi alamat pengiriman jika memesan Online Delivery
    if (formOrder.tipePesanan === 'online-delivery' && !formOrder.alamatPengiriman?.trim()) {
      errors.alamat = 'Alamat pengiriman lengkap wajib diisi!';
    }

    // Jika ada error, hentikan pengisian
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Clear error jika sukses lolos validasi
    setFormErrors({});

    // Generate ID rincian pesanan acak (Khas aplikasi mahasiswa)
    const randomOrderId = 'ORD-' + Math.floor(Math.random() * 90000 + 10000);
    const orderTime = new Date().toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Pindahkan ke state order selesai
    setCompletedOrder({
      idOrder: randomOrderId,
      items: [...cart],
      details: { ...formOrder },
      subtotal: cartSubtotal,
      pajak: taxAmount,
      ongkir: deliveryFee,
      total: totalPayment,
      waktu: orderTime
    });

    // Tampilkan struk digital belanja
    setShowReceipt(true);
  };

  // Fungsi mereset seluruh aplikasi setelah transaksi sukses selesai
  const handleResetApp = () => {
    setCart([]);
    setFormOrder({
      namaPemesan: '',
      nomorMeja: '',
      tipePesanan: 'dine-in',
      metodeBayar: 'tunai',
      alamatPengiriman: '',
      metodeKirim: 'kurir-kedai',
      catatanDriver: '',
    });
    setCompletedOrder(null);
    setShowReceipt(false);
    setTempNotes({});
    setIsCopied(false);
  };

  return (
    <div id="aplikasi-menu-kantin" className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-12">
      {/* 1. Header Sederhana Mirip Hasil Coding Sendiri */}
      <header id="header-kantin" className="sticky top-0 z-10 bg-white border-b border-slate-200 shadow-sm py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Logo Samping Kiri */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-lg shadow-sm">
              <Utensils size={24} className="stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Kedai Khas Maluku
              </h1>
              <p className="text-xs text-amber-600 font-medium tracking-wide">
                Menu Tradisional Maluku & Pemesanan Mandiri
              </p>
            </div>
          </div>

          {/* Label Kelompok / Keterangan Tugas di pojok kanan agar nampak orisinil */}
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 py-1.5 px-3 rounded-full text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <b>Praktek Kuliah Pemrograman Web - Mandiri</b>
          </div>

        </div>
      </header>

      {/* 2. Container Halaman Utama */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        
        {/* Banner Selamat Datang & GoFood Promo */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 mb-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transform translate-x-4 -translate-y-4">
            <Utensils size={180} />
          </div>
          <div className="space-y-2 relative z-1">
            <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs tracking-wider inline-flex items-center gap-1">
              <Sparkles size={11} className="fill-slate-900" /> BISA PESAN ONLINE & MITRA UTAMA GOFOOD
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2 tracking-tight">
              👋 Selamat Datang di Kedai Khas Maluku!
            </h2>
            <p className="text-sm text-amber-50 max-w-2xl leading-relaxed font-medium">
              Nikmati cita rasa kuliner tradisional Ambon, mulai dari Papeda hangat bersiram kuah kuning segar, Kohu-kohu cakalang, hingga Kopi Sibu-sibu Kenari yang wangi. Kami melayani makan di tempat, bawa pulang, pesan pengantaran online langsung, dan mitra terverifikasi GoFood!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0 w-full md:w-auto relative z-1">
            <button
              onClick={() => setShowGoFoodHub(true)}
              className="bg-white hover:bg-neutral-50 text-red-600 font-extrabold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all border border-transparent hover:border-red-100 cursor-pointer active:scale-95"
            >
              <ExternalLink size={14} /> Pesan Cepat GoFood
            </button>
            <div className="text-xs bg-black/25 text-white/90 px-4 py-3 rounded-xl border border-white/15 backdrop-blur-xs flex flex-col justify-center items-center font-medium">
              <div>Buka Setiap Hari</div>
              <div className="font-bold text-amber-300">08:30 - 17:00 WIT</div>
            </div>
          </div>
        </div>

        {/* Tata Letak Utama (Grid Column Pecah Pasir) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* SISI KIRI (Grid Menu - 7 Col) */}
          <section id="sisi-kiri-menu" className="lg:col-span-7 space-y-6">
            
            {/* Navigasi Filter & Kolom Pencarian */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
              
              {/* Kolom Cari */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search size={18} />
                </div>
                <input
                  id="kolom-pencarian"
                  type="text"
                  placeholder="Mau makan apa hari ini? Cari nama menu, deskripsi, atau rasa..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 font-medium"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Tombol Filter Kategori */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-2">
                  Kategori:
                </span>
                
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('semua')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    selectedCategory === 'semua'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🍔 Semua Menu
                </button>

                {/* Makanan */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('makanan')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                    selectedCategory === 'makanan'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Utensils size={13} /> Makanan
                </button>

                {/* Minuman */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('minuman')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                    selectedCategory === 'minuman'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Coffee size={13} /> Minuman
                </button>

                {/* Cemilan */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('cemilan')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                    selectedCategory === 'cemilan'
                      ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Cookie size={13} /> Cemilan
                </button>
              </div>

            </div>

            {/* Hasil Pencarian / Grid Menu */}
            <div id="daftar-menu-grid">
              {filteredMenuProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredMenuProducts.map((item) => {
                    const quantityInCart = cart.find(c => c.menuItem.id === item.id)?.jumlah || 0;

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col justify-between transition-all ${
                          !item.tersedia 
                            ? 'opacity-65 border-dashed border-slate-200 bg-slate-100/50' 
                            : 'border-slate-200 hover:shadow-md hover:border-slate-300'
                        }`}
                      >
                        {/* 1. Header Gambar Makanan / Minuman */}
                        {item.gambar && (
                          <div className="relative h-44 w-full overflow-hidden bg-slate-100 group shrink-0 border-b border-slate-100">
                            <img
                              src={item.gambar}
                              alt={item.nama}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {/* Floating Category Badge */}
                            <span className="absolute top-2.5 left-2.5 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-white/95 backdrop-blur-xs text-amber-900 shadow-xs border border-amber-100/50 flex items-center gap-1">
                              <span>{item.emoji}</span>
                              <span>{item.kategori}</span>
                            </span>
                            
                            {/* Floating GoFood Badge */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveGoFoodItem(item);
                              }}
                              className="absolute top-2.5 right-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-[10px] font-extrabold px-2 py-1 shadow-md active:scale-95 transition-transform flex items-center gap-1 cursor-pointer border border-white/20"
                            >
                              <ExternalLink size={10} /> GoFood
                            </button>
                            
                            {/* Rendiment Porsi & Waktu Saji */}
                            <div className="absolute bottom-2 left-2 right-2 bg-gradient-to-t from-black/75 to-transparent p-2 pt-4 rounded-b-lg flex justify-between text-[11px] text-white">
                              <span className="font-semibold flex items-center gap-1">⏱️ {item.waktuSaji}</span>
                              <span className="font-semibold flex items-center gap-1">🍽️ {item.estimasiPorsi}</span>
                            </div>
                          </div>
                        )}

                        {/* Konten Utama Menu */}
                        <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                                {item.nama}
                              </h3>
                              {/* Spiciness indicator */}
                              {item.tingkatPedas !== undefined && item.tingkatPedas > 0 && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/50 px-1.5 py-0.5 rounded flex items-center whitespace-nowrap shrink-0">
                                  🌶️ {Array(item.tingkatPedas).fill('🌶️').join('')}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {item.deskripsi}
                            </p>
                          </div>

                          {/* Fitur/Gambaran Menu */}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {item.fitur.map((tag, idx) => (
                              <span key={idx} className="text-[9px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded transition-colors border border-slate-200/30">
                                🏷️ {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Harga & Tombol Tambah */}
                        <div className="p-4 pt-1.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
                          <div>
                            <span className="text-xs text-slate-400 font-medium">Harga</span>
                            <p className="font-extrabold text-amber-600 text-base">
                              Rp {item.harga.toLocaleString('id-ID')}
                            </p>
                          </div>

                          {/* Kondisi Tombol: Tersedia vs Habis */}
                          {item.tersedia ? (
                            <div className="flex items-center gap-1.5">
                              {quantityInCart > 0 && (
                                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1.5 rounded-lg border border-amber-200 shrink-0">
                                  {quantityInCart} pcs
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleAddToCart(item)}
                                className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform"
                                title="Tambahkan ke Keranjang"
                              >
                                <Plus size={14} className="stroke-[3]" /> Tambah
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-lg">
                              ❌ Stok Habis
                            </span>
                          )}
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 text-center border border-slate-200 rounded-xl space-y-2">
                  <span className="text-4xl block">🔍</span>
                  <p className="font-bold text-slate-700 text-sm">Menu tidak ditemukan</p>
                  <p className="text-xs text-slate-500">Coba ganti kata kunci pencarian atau bersihkan filter.</p>
                  <button
                    onClick={() => { setSearchQuery(''); setSelectedCategory('semua'); }}
                    className="mt-2 text-xs font-bold text-amber-600 hover:underline"
                  >
                    Atur Ulang Pencarian
                  </button>
                </div>
              )}
            </div>

            {/* Panduan Pemesanan Online & GoFood */}
            <div className="p-4 bg-slate-200/50 border border-slate-200 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  📝 Alur Pemesanan Mandiri
                </h4>
                <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                  <li>Pilih menu lokal khas Maluku berselera.</li>
                  <li>Sesuaikan dengan porsi, level pedas, dan rincian masakan.</li>
                  <li>Masukkan data rincian di keranjang untuk diproses.</li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  🛵 Layanan Antar & GoFood
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kami bekerja sama dengan ojek online Gojek (GoSend/GoFood) serta Grab untuk pengantaran kilat ke rumah atau kos Anda di area kota Ambon.
                </p>
              </div>
            </div>

          </section>

          {/* SISI KANAN (Keranjang Belanja & Pembayaran - 5 Col) */}
          <section id="sisi-kanan-keranjang" className="lg:col-span-5 space-y-6">

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              
              {/* Judul Keranjang */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} className="text-amber-400" />
                  <h3 className="font-bold text-sm">Daftar Keranjang Anda</h3>
                </div>
                
                {/* Total Jumlah Item */}
                <span className="text-xs font-bold bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-full">
                  {totalCartItemsCount} Item
                </span>
              </div>

              {/* Konten Keranjang Belanja */}
              <div className="p-4 space-y-4">
                
                {cart.length > 0 ? (
                  <>
                    {/* List Item per item dalam keranjang */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 pr-1 space-y-3">
                      {cart.map((cartItem) => (
                        <div key={cartItem.menuItem.id} className="pt-3 first:pt-0 space-y-2">
                          
                          <div className="flex items-start justify-between gap-2">
                            {/* Emoji dan Nama */}
                            <div className="flex items-start gap-2.5">
                              <span className="text-xl shrink-0 mt-0.5">{cartItem.menuItem.emoji}</span>
                              <div>
                                <h4 className="font-bold text-xs text-slate-800 leading-tight">
                                  {cartItem.menuItem.nama}
                                </h4>
                                <p className="text-[11px] text-slate-400 font-medium">
                                  Rp {cartItem.menuItem.harga.toLocaleString('id-ID')} / pcs
                                </p>
                              </div>
                            </div>

                            {/* Tombol Jumlah Tambah/Kurang */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-slate-100 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleRemoveFromCart(cartItem.menuItem.id)}
                                className="w-5 h-5 bg-white text-slate-600 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-xs shadow-sm transition-transform active:scale-90"
                              >
                                <Minus size={11} className="stroke-[3]" />
                              </button>
                              <span className="text-xs font-bold text-slate-800 px-1 min-w-[14px] text-center">
                                {cartItem.jumlah}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(cartItem.menuItem)}
                                className="w-5 h-5 bg-white text-slate-600 hover:bg-slate-200 rounded flex items-center justify-center font-bold text-xs shadow-sm transition-transform active:scale-90"
                              >
                                <Plus size={11} className="stroke-[3]" />
                              </button>
                            </div>
                          </div>

                          {/* Catatan Khusus & Hitungan Subtotal Terkecil */}
                          <div className="flex items-center justify-between gap-4 pl-8">
                            {/* Form Input Catatan kecil untuk ditarik ke dapur */}
                            <div className="flex-1">
                              <input
                                type="text"
                                placeholder="Tambahkan catatan khusus ke dapur..."
                                value={cartItem.catatan || ''}
                                onChange={(e) => handleUpdateItemNote(cartItem.menuItem.id, e.target.value)}
                                className="w-full text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2 py-1 rounded focus:outline-none focus:bg-white focus:border-amber-400 transition-colors"
                              />
                            </div>

                            {/* Subtotal Item */}
                            <div className="text-right shrink-0">
                              <span className="text-xs font-bold text-slate-800">
                                Rp {(cartItem.menuItem.harga * cartItem.jumlah).toLocaleString('id-ID')}
                              </span>
                              
                              {/* Tombol Tempat Sampah untuk membuang satu baris sekaligus */}
                              <button 
                                onClick={() => handleTrashCartItem(cartItem.menuItem.id)}
                                className="ml-2 text-slate-300 hover:text-rose-500 transition-colors"
                                title="Hapus Item"
                              >
                                <Trash2 size={12} className="inline-block mt-[-2px]" />
                              </button>
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>

                    <hr className="border-slate-100" />

                    {/* Form Identitas Pelanggan (Detail Meja & Kasir) */}
                    <form onSubmit={handleCheckoutSubmit} className="space-y-4 pt-2">
                      
                      <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1.5 rounded-md uppercase tracking-wider flex items-center gap-1.5">
                        <ClipboardList size={13} />
                        Isi Rincian Pesanan Anda
                      </div>

                      {/* Nama Pemesan */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <User size={12} className="text-slate-400" /> Nama Pembeli <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ketik nama Anda di sini..."
                          value={formOrder.namaPemesan}
                          onChange={(e) => {
                            setFormOrder(prev => ({ ...prev, namaPemesan: e.target.value }));
                            if (e.target.value.trim()) {
                              setFormErrors(prev => ({ ...prev, nama: undefined }));
                            }
                          }}
                          className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                            formErrors.nama 
                              ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                              : 'border-slate-200 focus:ring-amber-200 focus:border-amber-500'
                          }`}
                        />
                        {formErrors.nama && (
                          <p className="text-[10px] text-red-500 font-bold">{formErrors.nama}</p>
                        )}
                      </div>

                      {/* Tipe Pesanan & Nomor Meja */}
                      <div id="tipe-pesanan-group" className="grid grid-cols-2 gap-3">
                        
                        {/* Tipe Penyajian */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600">Tipe Layanan</label>
                          <select
                            value={formOrder.tipePesanan}
                            onChange={(e) => {
                              const val = e.target.value as 'dine-in' | 'take-away' | 'online-delivery';
                              setFormOrder(prev => ({ 
                                ...prev, 
                                tipePesanan: val,
                                // Atur keterangan meja default
                                nomorMeja: val === 'dine-in' ? '' : val === 'take-away' ? 'Dibungkus (Take-Away)' : 'Kirim Kurir'
                              }));
                              setFormErrors(prev => ({ ...prev, meja: undefined, alamat: undefined }));
                            }}
                            className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500 font-semibold"
                          >
                            <option value="dine-in">🍛 Makan Di Sini</option>
                            <option value="take-away">🛍️ Dibungkus (Take-Away)</option>
                            <option value="online-delivery">🛵 Antar Online (Delivery)</option>
                          </select>
                        </div>

                        {/* Nomor Meja */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                            <Hash size={12} className="text-slate-400" /> No. Meja / Lokasi
                          </label>
                          <input
                            type="text"
                            placeholder={formOrder.tipePesanan === 'online-delivery' ? 'Alamat Pengiriman' : 'Contoh: Meja 04'}
                            value={formOrder.nomorMeja}
                            disabled={formOrder.tipePesanan !== 'dine-in'}
                            onChange={(e) => {
                              setFormOrder(prev => ({ ...prev, nomorMeja: e.target.value }));
                              if (e.target.value.trim()) {
                                setFormErrors(prev => ({ ...prev, meja: undefined }));
                              }
                            }}
                            className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-200 transition-all ${
                              formErrors.meja 
                                ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                : 'border-slate-200 focus:ring-amber-200 focus:border-amber-500'
                            }`}
                          />
                          {formErrors.meja && (
                            <p className="text-[10px] text-red-500 font-bold">{formErrors.meja}</p>
                          )}
                        </div>

                      </div>

                      {/* Form Pengiriman Khusus Alamat Delivery */}
                      {formOrder.tipePesanan === 'online-delivery' && (
                        <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-lg space-y-3">
                          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/50 pb-1">
                            <MapPin size={13} className="text-red-500 animate-bounce" />
                            Detail Alamat Pengiriman
                          </label>
                          
                          {/* Alamat Lengkap */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">Alamat Lengkap <span className="text-red-500">*</span></label>
                            <textarea
                              rows={2}
                              placeholder="Ketik Alamat Lengkap Kos, Rumah, atau Kantor Anda di Ambon..."
                              value={formOrder.alamatPengiriman}
                              onChange={(e) => {
                                setFormOrder(prev => ({ ...prev, alamatPengiriman: e.target.value }));
                                if (e.target.value.trim()) {
                                  setFormErrors(prev => ({ ...prev, alamat: undefined }));
                                }
                              }}
                              className={`w-full text-xs px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                                formErrors.alamat 
                                  ? 'border-red-300 bg-red-50 focus:ring-red-200' 
                                  : 'border-slate-200 focus:ring-amber-200 focus:border-amber-500'
                              }`}
                            />
                            {formErrors.alamat && (
                              <p className="text-[10px] text-red-500 font-bold">{formErrors.alamat}</p>
                            )}
                          </div>

                          {/* Pilihan Kurir */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                              <Truck size={12} className="text-slate-400" /> Metode Pengiriman
                            </label>
                            <select
                              value={formOrder.metodeKirim}
                              onChange={(e) => {
                                setFormOrder(prev => ({ ...prev, metodeKirim: e.target.value as any }));
                              }}
                              className="w-full text-xs px-2.5 py-2 border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-amber-500 font-semibold text-slate-700"
                            >
                              <option value="kurir-kedai">🛵 Kurir Kedai (Ambon Area) - Rp 10.000</option>
                              <option value="gojek">🚗 GoSend Gojek Instant - Rp 15.000</option>
                              <option value="grab">🚕 Grab Express Instant - Rp 16.000</option>
                            </select>
                          </div>

                          {/* Catatan Driver */}
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600">Catatan untuk Kurir (Opsional)</label>
                            <input
                              type="text"
                              placeholder="Contoh: Depan Kampus, pagar warna biru..."
                              value={formOrder.catatanDriver}
                              onChange={(e) => setFormOrder(prev => ({ ...prev, catatanDriver: e.target.value }))}
                              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}

                      {/* Metode Pembayaran */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <Wallet size={12} className="text-slate-400" /> Metode Pembayaran
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {/* Tunai Kasir */}
                          <label className={`border rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all ${
                            formOrder.metodeBayar === 'tunai' 
                              ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">💵</span>
                              <span className="text-[11px] font-bold text-slate-700">Tunai Kasir</span>
                            </div>
                            <input
                              type="radio"
                              name="metodeBayar"
                              value="tunai"
                              checked={formOrder.metodeBayar === 'tunai'}
                              onChange={() => setFormOrder(p => ({ ...p, metodeBayar: 'tunai' }))}
                              className="accent-amber-600 scale-90"
                            />
                          </label>

                          {/* QRIS Mandiri */}
                          <label className={`border rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all ${
                            formOrder.metodeBayar === 'qris' 
                              ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">📱</span>
                              <span className="text-[11px] font-bold text-slate-700">QRIS Mandiri</span>
                            </div>
                            <input
                              type="radio"
                              name="metodeBayar"
                              value="qris"
                              checked={formOrder.metodeBayar === 'qris'}
                              onChange={() => setFormOrder(p => ({ ...p, metodeBayar: 'qris' }))}
                              className="accent-amber-600 scale-90"
                            />
                          </label>

                          {/* GoPay */}
                          <label className={`border rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all ${
                            formOrder.metodeBayar === 'gopay' 
                              ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">❤️</span>
                              <span className="text-[11px] font-bold text-slate-700">GoPay Coins</span>
                            </div>
                            <input
                              type="radio"
                              name="metodeBayar"
                              value="gopay"
                              checked={formOrder.metodeBayar === 'gopay'}
                              onChange={() => setFormOrder(p => ({ ...p, metodeBayar: 'gopay' }))}
                              className="accent-amber-600 scale-90"
                            />
                          </label>

                          {/* ShopeePay */}
                          <label className={`border rounded-lg p-2 flex items-center justify-between cursor-pointer transition-all ${
                            formOrder.metodeBayar === 'shopeepay' 
                              ? 'border-amber-500 bg-amber-50/50 ring-1 ring-amber-500' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs">🧡</span>
                              <span className="text-[11px] font-bold text-slate-700">ShopeePay</span>
                            </div>
                            <input
                              type="radio"
                              name="metodeBayar"
                              value="shopeepay"
                              checked={formOrder.metodeBayar === 'shopeepay'}
                              onChange={() => setFormOrder(p => ({ ...p, metodeBayar: 'shopeepay' }))}
                              className="accent-amber-600 scale-90"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Rincian Finansial (Kalkulasi) */}
                      <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg space-y-2 pt-3">
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Subtotal Belanja:</span>
                          <span className="font-semibold text-slate-700">
                            Rp {cartSubtotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                        
                        <div className="flex justify-between text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            Biaya Layanan & Admin (10%):
                          </span>
                          <span className="font-semibold text-slate-700">
                            Rp {taxAmount.toLocaleString('id-ID')}
                          </span>
                        </div>

                        {formOrder.tipePesanan === 'online-delivery' && (
                          <div className="flex justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              Ongkos Kirim ({formOrder.metodeKirim === 'kurir-kedai' ? 'Kurir Kedai' : formOrder.metodeKirim === 'gojek' ? 'Gojek' : 'Grab'}):
                            </span>
                            <span className="font-semibold text-amber-600">
                              Rp {deliveryFee.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}

                        <hr className="border-slate-200/60 my-1" />

                        <div className="flex justify-between text-sm">
                          <span className="font-bold text-slate-800">Total Akhir Tagihan:</span>
                          <span className="font-extrabold text-amber-600 text-base">
                            Rp {totalPayment.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>

                      {/* Tombol Kirim Pesanan */}
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-lg flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform cursor-pointer"
                      >
                        <Receipt size={16} />
                        Kirim Pesanan & Buat Struk
                      </button>

                    </form>
                  </>
                ) : (
                  // Kondisi Keranjang Masih Kosong
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <span className="text-4xl block opacity-60">🛍️</span>
                    <p className="font-bold text-slate-600 text-xs">Keranjang Belanja Kosong</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                      Silakan tekan tombol <b>"Tambah"</b> di menu sebelah kiri untuk memasukkan makanan ke wadah pesanan.
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Tombol Mereset Seluruh State Jika Diperlukan */}
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleResetApp}
                className="w-full text-center py-2 text-xs font-semibold text-slate-400 hover:text-rose-600 active:scale-95 transition-all flex items-center justify-center gap-1 border border-dashed border-slate-200 rounded-lg hover:bg-rose-50 hover:border-rose-200/50"
              >
                <RotateCcw size={12} /> Hapus & Kosongkan Keranjang
              </button>
            )}

          </section>

        </div>
      </main>

      {/* ==========================================
          MODAL STRUK BELANJA (INVOICE / RECEIPT POP-UP)
          Hadir dengan layout cetak kasir yang sangat nyata
          ========================================== */}
      <AnimatePresence>
        {showReceipt && completedOrder && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden my-8"
            >
              
              {/* Header Modal Sukses */}
              <div className="bg-emerald-600 text-white p-5 text-center space-y-1">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} className="text-emerald-100" />
                </div>
                <h3 className="font-extrabold text-base">Pesanan Berhasil Diproses!</h3>
                <p className="text-xs text-emerald-100">Silakan simpan rincian pembayaran atau teruskan ke WhatsApp.</p>
              </div>

              {/* TAMPILAN RESI TERINSPIRASI OLEH STRUK FISIK KERTAS (RECEIPT PAPER) */}
              <div className="p-6 bg-slate-50 border-b border-dashed border-slate-200 max-h-[60vh] overflow-y-auto">
                
                {/* Desain Kertas Resi */}
                <div className="bg-white border border-slate-300/60 shadow-xs p-5 rounded-md font-mono text-xs space-y-4 relative">
                  
                  {/* Efek Gerigi Kertas atas (hiasan CSS) */}
                  <div className="absolute top-0 inset-x-0 h-1 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-200 to-transparent"></div>

                  {/* Info Kedai */}
                  <div className="text-center space-y-1">
                    <p className="font-bold text-sm tracking-tight uppercase text-slate-800">🌴 KEDAI KHAS MALUKU 🌴</p>
                    <p className="text-[10px] text-slate-500">Jl. Ir. M. Putuhena, Poka, Kota Ambon</p>
                    <p className="border-b border-dashed border-slate-200 py-1"></p>
                  </div>

                  {/* Detail Metadata Transaksi */}
                  <div className="space-y-1 text-slate-600 text-[11px]">
                    <div className="flex justify-between">
                      <span>No. Nota:</span>
                      <span className="font-bold text-slate-800">{completedOrder.idOrder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waktu:</span>
                      <span>{completedOrder.waktu}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pelanggan:</span>
                      <span className="font-bold text-slate-800 uppercase">{completedOrder.details.namaPemesan}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penyajian:</span>
                      <span className="font-semibold text-slate-800">
                        {completedOrder.details.tipePesanan === 'online-delivery' ? '🛵 Antar Online (Delivery)' : completedOrder.details.tipePesanan === 'take-away' ? '🛍️ Dibungkus (Take-Away)' : '🍛 Makan Di Tempat'}
                      </span>
                    </div>
                    
                    {completedOrder.details.tipePesanan === 'dine-in' && (
                      <div className="flex justify-between">
                        <span>No. Meja:</span>
                        <span className="font-bold text-amber-600">{completedOrder.details.nomorMeja}</span>
                      </div>
                    )}

                    {completedOrder.details.tipePesanan === 'online-delivery' && (
                      <div className="bg-slate-50 p-2 rounded border border-slate-200/50 space-y-1 mt-2 text-[10px] text-slate-600 leading-relaxed norm">
                        <p className="font-bold text-slate-800">📍 ALAMAT PENGIRIMAN:</p>
                        <p className="text-slate-700 font-medium">{completedOrder.details.alamatPengiriman}</p>
                        <p className="font-bold text-slate-800 mt-1">🚚 JASA KURIR:</p>
                        <p className="text-slate-700 font-medium uppercase">{completedOrder.details.metodeKirim === 'kurir-kedai' ? 'Kurir Kedai' : completedOrder.details.metodeKirim === 'gojek' ? 'Gojek Instant' : 'Grab Express'}</p>
                        {completedOrder.details.catatanDriver && (
                          <>
                            <p className="font-bold text-slate-800 mt-1">📝 CATATAN DRIVER:</p>
                            <p className="italic text-slate-600">"{completedOrder.details.catatanDriver}"</p>
                          </>
                        )}
                      </div>
                    )}
                    <p className="border-b border-dashed border-slate-200 py-1"></p>
                  </div>

                  {/* List Daftar Pemesanan Makanan */}
                  <div className="space-y-2">
                    <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider">Item Makanan:</p>
                    <div className="space-y-2 divide-y divide-slate-100">
                      {completedOrder.items.map((item, index) => (
                        <div key={item.menuItem.id} className="pt-2 first:pt-0 text-[11px] text-slate-700">
                          <div className="flex justify-between font-medium">
                            <span>
                              {index + 1}. {item.menuItem.nama}
                            </span>
                            <span>{item.jumlah}x</span>
                          </div>
                          
                          {/* Harga Satuan x Jumlah */}
                          <div className="flex justify-between text-[10px] text-slate-400 pl-3">
                            <span>
                              @ Rp {item.menuItem.harga.toLocaleString('id-ID')}
                            </span>
                            <span>
                              Rp {(item.menuItem.harga * item.jumlah).toLocaleString('id-ID')}
                            </span>
                          </div>

                          {/* Detail Catatan khusus masak */}
                          {item.catatan && (
                            <p className="text-[10px] text-amber-600 bg-amber-50 rounded px-1.5 py-0.5 mt-0.5 italic flex items-start gap-1">
                              <span>💬</span>
                              <span>"{item.catatan}"</span>
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="border-b border-dashed border-slate-200 py-1"></p>
                  </div>

                  {/* Rincian Perhitungan Bayar Resi */}
                  <div className="space-y-1 text-slate-700 text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>Rp {completedOrder.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya Layanan & Admin (10%):</span>
                      <span>Rp {completedOrder.pajak.toLocaleString('id-ID')}</span>
                    </div>
                    {completedOrder.details.tipePesanan === 'online-delivery' && (
                      <div className="flex justify-between">
                        <span>Ongkos Kirim:</span>
                        <span>Rp {completedOrder.ongkir.toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-extrabold text-slate-800 pt-1 border-t border-dotted border-slate-200">
                      <span>TOTAL BAYAR:</span>
                      <span className="text-amber-600 text-sm">Rp {completedOrder.total.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  {/* Ringkasan Bayar */}
                  <div className="text-center pt-3 border-t border-dashed border-slate-200 space-y-1">
                    <p className="text-[11px] font-bold text-slate-700 flex flex-wrap items-center justify-center gap-1">
                      <span>Cara Bayar:</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] tracking-wider uppercase text-slate-800">
                        {completedOrder.details.metodeBayar === 'tunai' ? '💵 Tunai Kasir' : completedOrder.details.metodeBayar === 'qris' ? '📱 QRIS Mandiri' : completedOrder.details.metodeBayar === 'gopay' ? '❤️ GoPay Coins' : '🧡 ShopeePay'}
                      </span>
                    </p>
                    <p className="text-[9px] text-slate-400 italic">Dangke Banyak (Terima Kasih) Atas Kunjungan Anda!</p>
                  </div>

                </div>

              </div>

              {/* Tindakan Pembatalan / Selesai */}
              <div className="bg-slate-100 p-4 space-y-2">
                {/* Informasi Penting Pembatasan iFrame */}
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-[10px] text-amber-800 leading-relaxed space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Info size={11} className="shrink-0" />
                    Catatan untuk Pengguna:
                  </p>
                  <p>
                    Karena aplikasi berada di dalam iframe (preview), browser membatasi cetak struk langsung & buka WhatsApp. 
                    Silakan klik tombol <strong className="text-amber-950">"Buka di Tab Baru"</strong> di kanan atas layar untuk fungsi penuh 100% normal, ATAU gunakan tombol salin praktis di bawah!
                  </p>
                </div>

                {/* Hubungkan ke whatsapp */}
                <button
                  type="button"
                  onClick={() => {
                    const numberUrl = '6281234567890'; // Contoh Nomor WA kedai fiktif mahasiswa
                    const subtext = completedOrder.items.map((it, idx) => `%20%20${idx+1}.%20${it.menuItem.nama}%20(${it.jumlah}x)`).join('%0A');
                    const textToSend = `*PESANAN%20KEDAI%20KHAS%20MALUKU*%0A` +
                      `---------------------------------------%0A` +
                      `*ID%20Nota*:%20${completedOrder.idOrder}%0A` +
                      `*Nama%20Pemesan*:%20${completedOrder.details.namaPemesan}%0A` +
                      `*Tipe*:%20${completedOrder.details.tipePesanan === 'online-delivery' ? 'Kirim%20Online%20(Delivery)' : 'Dine%20In/Takeout'}%0A` +
                      `*Pesanan*:%0A${subtext}%0A` +
                      `*Alamat*:%20${completedOrder.details.alamatPengiriman || '-'}%0A` +
                      `*Kurir*:%20${completedOrder.details.metodeKirim || '-'}%0A` +
                      `*Total%20Tagihan*:%20Rp%20${completedOrder.total.toLocaleString('id-ID')}%0A` +
                      `*Metode%20Bayar*:%20${completedOrder.details.metodeBayar.toUpperCase()}%0A%0A` +
                      `_Halo%20Admin%20Kedai,%20berikut%20nota%20pesanan%20beta,%20mohon%20segera%20diproses,%20dangke!_`;
                    
                    window.open(`https://wa.me/${numberUrl}?text=${textToSend}`, '_blank');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <span>💬 Kirim Nota Pesanan ke WhatsApp</span>
                </button>

                {/* Tombol Salin Rincian Pesanan (Fallback Iframe) */}
                <button
                  type="button"
                  onClick={() => {
                    const itemsText = completedOrder.items.map((it, idx) => `  ${idx+1}. ${it.menuItem.nama} (${it.jumlah}x)`).join('\n');
                    const formattedReceipt = `KEDAI KHAS MALUKU\n` +
                      `========================================\n` +
                      `ID Nota       : ${completedOrder.idOrder}\n` +
                      `Tanggal       : ${completedOrder.waktu}\n` +
                      `Nama Pemesan  : ${completedOrder.details.namaPemesan}\n` +
                      `Tipe Layanan  : ${completedOrder.details.tipePesanan === 'online-delivery' ? 'Kirim Online (Delivery)' : 'Makan Di Tempat / Bungkus'}\n` +
                      `----------------------------------------\n` +
                      `Daftar Pesanan:\n${itemsText}\n` +
                      `----------------------------------------\n` +
                      `Alamat        : ${completedOrder.details.alamatPengiriman || '-'}\n` +
                      `Metode Kirim  : ${completedOrder.details.metodeKirim || '-'}\n` +
                      `Metode Bayar  : ${completedOrder.details.metodeBayar.toUpperCase()}\n` +
                      `========================================\n` +
                      `TOTAL TAGIHAN : Rp ${completedOrder.total.toLocaleString('id-ID')}\n` +
                      `========================================\n` +
                      `Terima kasih sudah memesan di Kedai Khas Maluku!`;

                    navigator.clipboard.writeText(formattedReceipt).then(() => {
                      setIsCopied(true);
                      setTimeout(() => setIsCopied(false), 3000);
                    }).catch(() => {
                      alert('Gagal menyalin nota otomatis, harap salin teks rincian secara manual.');
                    });
                  }}
                  className={`w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm active:scale-95`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-400" /> Nota Berhasil Disalin!
                    </>
                  ) : (
                    <>
                      <Copy size={13} /> Salin Nota Pesanan (Untuk WhatsApp)
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer size={13} /> Cetak Nota
                  </button>
                  
                  <button
                    type="button"
                    onClick={handleResetApp}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    Buka Menu Baru <ChevronRight size={13} />
                  </button>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL INTERAKTIF: SIMULATOR PESANAN GOFOOD
          Hadir untuk memberikan simulasi memesan ojek online di Maluku
          ========================================== */}
      <AnimatePresence>
        {activeGoFoodItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-red-950/70 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden border border-red-100"
            >
              {/* Header Merah khas GoFood */}
              <div className="bg-red-600 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛵</span>
                  <div>
                    <h3 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                      GoFood Partner Khas Maluku
                    </h3>
                    <p className="text-[10px] text-red-100">Super Fast Delivery Ambon</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGoFoodItem(null)}
                  className="text-white hover:text-red-200 text-sm font-bold bg-black/15 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Rincian Menu GoFood */}
              <div className="p-5 space-y-4">
                <div className="flex gap-3 items-start">
                  {activeGoFoodItem.gambar ? (
                    <img
                      src={activeGoFoodItem.gambar}
                      alt={activeGoFoodItem.nama}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-amber-50 flex items-center justify-center text-3xl">
                      {activeGoFoodItem.emoji}
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                      Diskon Goban 25%
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight mt-1">{activeGoFoodItem.nama}</h4>
                    <p className="text-xs text-amber-600 font-extrabold">Rp {(activeGoFoodItem.harga * 0.9).toLocaleString('id-ID')} <span className="text-[10px] text-slate-400 line-through font-normal">Rp {activeGoFoodItem.harga.toLocaleString('id-ID')}</span></p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Estimasi Pengiriman:</span>
                    <span className="font-bold text-slate-800">🚀 15 - 25 Menit</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Jarak Resto:</span>
                    <span className="font-bold text-slate-800">📍 1.2 Km (Kota Ambon)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ulasan Menu:</span>
                    <span className="font-bold text-amber-500">⭐ 4.9 (500+ Rating)</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed italic border-l-2 border-amber-500 pl-2">
                  "Menyediakan aneka citarasa bumbu rempah aromatik Maluku, bersertifikasi higienis, dan dimasak instan saat ada pesanan GoFood masuk!"
                </p>

                {/* Tombol Aksi GoFood */}
                <div className="space-y-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      // Simulasikan tambah ke local order ojek
                      handleAddToCart(activeGoFoodItem);
                      setActiveGoFoodItem(null);
                      alert(`Berhasil memesan ${activeGoFoodItem.nama}! Item juga ditambahkan ke keranjang belanja lokal Anda untuk mempermudah perhitungan nota.`);
                    }}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer select-none active:scale-95"
                  >
                    <span>Pesan Cepat GoFood Sekarang (Rp {(activeGoFoodItem.harga * 0.9).toLocaleString('id-ID')})</span>
                  </button>
                  <p className="text-[9.5px] text-zinc-400 text-center">
                    Klik tombol di atas untuk menyalurkan simulasi checkout kurir ojek ke sistem kedai.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL INTERAKTIF: CORE GOFOOD PARTNER HUB
          Memberikan visual overview integrasi ojek online Ambon Manise
          ========================================== */}
      <AnimatePresence>
        {showGoFoodHub && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-red-100"
            >
              {/* GoFood Banner Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-800 text-white p-6 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 text-white/5 text-9xl transform translate-x-12 translate-y-6 select-none font-extrabold">
                  GoFood
                </div>
                <div className="space-y-1 relative z-1">
                  <span className="bg-white/20 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    Official Merchant 2026
                  </span>
                  <h3 className="font-extrabold text-lg sm:text-xl text-white">
                    Kedai Khas Maluku - GoFood Ambon
                  </h3>
                  <p className="text-xs text-red-100 flex items-center gap-1">
                    <span>📍 Area Poka & Ambon Manise</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">⭐ 4.9 (Excellent Partner)</span>
                  </p>
                </div>
              </div>

              {/* Promo & Menu Mitra */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    🎁 Promo Aktif GoFood Terbatas:
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-red-50 border border-red-200/50 p-2.5 rounded-xl text-red-800">
                      <p className="font-extrabold">DISKONGEDE25</p>
                      <p className="text-slate-500 font-medium text-[10px]">Potongan harga 25% produk terpilih</p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200/50 p-2.5 rounded-xl text-amber-800">
                      <p className="font-extrabold">MALUKUFREE</p>
                      <p className="text-slate-500 font-medium text-[10px]">Gratis Ongkir hingga Rp 15.000</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider">
                    🍽️ Menu Recomended GoFood (Best Seller):
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
                    {DAFTAR_MENU.slice(0, 4).map(item => (
                      <div key={item.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{item.emoji}</span>
                          <div>
                            <p className="font-bold text-slate-900">{item.nama}</p>
                            <p className="text-[10px] text-slate-400">{item.estimasiPorsi} • {item.waktuSaji}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGoFoodItem(item);
                            setShowGoFoodHub(false);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-extrabold text-[10px] py-1 px-3 rounded-lg cursor-pointer active:scale-95 transition-transform"
                        >
                          Pesan
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-lg text-center leading-relaxed font-medium">
                  Informasi ini disinkronisasikan langsung dari Aplikasi Gojek Merchant. Pengguna di sekitar kampus Unpatti Maluku dapat menikmati waktu saji lebih singkat.
                </p>

                {/* Footer Buttons */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoFoodHub(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Kembali Ke Menu Utama
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGoFoodHub(false);
                      alert('Simulasi integrasi GoFood telah aktif! Semua menu kami sekarang menampilkan tombol pintas pesanan GoFood.');
                    }}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Aktifkan GoFood Promo
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
