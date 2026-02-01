-- MIGRATION V2: MESSAGES & RLS UPDATE
-- Handles dependency errors by dropping old policies first

-- 1. DROP OLD POLICIES that depend on match_id
DROP POLICY IF EXISTS "Ver mensagens de matches próprios" ON public.messages;
DROP POLICY IF EXISTS "Enviar mensagem em match próprio" ON public.messages;

-- Also check for any other policies on messages just in case
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.messages;

-- 2. SCHEMA CHANGES
-- Add connection_id if not exists (idempotent)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'connection_id') THEN
        ALTER TABLE public.messages ADD COLUMN connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create index
CREATE INDEX IF NOT EXISTS idx_messages_connection_id ON public.messages(connection_id);

-- Drop match_id
ALTER TABLE public.messages DROP COLUMN IF EXISTS match_id CASCADE;

-- 3. CREATE NEW POLICIES (Based on Connections)

-- Policy: View messages if you are part of the connection
CREATE POLICY "View messages in own connections"
ON public.messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = messages.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
);

-- Policy: Send messages if you are part of the connection AND sender is you
CREATE POLICY "Send messages in own connections"
ON public.messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
        AND c.status = 'accepted' -- Optional constraint: only accepted connections
    )
);

-- Enable RLS (just to be sure)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
