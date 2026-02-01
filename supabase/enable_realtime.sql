-- Enable Realtime for the messages table
-- Run this in the Supabase SQL Editor

begin;
  -- Add messages table to the publication
  alter publication supabase_realtime add table messages;
commit;

-- Optional: Verify replication identity
-- alter table messages replica identity full;
