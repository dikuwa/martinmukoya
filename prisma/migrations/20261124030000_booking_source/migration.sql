-- Capture how a booking was received independently from its issuing site.
-- Existing bookings have unknown origins; do not relabel them as walk-ins.
ALTER TABLE "Booking"
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'unspecified';
