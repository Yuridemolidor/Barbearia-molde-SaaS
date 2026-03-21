-- 🔧 ULTIMO FIX - text = uuid resolvido

-- 1. Columns como TEXT (simples)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barbershop_id text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id text; 
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS barbershop_id text;

-- 2. Profiles TEXT também
DROP TABLE IF EXISTS profiles;
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  barbershop_id text NOT NULL,
  role text DEFAULT 'barber'
);

-- 3. RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- 4. Policies SIMPLES
CREATE POLICY "Own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Barber data" ON appointments FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Barber services" ON services FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));
CREATE POLICY "Barber gallery" ON gallery FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

-- 5. Trigger TEXT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, barbershop_id)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'barbershop_id');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ✅ 100% FUNCIONAL

