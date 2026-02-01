-- ================================================
-- FIX PERMISSIONS (MARTELADA FINAL/FINAL HAMMER)
-- Resets policies to likely working state to unblock Chat
-- ================================================

-- 1. PROFILES: Make Public Reading (Essential for Chat header)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Profiles visíveis para todos os autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
-- Drop any restrictive policy that might exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Public profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- 2. MESSAGES: Simplify Logic
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "View messages in own connections" ON public.messages;
DROP POLICY IF EXISTS "Send messages in own connections" ON public.messages;
DROP POLICY IF EXISTS "Ver mensagens de matches próprios" ON public.messages;
DROP POLICY IF EXISTS "Enviar mensagem em match próprio" ON public.messages;
DROP POLICY IF EXISTS "View messages" ON public.messages;
DROP POLICY IF EXISTS "Send messages" ON public.messages;

-- Allow viewing messages if you belong to the connection
CREATE POLICY "View messages"
ON public.messages FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.connections c
        WHERE c.id = messages.connection_id
        AND (c.requester_id = auth.uid() OR c.receiver_id = auth.uid())
    )
);

-- Allow sending messages (simplified check)
CREATE POLICY "Send messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (
    sender_id = auth.uid()
);

-- 3. CONNECTIONS: Ensure visibility
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;
-- (Assuming policies exist, but just in case)
DROP POLICY IF EXISTS "Users can view their own connections" ON public.connections;

CREATE POLICY "Users can view their own connections"
ON public.connections FOR SELECT
TO authenticated
USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
