# EUREKA! ITB 2026
Repository for Eureka! ITB 2026

## TECH STACK
Tech Stack yang kita pakai untuk proyek ini:
*   Framework: Next.js 14 & React
*   Bahasa: TypeScript
*   Styling: Tailwind CSS
*   Database ORM: Drizzle ORM
*   Autentikasi: NextAuth.js
*   File Storage: Cloudinary
*   Deployment: Cloudflare Pages

## CARA MENJALANKAN PROJECT PADA LOKAL
Ikuti urutan ini untuk menjalankan web di laptop masing-masing:

1. Clone repository ini ke laptop kamu.
2. Buka terminal di dalam folder project, lalu ketik: `pnpm install`
3. Copy file `.env.example`, lalu ubah namanya menjadi `.env.local`. (Untuk isi kodenya, silakan minta ke Kadiv).
4. Jalankan server lokal dengan ketik: `pnpm dev`
5. Buka `http://localhost:3000` di browser.

## ATURAN KOLABORASI & BRANCHING
Tolong perhatikan aturan ini agar kode kita tetap rapi dan tidak bentrok:

### Daftar Branch:
*   `main` : Kode utama yang sudah stabil (Production). **JANGAN PERNAH PUSH LANGSUNG KE SINI.**
*   `dev` : Tempat penggabungan fitur sebelum dirilis.
*   `feature/[nama-fitur]` : Branch khusus untuk mengerjakan tugas individu. (Contoh: `feature/navbar-ui` atau `feature/login-auth`).

### Alur Kerja Staff (Wajib Diikuti):
1. Buat branch baru yang ditarik dari branch `dev`.
2. Kerjakan tugas kodingan kamu (slicing/logic) di branch tersebut.
3. Kalau sudah beres, buat Pull Request (PR) ke branch `dev`.
4. Kabari Kadiv untuk melakukan Code Review. JANGAN MERGE SENDIRI!
