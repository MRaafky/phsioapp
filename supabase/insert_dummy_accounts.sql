-- ====================================
-- SCRIPT: Membuat Akun Dummy untuk Testing
-- ====================================
-- Jalankan script ini di Supabase SQL Editor
-- 
-- PENTING: Script ini akan membuat user profiles di tabel 'users',
-- tetapi untuk Auth (login) Anda masih perlu registrasi manual
-- melalui aplikasi atau Supabase Auth Dashboard.

-- ====================================
-- 1. AKUN PREMIUM TESTING
-- ====================================

-- Premium User 1
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'premium1@phsioapp.test',
    'Premium User One',
    '28',
    '70',
    '175',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = true,
    updated_at = NOW();

-- Premium User 2
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'premium2@phsioapp.test',
    'Premium User Two',
    '35',
    '75',
    '180',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = true,
    updated_at = NOW();

-- Premium User 3
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'premium.test@phsioapp.com',
    'Premium Test User',
    '30',
    '72',
    '178',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = true,
    updated_at = NOW();


-- ====================================
-- 2. AKUN FREE/BIASA TESTING
-- ====================================

-- Free User 1
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'free1@phsioapp.test',
    'Free User One',
    '25',
    '65',
    '170',
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = false,
    updated_at = NOW();

-- Free User 2
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'free2@phsioapp.test',
    'Free User Two',
    '32',
    '68',
    '165',
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = false,
    updated_at = NOW();

-- Free User 3
INSERT INTO users (
    id,
    email,
    name,
    age,
    weight,
    height,
    is_premium,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'free.test@phsioapp.com',
    'Free Test User',
    '27',
    '70',
    '172',
    false,
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET
    is_premium = false,
    updated_at = NOW();


-- ====================================
-- 3. VERIFIKASI
-- ====================================

-- Lihat semua dummy users yang sudah dibuat
SELECT 
    id,
    email,
    name,
    age,
    CASE 
        WHEN is_premium = true THEN '✓ Premium'
        ELSE '✗ Free'
    END as status,
    created_at
FROM users
WHERE email LIKE '%@phsioapp.test' OR email LIKE '%test@phsioapp.com'
ORDER BY is_premium DESC, email;


-- ====================================
-- 4. CLEANUP (Opsional)
-- ====================================

-- Jika ingin menghapus semua dummy users:
-- DELETE FROM users WHERE email LIKE '%@phsioapp.test' OR email LIKE '%test@phsioapp.com';
