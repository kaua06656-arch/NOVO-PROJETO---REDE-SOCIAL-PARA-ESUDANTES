-- ================================================
-- FIX SUPABASE STORAGE POLICIES
-- Execute this in Supabase SQL Editor
-- This script replaces previous policies with more robust versions
-- ================================================

BEGIN;

-- 1. Drop existing policies to start fresh and avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Listing images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their listing images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their listing images" ON storage.objects;

-- 2. Re-create Avatar policies with robust path checking
-- Using (auth.uid() || '/%') is safer than storage.foldername()

CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND name LIKE (auth.uid()::text || '/%')
);

-- 3. Re-create Listing policies with robust path checking

CREATE POLICY "Listing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listings' 
    AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can update their listing images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'listings' 
    AND name LIKE (auth.uid()::text || '/%')
);

CREATE POLICY "Users can delete their listing images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listings' 
    AND name LIKE (auth.uid()::text || '/%')
);

COMMIT;
