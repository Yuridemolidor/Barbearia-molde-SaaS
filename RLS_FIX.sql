-- ✅ FIX: Adicione barbershop_id nas tabelas existentes
-- Execute ANTES do RLS_SETUP.sql

-- 1. appointments
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS barbershop_id text;

-- 2. services  
ALTER TABLE services ADD COLUMN IF NOT EXISTS barbershop_id text;

-- 3. gallery
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS barbershop_id text;

-- 4. Index performance
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop ON appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_gallery_barbershop ON gallery(barbershop_id);

-- ✅ AGORA rode RLS_SETUP.sql!

