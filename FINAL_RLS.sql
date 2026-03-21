-- 🎯 FINAL RLS - Execute COMPLETO (sem erro uuid/text)

-- 0. Profiles table (fix uuid)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  barbershop_id uuid REFERENCES barbershops(id),
  role text CHECK (role IN ('barber', 'owner')) DEFAULT 'barber',
  created_at timestamptz DEFAULT now()
);

-- 1. Add barbershop_id (nullable first)
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barbershop_id uuid;
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id uuid; 
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS barbershop_id uuid;

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- 3. Policies - Barbeiro vê só SEUS dados
CREATE POLICY "Users own profile" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Barber appointments" ON appointments 
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Barber services" ON services 
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Barber gallery" ON gallery 
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

-- 4. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, barbershop_id)
  VALUES (NEW.id, (NEW.raw_user_meta_data->>'barbershop_id')::uuid);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ✅ EXECUTE 1x → Multi-tenant PRONTO!
-- Teste: Crie 2 users diferentes barbershop_id → Isolados!

