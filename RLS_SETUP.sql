-- 🚀 RLS Policies - 1 Supabase = INFINITOS Barbeiros
-- Cole no Supabase → SQL Editor → Execute

-- 1. Tabela profiles (user metadata)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users NOT NULL PRIMARY KEY,
  barbershop_id text NOT NULL,
  role text DEFAULT 'barber',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS Policies ISOLAMENTO TOTAL
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

-- Barbeiro só vê SEUS dados
CREATE POLICY "Barber appointments" ON appointments
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Barber services" ON services
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "Barber gallery" ON gallery  
FOR ALL USING (barbershop_id = (SELECT barbershop_id FROM profiles WHERE id = auth.uid()));

-- Owner vê TUDO da sua barbearia
CREATE POLICY "Owner full access" ON barbershops
FOR ALL USING (owner_id = auth.uid());

-- Trigger: Novo user → profile auto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, barbershop_id)
  VALUES (new.id, new.raw_user_meta_data->>'barbershop_id');
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ✅ PRONTO! 1 Supabase = 10.000 barbeiros isolados

