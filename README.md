<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
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
>>>>>>> f2600c2101e0fc4bd5ba5fdd022e8ade8fda9abc
