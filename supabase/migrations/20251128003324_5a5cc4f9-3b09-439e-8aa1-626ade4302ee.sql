-- Add triggers for automatic sync queue population

-- Trigger for contacts table
CREATE OR REPLACE TRIGGER tr_queue_contact_sync
  AFTER INSERT OR UPDATE ON public.contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_contact_sync();

-- Trigger for bookings table  
CREATE OR REPLACE TRIGGER tr_queue_booking_sync
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.queue_booking_sync();