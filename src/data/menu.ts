/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem } from '../types';
import m1Image from '../assets/images/papeda_baru_1781718939701.jpg';
import m3Image from '../assets/images/kohu_kohu_kasbi_1781718521749.jpg';
import c2Image from '../assets/images/sagu_lempeng_baru_1781718902886.jpg';
import c3Image from '../assets/images/roti_kenari_1781718553504.jpg';
import c4Image from '../assets/images/manisan_pala_baru_1781718919260.jpg';
import d2Image from '../assets/images/kopi_sibu_sibu_1781718587978.jpg';

// Daftar menu makanan dan minuman khas Maluku
export const DAFTAR_MENU: MenuItem[] = [
  {
    id: 'm1',
    nama: 'Papeda Ikan Kuah Kuning & Ikan Bakar Colo-Colo',
    kategori: 'makanan',
    harga: 45000,
    deskripsi: 'Sajian lengkap tradisi Ambon: Kombinasi papeda sagu kenyal yang lembut disiram Kuah Kuning ikan ekor kuning rempah segar, lengkap dipadukan dengan Ikan Bakar harum siram bumbu Colo-Colo khas Maluku yang pedas asam manis.',
    emoji: '🥣',
    tersedia: true,
    gambar: m1Image,
    fitur: ['Papeda Sagu Lembut', 'Ikan Kuah Kuning', 'Ikan Bakar Colo-Colo', 'Paket Combo Kenyang'],
    tingkatPedas: 2,
    waktuSaji: '12-18 menit',
    estimasiPorsi: '1 Paket Lengkap'
  },
  {
    id: 'm3',
    nama: 'Kohu-Kohu & Kasbi Rebus',
    kategori: 'makanan',
    harga: 15000,
    deskripsi: 'Urap sayur tradisional khas Maluku dengan kelapa parut dan suwiran cakalang asap gurih aromatik daun kemangi, disajikan bersama singkong rebus (kasbi) hangat.',
    emoji: '🥗',
    tersedia: true,
    gambar: m3Image,
    fitur: ['Cakalang Asap Suwir', 'Serat Sehat Kemangi', 'Kasbi Rebus Hangat'],
    tingkatPedas: 1,
    waktuSaji: '8-12 menit',
    estimasiPorsi: '1 Piring Saji'
  },
  {
    id: 'c2',
    nama: 'Sagu Lempeng Klasik',
    kategori: 'cemilan',
    harga: 5000,
    deskripsi: 'Kue sagu kering panggang tradisional Ambon bercita rasa klasik, keras dan awet, paling nikmat saat dicelupkan sebentar ke dalam teh atau kopi panas.',
    emoji: '🧱',
    tersedia: true,
    gambar: c2Image,
    fitur: ['Sagu Bakar Asli', 'Snack Tradisional', 'Tahan Lama'],
    tingkatPedas: 0,
    waktuSaji: '2 menit',
    estimasiPorsi: '2 Lempengan'
  },
  {
    id: 'c3',
    nama: 'Roti Kering Kenari',
    kategori: 'cemilan',
    harga: 8000,
    deskripsi: 'Roti kering renyah legendaris Ambon berlumur manisnya gula pasir dan limpahan potongan kacang kenari yang gurih garing.',
    emoji: '🍞',
    tersedia: true,
    gambar: c3Image,
    fitur: ['Taburan Kenari Ambon', 'Manis Renyah', 'Kue Khas Klasik'],
    tingkatPedas: 0,
    waktuSaji: '2 menit',
    estimasiPorsi: '3 Keping'
  },
  {
    id: 'c4',
    nama: 'Manisan Pala Rica',
    kategori: 'cemilan',
    harga: 12500,
    deskripsi: 'Manisan eksotis daging buah pala pilihan khas Kepulauan Banda, diolah dengan saus sambal manis pedas (rica) yang unik, beraroma harum menyegarkan sekaligus hangat.',
    emoji: '🍑',
    tersedia: true,
    gambar: c4Image,
    fitur: ['Daging Pala Terpilih', 'Manis Pedas Hangat', 'Khas Banda Neira'],
    tingkatPedas: 1,
    waktuSaji: '3 menit',
    estimasiPorsi: '1 Kemasan Pouch'
  },
  {
    id: 'd2',
    nama: 'Kopi Sibu-Sibu',
    kategori: 'minuman',
    harga: 10000,
    deskripsi: 'Seduhan kopi robusta harum khas Kedai Sibu-Sibu Ambon berpadu bubuk cengkeh aromatik, disajikan istimewa dengan taburan cacahan kacang kenari gurih.',
    emoji: '☕',
    tersedia: true,
    gambar: d2Image,
    fitur: ['Robusta & Cengkeh', 'Kenari Cacah Gurih', 'Eksotis Tradisional'],
    tingkatPedas: 0,
    waktuSaji: '4 menit',
    estimasiPorsi: '1 Cangkir Hangat'
  }
];
