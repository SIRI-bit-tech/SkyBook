-- Drop FlightOffer table and related indexes
-- This removes the temporary flight storage feature

-- Drop indexes first
DROP INDEX IF EXISTS "flight_offers_offerId_key";
DROP INDEX IF EXISTS "flight_offers_offerId_idx";
DROP INDEX IF EXISTS "flight_offers_expiresAt_idx";
DROP INDEX IF EXISTS "flight_offers_departureCode_arrivalCode_idx";

-- Drop table
DROP TABLE IF EXISTS "flight_offers";
