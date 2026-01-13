# PhsioApp - Deployment Guide

Panduan lengkap untuk deploy PhsioApp ke Vercel dengan Supabase database.

## Prerequisites

1. **Akun Supabase** (gratis)
   - Daftar di: https://supabase.com
   - Buat project baru

2. **Akun Vercel** (gratis)
   - Daftar di: https://vercel.com
   - Install Vercel CLI (optional): `npm i -g vercel`

## Step 1: Setup Supabase Database

### 1.1 Buat Supabase Project

1. Login ke dashboard Supabase: https://app.supabase.com
2. Klik **"New Project"**
3. Isi detail project:
   - **Name**: PhsioApp (atau nama lain)
   - **Database Password**: Buat password yang kuat
   - **Region**: Pilih terdekat (Southeast Asia)
4. Tunggu hingga project selesai dibuat (~2 menit)

### 1.2 Run Database Schema

1. Di dashboard Supabase, buka **SQL Editor** (ikon di sidebar kiri)
2. Klik **"New Query"**
3. Copy seluruh isi file `supabase/schema.sql`
4. Paste ke SQL Editor
5. Klik **"Run"** atau tekan `Ctrl+Enter`
6. Pastikan tidak ada error - Anda akan melihat pesan "Success"

### 1.3 Dapatkan API Credentials

1. Di dashboard Supabase, buka **Settings** > **API**
2. Copy nilai berikut:
   - **Project URL** (contoh: `https://xxxxx.supabase.co`)
   - **anon public** key (yang panjang)

### 1.4 Disable Email Confirmation (Optional - untuk testing)

Untuk memudahkan testing tanpa email confirmation:

1. Buka **Authentication** > **Providers** > **Email**
2. Scroll ke bawah
3. Disable **"Confirm email"**
4. Klik **Save**

## Step 2: Setup Environment Variables Lokal

### 2.1 Buat File .env.local

Di root project, buat file `.env.local`:

```bash
# Copy dari .env.example
cp .env.example .env.local
```

### 2.2 Isi Environment Variables

Edit `.env.local` dengan credentials Supabase Anda:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: AI API Keys
VITE_GEMINI_API_KEY=your-gemini-api-key
```

## Step 3: Test Lokal

### 3.1 Install Dependencies

```bash
npm install
```

### 3.2 Run Development Server

```bash
npm run dev
```

### 3.3 Test Functionality

Buka browser di http://localhost:5173 dan test:

1. ✅ **Register User** - Buat akun baru
2. ✅ **Login** - Login dengan akun yang baru dibuat
3. ✅ **View Journals** - Lihat daftar jurnal
4. ✅ **Admin Panel** - Akses `/admin` dan login sebagai admin
5. ✅ **Create Announcement** - Buat pengumuman dari admin panel

### 3.4 Verify di Supabase Dashboard

1. Buka **Table Editor** di Supabase
2. Lihat table `users` - Seharusnya ada user baru
3. Lihat table `announcements` - Seharusnya ada announcement baru

## Step 4: Deploy ke Vercel

### 4.1 Push ke Git Repository

Pastikan code sudah di push ke GitHub/GitLab/Bitbucket:

```bash
git add .
git commit -m "Setup Supabase database integration"
git push origin main
```

### 4.2 Import Project ke Vercel

#### Via Vercel Dashboard:

1. Login ke https://vercel.com
2. Klik **"Add New..."** > **"Project"**
3. Import repository Git Anda
4. Vercel akan auto-detect Vite framework

#### Via Vercel CLI:

```bash
vercel
```

### 4.3 Configure Environment Variables di Vercel

1. Di project settings, buka **Settings** > **Environment Variables**
2. Tambahkan environment variables:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` (your anon key) | Production, Preview, Development |

3. Klik **Save**

### 4.4 Redeploy (jika perlu)

Jika environment variables ditambahkan setelah deployment pertama:

1. Buka **Deployments** tab
2. Klik **"..."** pada latest deployment
3. Klik **"Redeploy"**

## Step 5: Verify Production

### 5.1 Test Production URL

Setelah deployment selesai, buka production URL (contoh: `https://phsio-app.vercel.app`)

Test semua functionality:

1. ✅ Register & Login
2. ✅ Create exercise plans
3. ✅ View journals
4. ✅ Admin panel functionality
5. ✅ Announcements

### 5.2 Check Database

Verify data tersimpan di Supabase dengan membuka **Table Editor**

## Troubleshooting

### Error: "Supabase not configured"

- ✅ Pastikan environment variables sudah diset di Vercel
- ✅ Pastikan nama environment variables benar (harus diawali `VITE_`)
- ✅ Redeploy setelah menambahkan environment variables

### Error: "Invalid JWT"

- ✅ Pastikan menggunakan **anon public** key, bukan service_role key
- ✅ Check apakah key ter-copy dengan lengkap (tidak terpotong)

### Build Error di Vercel

- ✅ Check build logs di Vercel dashboard
- ✅ Pastikan `npm run build` berhasil di lokal
- ✅ Pastikan semua dependencies ada di `package.json`

### RLS Policy Error / Permission Denied

- ✅ Pastikan user sudah login (authenticated)
- ✅ Check apakah RLS policies sudah dijalankan di SQL Editor
- ✅ Di Supabase, buka **Authentication** > **Policies** untuk verify

### Users tidak bisa register

- ✅ Check email confirmation setting di Supabase
- ✅ Pastikan password memenuhi requirement (min 6 karakter)
- ✅ Check browser console untuk error messages

## Custom Domain (Optional)

### Tambahkan Domain Sendiri

1. Di project Vercel, buka **Settings** > **Domains**
2. Klik **"Add"**
3. Masukkan domain Anda (contoh: `physioapp.com`)
4. Follow instruksi untuk update DNS records
5. Tunggu DNS propagation (~24 jam)

## Monitoring & Analytics

### Supabase Dashboard

- **Database**: Monitor table size dan queries
- **Auth**: Lihat user registrations
- **Logs**: Check error logs

### Vercel Dashboard

- **Analytics**: User visits dan page views
- **Logs**: Runtime logs dan errors
- **Deployments**: Deploy history

## Maintenance

### Update Database Schema

Jika ada perubahan schema:

1. Buat migration SQL file baru
2. Run di Supabase SQL Editor
3. Update TypeScript types di `lib/supabase.ts`
4. Commit dan push changes
5. Vercel akan auto-deploy

### Backup Database

Supabase menyediakan daily backups otomatis. Untuk manual backup:

1. Buka **Database** > **Backups**
2. Klik **"Create Backup"**

## Next Steps

- 📧 Setup email templates di Supabase untuk registration emails
- 🔐 Implement password reset functionality
- 📊 Add analytics tracking
- 🌐 Setup custom domain
- 💳 Implement payment gateway untuk premium features

## Support

Jika ada masalah:

1. Check error logs di browser console
2. Check Vercel deployment logs
3. Check Supabase logs di dashboard
4. Refer to documentation:
   - Supabase: https://supabase.com/docs
   - Vercel: https://vercel.com/docs
