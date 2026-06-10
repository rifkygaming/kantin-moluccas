/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MenuItem } from '../types';

// Daftar menu makanan dan minuman kantin sekolah / kampus
export const DAFTAR_MENU: MenuItem[] = [
  {
    id: 'm1',
    nama: 'Papeda & Ikan Kuah Kuning',
    kategori: 'makanan',
    harga: 25000,
    deskripsi: 'Sajian bubur sagu khas Ambon yang kenyal, disajikan dengan ikan ekor kuning kuah rempah kunyit yang asam segar.',
    emoji: '🥣',
    tersedia: true,
  },
  {
    id: 'm2',
    nama: 'Rujak Natsepa',
    kategori: 'cemilan',
    harga: 12000,
    deskripsi: 'Rujak buah segar legendaris khas Pantai Natsepa yang disiram bumbu kacang kental manis gurih dari gula aren Maluku dan ulekan buah pala sirih.',
    emoji: '🍍',
    tersedia: true,
  },
  {
    id: 'm3',
    nama: 'Kohu-Kohu & Kasbi Rebus',
    kategori: 'makanan',
    harga: 14050,
    deskripsi: 'Urap khas Maluku dengan suwiran ikan cakalang asap, kacang panjang, tauge, disajikan dengan singkong rebus hangat.',
    emoji: '🥗',
    tersedia: true,
  },
  {
    id: 'm4',
    nama: 'Gohu Ikan Tuna Mentah',
    kategori: 'makanan',
    harga: 22000,
    deskripsi: 'Sashimi ala Ambon terbuat dari potongan ikan tuna segar yang dilumuri perasan jeruk nipis, kemangi, minyak kelapa, dan kenari.',
    emoji: '🐟',
    tersedia: true,
  },
  {
    id: 'c1',
    nama: 'Pisang Goreng Gepe',
    kategori: 'cemilan',
    harga: 8000,
    deskripsi: 'Pisang gepeng yang dibakar lalu ditekan (gepe) dan disiram saus gula merah kelapa manis.',
    emoji: '🍌',
    tersedia: true,
  },
  {
    id: 'c2',
    nama: 'Sagu Lempeng',
    kategori: 'cemilan',
    harga: 5000,
    deskripsi: 'Kue sagu kering tradisional Ambon berbentuk lempengan merah kecokelatan, sangat cocok dicelup ke teh manis.',
    emoji: '🧱',
    tersedia: true,
  },
  {
    id: 'c3',
    nama: 'Roti Kering Kenari',
    kategori: 'cemilan',
    harga: 6000,
    deskripsi: 'Roti kering renyah dengan taburan gula pasir manis dan kacang kenari Ambon yang gurih di atasnya.',
    emoji: '🍞',
    tersedia: true,
  },
  {
    id: 'd2',
    nama: 'Kopi Sibu-Sibu',
    kategori: 'minuman',
    harga: 8000,
    deskripsi: 'Seduhan kopi robusta khas Ambon beraroma cengkeh yang ditaburi cacahan kacang kenari gurih di atasnya.',
    emoji: '☕',
    tersedia: true,
  }
];
