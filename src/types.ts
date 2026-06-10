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
  emoji: string; // Menggunakan emoji agar ringan, tidak perlu download gambar besar
  tersedia: boolean;
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
  tipePesanan: 'dine-in' | 'take-away';
  metodeBayar: 'tunai' | 'qris';
}
