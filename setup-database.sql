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
CREATE POLICY "allow_public_read_json_files" 
ON json_files FOR SELECT 
USING (true);

-- Policy: Allow authenticated users to insert/update
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
CREATE TRIGGER update_json_files_updated_at 
BEFORE UPDATE ON json_files 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();