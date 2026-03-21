// Multi-tenant utils para SaaS - COMPLETE
const BARBERSHOP_TABLE = 'barbershops';

let currentTenantId = localStorage.getItem('tenantId') || null;

function getCurrentTenantId() {
  return currentTenantId;
}

function setCurrentTenantId(id) {
  currentTenantId = id;
  localStorage.setItem('tenantId', id);
}

function clearTenant() {
  currentTenantId = null;
  localStorage.removeItem('tenantId');
}

// Query helper com tenant filter
function filterByTenant(query) {
  if (!currentTenantId) throw new Error('No tenant selected');
  return query.eq('barbershop_id', currentTenantId);
}

// Supabase RLS helper
function getRLSPolicy() {
  return {
    barbershops: [
      'CREATE POLICY "Users can only access own barbershop" ON barbershops FOR ALL USING (owner_id = auth.uid())'
    ],
    appointments: [
      'CREATE POLICY "Tenant appointments" ON appointments FOR ALL USING (barbershop_id = (select barbershop_id from profiles where id = auth.uid()))'
    ]
  };
}

export { getCurrentTenantId, setCurrentTenantId, clearTenant, filterByTenant, getRLSPolicy };

