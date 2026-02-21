-- ================================================
-- MIGRATION: MATCHES TO CONNECTIONS IN MESSAGES
-- Run this in Supabase SQL Editor
-- ================================================

BEGIN;

-- 1. Drop foreign key that locks messages to deprecated matches table
ALTER TABLE public.messages
DROP CONSTRAINT IF EXISTS messages_match_id_fkey;

-- 2. Add foreign key pointing messages to connections instead of matches
ALTER TABLE public.messages
ADD CONSTRAINT messages_connection_id_fkey
FOREIGN KEY (match_id) REFERENCES public.connections(id) ON DELETE CASCADE;

-- 3. Rename the column to reflect the new architecture
ALTER TABLE public.messages
RENAME COLUMN match_id TO connection_id;

-- 4. Rebuild index for performance (Drop old, create new)
DROP INDEX IF EXISTS idx_messages_match_id;
CREATE INDEX idx_messages_connection_id ON public.messages(connection_id);

-- 5. Row Level Security for Messages based on Connections
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Drop old policies if any
DROP POLICY IF EXISTS "Users can read messages of their matches" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages into their matches" ON public.messages;

-- A user can read messages if they are part of the connection
CREATE POLICY "Users can read their connection messages"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id = messages.connection_id
    AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    AND c.status = 'accepted'
  )
);

-- A user can insert messages if they are part of the connection and are the sender
CREATE POLICY "Users can send connection messages"
ON public.messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.connections c
    WHERE c.id = connection_id
    AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    AND c.status = 'accepted'
  )
);

COMMIT;
