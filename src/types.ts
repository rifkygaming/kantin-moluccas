/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Struktur data untuk item makanan/minuman di kantin
export interface MenuItem {
  id: string;
  nama: string;
  kategori: 'makanan' | 'minuman' | 'cemilan';
  harga: number;
  deskripsi: string;
  emoji: string;
  tersedia: boolean;
  gambar: string; // URL gambar makanan/minuman berkualitas tinggi
  fitur: string[]; // Label/karakteristik (misal: ["Sagu Asli", "Kuah Hangat", "Bebas Gluten"])
  tingkatPedas?: number; // 0 hingga 3 cabai
  waktuSaji: string; // Durasi penyiapan (misal: "10-15 menit")
  estimasiPorsi: string; // Satuan porsi (misal: "1 Piring", "1 Gelas Besar")
}

// Struktur data untuk item yang ada di keranjang belanja
export interface CartItem {
  menuItem: MenuItem;
  jumlah: number;
  catatan?: string;
}

// Struktur data untuk form pemesanan
export interface OrderDetails {
  namaPemesan: string;
  nomorMeja: string;
  tipePesanan: 'dine-in' | 'take-away' | 'online-delivery';
  alamatPengiriman?: string;
  metodeKirim?: 'kurir-kedai' | 'gojek' | 'grab';
  metodeBayar: 'tunai' | 'qris' | 'gopay' | 'shopeepay';
  catatanDriver?: string;
}
