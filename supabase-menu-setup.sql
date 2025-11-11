

BEGIN;


CREATE TABLE IF NOT EXISTS menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    image_url TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Annet',
    is_available BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS menu_items_category_idx ON menu_items(category);
CREATE INDEX IF NOT EXISTS menu_items_available_idx ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS menu_items_sort_idx ON menu_items(sort_order);


ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_read_menu" ON menu_items 
    FOR SELECT TO public USING (is_available = true);


CREATE POLICY "allow_authenticated_manage_menu" ON menu_items 
    FOR ALL TO authenticated USING (true);


INSERT INTO menu_items (name, price, description, category, image_url, sort_order) VALUES
-- Kaffe
('Espresso', 35, 'Klassisk italiensk espresso, rik og kraftig smak', 'Kaffe', null, 1),
('Americano', 45, 'Espresso med varmt vann, mild og ren smak', 'Kaffe', null, 2),
('Cappuccino', 55, 'Espresso med dampet melk og melkeskum', 'Kaffe', null, 3),
('Latte', 55, 'Espresso med mye dampet melk og lite skum', 'Kaffe', null, 4),
('Flat White', 60, 'Dobbel espresso med mikroskum, australsk stil', 'Kaffe', null, 5),
('Cortado', 50, 'Espresso med varmt melk i perfekt balanse', 'Kaffe', null, 6),

-- Mat
('Focaccia med ost og tomat', 85, 'Hjemmelaget focaccia med mozzarella og ferske tomater', 'Mat', null, 1),
('Rundstykke med salami', 75, 'Fersk rundstykke med italiensk salami og salat', 'Mat', null, 2),
('Avokado toast', 95, 'Ristet surdeigsbrød med avokado, lime og chili', 'Mat', null, 3),
('Yoghurt med granola', 65, 'Kremet yoghurt med hjemmelaget granola og bær', 'Mat', null, 4),
('Salat med kylling', 125, 'Frisk salat med grillet kylling og sesongdressing', 'Mat', null, 5),

-- Bakst
('Croissant', 45, 'Smørdeig croissant, fersk fra ovnen', 'Bakst', null, 1),
('Chocolate chip cookie', 35, 'Hjemmelaget cookie med mørk sjokolade', 'Bakst', null, 2),
('Kanelbolle', 40, 'Tradisjonell norsk kanelbolle med glasur', 'Bakst', null, 3),
('Blåbærmuffins', 50, 'Saftige muffins med ferske blåbær', 'Bakst', null, 4),
('Sjokoladekake', 65, 'Rik sjokoladekake med sjokoladeglasur', 'Bakst', null, 5),
('Kardemommebolle', 40, 'Klassisk norsk kardemommebolle', 'Bakst', null, 6);


CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';


CREATE TRIGGER update_menu_items_updated_at 
    BEFORE UPDATE ON menu_items 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;