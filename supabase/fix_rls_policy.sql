-- Solution for "Failed to create user profile" error
-- This creates a database trigger that automatically inserts user profiles
-- when new auth users are created, bypassing RLS restrictions

-- Step 1: Drop the problematic RLS policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Step 2: Create a function to handle new user creation
-- SECURITY DEFINER allows this to bypass RLS policies
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert user profile automatically when auth user is created
  INSERT INTO public.users (id, email, name, age, weight, height, is_premium)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),  -- Get name from metadata
    '30',
    '70',
    '175',
    false
  )
  ON CONFLICT (id) DO NOTHING;  -- Prevent duplicate inserts
  
  RETURN NEW;
END;
$$;

-- Step 3: Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Verify the trigger was created
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Expected output:
-- trigger_name: on_auth_user_created
-- event_manipulation: INSERT
-- event_object_table: users (in auth schema)
-- action_statement: EXECUTE FUNCTION public.handle_new_user()
