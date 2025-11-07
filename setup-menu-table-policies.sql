-- Set up Row Level Security (RLS) policies for the menu table
-- Run this in Supabase SQL Editor to enable public read access

-- Enable Row Level Security on menu table
ALTER TABLE menu ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read menu items (public access)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "allow_public_read_menu" ON menu;
CREATE POLICY "allow_public_read_menu" 
ON menu FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert/update/delete menu items (optional)
-- Drop existing policy if it exists
DROP POLICY IF EXISTS "allow_authenticated_write_menu" ON menu;
CREATE POLICY "allow_authenticated_write_menu" 
ON menu FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

