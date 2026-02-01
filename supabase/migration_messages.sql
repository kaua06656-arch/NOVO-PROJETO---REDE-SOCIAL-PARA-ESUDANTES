-- MIGRATION: MESSAGES TABLE UPDATE
-- Link messages to connections table instead of matches

-- 1. Add connection_id column
ALTER TABLE public.messages 
ADD COLUMN connection_id UUID REFERENCES public.connections(id) ON DELETE CASCADE;

-- 2. Create index for performance
CREATE INDEX idx_messages_connection_id ON public.messages(connection_id);

-- 3. (Optional) If we wanted to keep data, we would migrate it here.
-- But since connection IDs are new and different from match IDs, 
-- we will just start fresh for this MVP phase.
-- TRUNCATE TABLE public.messages; -- Optional: clear old messages

-- 4. Drop match_id column (making it nullable first to be safe, then drop)
ALTER TABLE public.messages DROP COLUMN match_id;

-- 5. Drop legacy matches table if no longer needed
-- DROP TABLE public.matches; -- Commented out for safety, can be done later
