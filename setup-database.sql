-- Create json_files table to store editable JSON content
CREATE TABLE IF NOT EXISTS json_files (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT UNIQUE NOT NULL,
    content JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_json_files_filename ON json_files(filename);
CREATE INDEX IF NOT EXISTS idx_json_files_updated_at ON json_files(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE json_files ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read (public access)
-- Drop existing policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "allow_public_read_json_files" ON json_files;
CREATE POLICY "allow_public_read_json_files" 
ON json_files FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert/update
-- Drop existing policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "allow_authenticated_write_json_files" ON json_files;
CREATE POLICY "allow_authenticated_write_json_files" 
ON json_files FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to call the function before update
-- Drop existing trigger if it exists to allow re-running this script
DROP TRIGGER IF EXISTS update_json_files_updated_at ON json_files;
CREATE TRIGGER update_json_files_updated_at 
BEFORE UPDATE ON json_files 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- Create menu_items table to store menu items
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    category TEXT NOT NULL,
    image_url TEXT,
    image_path TEXT,
    position INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for menu_items
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_menu_items_position ON menu_items(position);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_position ON menu_items(category, position);

-- Enable Row Level Security (RLS) for menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anyone to read menu items (public access)
-- Drop existing policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "allow_public_read_menu_items" ON menu_items;
CREATE POLICY "allow_public_read_menu_items" 
ON menu_items FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert/update/delete menu items
-- Drop existing policy if it exists to allow re-running this script
DROP POLICY IF EXISTS "allow_authenticated_write_menu_items" ON menu_items;
CREATE POLICY "allow_authenticated_write_menu_items" 
ON menu_items FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create trigger to automatically update the updated_at timestamp for menu_items
-- Drop existing trigger if it exists to allow re-running this script
DROP TRIGGER IF EXISTS update_menu_items_updated_at ON menu_items;
CREATE TRIGGER update_menu_items_updated_at 
BEFORE UPDATE ON menu_items 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();