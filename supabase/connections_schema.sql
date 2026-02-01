-- ================================================
-- CONNECTIONS SYSTEM SCHEMA
-- Run this in Supabase SQL Editor
-- ================================================

BEGIN;

-- 1. Create connections table
-- Replaces (or enhances) the matches concept with explicit friend requests
CREATE TABLE public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent duplicate requests between same users
  CONSTRAINT unique_connection UNIQUE (requester_id, receiver_id)
);

-- 2. Indexes for performance
CREATE INDEX idx_connections_requester ON public.connections(requester_id);
CREATE INDEX idx_connections_receiver ON public.connections(receiver_id);
CREATE INDEX idx_connections_status ON public.connections(status);

-- 3. RLS Policies for connections
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Users can see connections involving them
CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- Users can create requests (as requester)
CREATE POLICY "Users can send connection requests"
ON public.connections FOR INSERT
WITH CHECK (auth.uid() = requester_id);

-- Users can update requests involving them (accept/reject)
CREATE POLICY "Users can update their connections"
ON public.connections FOR UPDATE
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

-- 4. Migrate existing matches to connections (Optional - if you want to keep history)
-- INSERT INTO public.connections (requester_id, receiver_id, status)
-- SELECT user_a, user_b, status FROM public.matches;

-- 5. Helper function to check if users are connected
CREATE OR REPLACE FUNCTION public.are_connected(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
    AND ((requester_id = user1_id AND receiver_id = user2_id)
      OR (requester_id = user2_id AND receiver_id = user1_id))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
