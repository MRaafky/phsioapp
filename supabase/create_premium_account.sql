-- Script untuk membuat akun premium untuk testing
-- Jalankan script ini di Supabase SQL Editor

-- ====================================
-- OPTION 1: Upgrade User yang Sudah Ada
-- ====================================

-- Update user menjadi premium berdasarkan email
-- Ganti 'your-email@example.com' dengan email akun Anda
UPDATE users 
SET is_premium = true
WHERE email = 'your-email@example.com';

-- Verifikasi perubahan
SELECT id, email, name, is_premium, created_at
FROM users
WHERE email = 'your-email@example.com';


-- ====================================
-- OPTION 2: Buat User Premium Baru (Manual)
-- ====================================

-- CATATAN: Untuk membuat user baru, Anda HARUS:
-- 1. Daftar akun baru melalui aplikasi (halaman register)
-- 2. Konfirmasi email jika diperlukan
-- 3. Login minimal sekali untuk membuat profile di database
-- 4. Kemudian jalankan UPDATE query di atas untuk upgrade ke premium

-- Atau jika Anda tahu user_id dari Supabase Auth:
-- UPDATE users 
-- SET is_premium = true
-- WHERE id = 'user-uuid-here';


-- ====================================
-- OPTION 3: Lihat Semua User dan Status Premium
-- ====================================

-- Melihat semua user dan status premium mereka
SELECT 
    id, 
    email, 
    name, 
    is_premium,
    created_at,
    CASE 
        WHEN is_premium = true THEN '✓ Premium'
        ELSE '✗ Free'
    END as status
FROM users
ORDER BY created_at DESC;


-- ====================================
-- OPTION 4: Downgrade Premium ke Free
-- ====================================

-- Jika ingin mengembalikan akun ke free tier
UPDATE users 
SET is_premium = false
WHERE email = 'your-email@example.com';
