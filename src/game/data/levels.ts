import type { LevelData } from "../types/index.ts";

export const levels: LevelData[] = [
  {
    id: 1,
    name: "Jalan Lurus",
    cols: 7,
    rows: 5,
    start: { col: 0, row: 2, dir: "right" },
    finish: { col: 5, row: 2, building: "house" },
    obstacles: [],
    collectibles: [
      { col: 2, row: 2 },
      { col: 4, row: 2 },
    ],
    intro: "Bantu Prompt sampai ke rumah! Susun beberapa blok Maju, lalu tekan JALANKAN.",
    maxTop: 8,
  },
  {
    id: 2,
    name: "Belok Arah",
    cols: 7,
    rows: 5,
    start: { col: 0, row: 0, dir: "right" },
    finish: { col: 3, row: 3, building: "house" },
    obstacles: [
      { col: 5, row: 1, type: "tree" },
      { col: 1, row: 3, type: "bush" },
    ],
    collectibles: [
      { col: 1, row: 0 },
      { col: 3, row: 1 },
    ],
    intro: "Kali ini jalannya berbelok! Gunakan blok Kiri / Kanan untuk mengubah arah Prompt.",
    maxTop: 10,
  },
  {
    id: 3,
    name: "Rintangan Pertama",
    cols: 7,
    rows: 5,
    start: { col: 0, row: 2, dir: "right" },
    finish: { col: 6, row: 2, building: "house" },
    obstacles: [
      { col: 3, row: 2, type: "rock" },
      { col: 5, row: 4, type: "bush" },
    ],
    collectibles: [
      { col: 1, row: 2 },
      { col: 3, row: 1 },
    ],
    intro: "Ada batu menghalangi jalan! Putar otak untuk mencari jalan memutar mengelilinginya.",
    maxTop: 12,
  },
  {
    id: 4,
    name: "Berulang-ulang",
    cols: 8,
    rows: 3,
    start: { col: 0, row: 1, dir: "right" },
    finish: { col: 7, row: 1, building: "school" },
    obstacles: [],
    collectibles: [
      { col: 2, row: 1 },
      { col: 5, row: 1 },
    ],
    intro:
      "Jalan ini panjang sekali! Coba gunakan blok Ulangi supaya tidak perlu menyusun banyak blok Maju satu-satu.",
    maxTop: 6,
  },
  {
    id: 5,
    name: "Petualangan Lengkap",
    cols: 8,
    rows: 6,
    start: { col: 0, row: 0, dir: "right" },
    finish: { col: 7, row: 5, building: "school" },
    obstacles: [
      { col: 2, row: 0, type: "rock" },
      { col: 4, row: 2, type: "tree" },
      { col: 6, row: 3, type: "bush" },
      { col: 3, row: 4, type: "fence" },
    ],
    collectibles: [
      { col: 1, row: 2 },
      { col: 6, row: 1 },
    ],
    intro:
      "Level terakhir! Gabungkan semua yang sudah kamu pelajari: arah, rintangan, dan perulangan.",
    maxTop: 14,
  },
];
