-- Add a project-level contract amount so deposits and part-payments reduce a
-- single outstanding balance on the booking.
ALTER TABLE "Booking" ADD COLUMN "contractAmount" DECIMAL(12,2);
