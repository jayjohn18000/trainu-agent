-- Add tracking columns to messages table for automated draft generation
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS generated_by text DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT NULL;

-- Create index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_messages_expires_at ON public.messages(expires_at) 
WHERE status IN ('draft', 'queued');

-- Create index for efficient draft queries
CREATE INDEX IF NOT EXISTS idx_messages_trainer_status ON public.messages(trainer_id, status, created_at);

COMMENT ON COLUMN public.messages.generated_by IS 'How the message was created: manual, auto_daily, trigger_based';
COMMENT ON COLUMN public.messages.expires_at IS 'When draft/queued messages expire (7 days from creation)';