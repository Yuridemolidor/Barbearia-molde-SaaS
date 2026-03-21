// 🏪 Multi-Tenant Utils - URL → Barbershop ID → Dados isolados

// 1. URL /barbearia-joao → barbershop_id = "joao-xyz"
export function getCurrentTenantId() {
  const path = window.location.pathname;
  const tenantSlug = path.split('/')[1]; // "barbearia-joao"
  
  if (!tenantSlug) return 'default'; // fallback
  return tenantSlug.replace('barbearia-', ''); // "joao"
}

// 2. TODAS queries filtradas
export async function query(table, opts = {}) {
  return db
    .from(table)
    .select('*')
    .eq('barbershop_id', getCurrentTenantId())
    .eq('barbershop_slug', getCurrentTenantSlug()) // extra segurança
    .match(opts);
}

// 3. Carrega dados da barbearia da URL
export async function loadTenantData() {
  const tenantId = getCurrentTenantId();
  const { data } = await db
    .from('barbershops')
    .select('*')
    .eq('slug', tenantId)
    .single();
    
  return data;
}

// 4. Login tenant-aware
export function loginWithTenant(email, password, tenantId) {
  return db.auth.signInWithPassword({
    email,
    password,
    options: {
      data: { barbershop_id: tenantId }
    }
  });
}

// Usage em qualquer script:
// await utils.query('appointments')
// await utils.loadTenantData()

export { getCurrentTenantId, query, loadTenantData, loginWithTenant };

