-- Clean up duplicate draft messages, keeping only the most recent per contact
DELETE FROM messages 
WHERE id NOT IN (
  SELECT DISTINCT ON (trainer_id, contact_id) id 
  FROM messages 
  WHERE status = 'draft'
  ORDER BY trainer_id, contact_id, created_at DESC
)
AND status = 'draft';

-- Add comment for documentation
COMMENT ON TABLE messages IS 'Stores all trainer-client messages. Deduplication enforced by daily-draft-generator to prevent duplicate drafts per contact.';