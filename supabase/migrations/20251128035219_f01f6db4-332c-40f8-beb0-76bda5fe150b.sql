-- Add unique constraint on (trainer_id, ghl_contact_id) for proper upsert
ALTER TABLE contacts 
ADD CONSTRAINT contacts_trainer_ghl_unique 
UNIQUE (trainer_id, ghl_contact_id);