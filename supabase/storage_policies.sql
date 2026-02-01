-- ================================================
-- SUPABASE STORAGE SETUP
-- Execute this in Supabase SQL Editor
-- ================================================

-- Create storage buckets (run these commands in Storage section of Supabase Dashboard)
-- 1. Create bucket "avatars" (public)
-- 2. Create bucket "listings" (public)

-- Storage policies for avatars bucket
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for listings bucket
CREATE POLICY "Listing images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'listings');

CREATE POLICY "Users can upload listing images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'listings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their listing images"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'listings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their listing images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'listings' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
