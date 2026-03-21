 import { CONFIG } from '../site/config/config.js';
import { db } from './supabase.js';
import * as utils from '../site/scripts/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  const tenantData = await utils.loadTenantData();
  document.querySelector('.logo').textContent = `✂ ${tenantData.nome}`;
  
  loadAgenda();
  loadServices();
  loadConfig();
});

// 🔄 Agenda (só deste barbeiro)
async function loadAgenda() {
  const appointments = await utils.query('appointments');
  const table = document.getElementById('agendaTable');
  table.innerHTML = appointments.map(a => `
    <tr>
      <td>${a.time}</td>
      <td>${a.name}</td>
      <td>${a.service?.name}</td>
      <td>${a.phone}</td>
      <td><span class="status confirmado">Confirmado</span></td>
    </tr>
  `).join('');
}

// ✏️ Meus serviços (CRUD isolado)
async function loadServices() {
  const services = await utils.query('services');
  document.getElementById('myServices').innerHTML = services.map(s => `
    <div class="service-card">
      <strong>${s.name}</strong> R$ ${s.price}
      <button onclick="deleteService('${s.id}')">🗑</button>
    </div>
  `).join('');
}

window.addService = async () => {
  const name = document.getElementById('newService').value;
  const price = document.getElementById('servicePrice').value;
  await utils.query('services', { insert: { name, price, barbershop_id: utils.getCurrentTenantId() } });
  loadServices();
  document.getElementById('newService').value = '';
  document.getElementById('servicePrice').value = '';
};

window.deleteService = async (id) => {
  await db.from('services').delete().eq('id', id);
  loadServices();
};

// ⚙️ Configurações da minha barbearia
async function loadConfig() {
  const tenant = await utils.loadTenantData();
  document.getElementById('nomeBarbearia').value = tenant.nome || '';
  document.getElementById('whatsapp').value = tenant.whatsapp || '';
}

window.saveConfig = async () => {
  const nome = document.getElementById('nomeBarbearia').value;
  const whatsapp = document.getElementById('whatsapp').value;
  await db.from('barbershops').update({ nome, whatsapp }).eq('slug', utils.getCurrentTenantId());
  alert('Config salva!');
};

window.logout = () => {
  localStorage.clear();
  window.location.href = '../login.html';
};

// Auto-refresh agenda
setInterval(loadAgenda, 30000); // 30s

