-- ================================================
-- TRIGGER: Update connection timestamp on new message
-- Run this in Supabase SQL Editor
-- ================================================

-- Function to update the connection's updated_at timestamp
CREATE OR REPLACE FUNCTION update_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE connections
    SET updated_at = NOW()
    WHERE id = NEW.connection_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger that fires after every message insert
DROP TRIGGER IF EXISTS on_message_sent ON messages;
CREATE TRIGGER on_message_sent
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION update_connection_timestamp();

-- Verify: This ensures that when a message is sent to connection X,
-- that connection moves to the top of the chat list (sorted by updated_at DESC).
