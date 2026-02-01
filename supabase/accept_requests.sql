-- ================================================
-- HELPER: ACCEPT ALL PENDING REQUESTS
-- Run this to simulate the other person accepting your request
-- ================================================

UPDATE public.connections
SET status = 'accepted'
WHERE status = 'pending';

-- Optional: Create a reverse connection if you want strictly bilateral records
-- (Though logic should usually handle A->B accepted as valid connection)
