-- Fix corrupted FK: Case_journeyId_fkey was incorrectly referencing Case(id) instead of Journey(id).
-- This migration drops the wrong constraint and recreates it correctly.

-- Drop the corrupted self-referential FK
ALTER TABLE "Case" DROP CONSTRAINT IF EXISTS "Case_journeyId_fkey";

-- Recreate the FK correctly referencing Journey(id)
ALTER TABLE "Case" ADD CONSTRAINT "Case_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
