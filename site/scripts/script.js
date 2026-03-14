import { CONFIG } from "../config/config.js";
import { db } from "./supabase.js";

let barbearia = {};
const senhaAdmin = CONFIG.senhaAdmin;

let horariosDisponiveis = [];
let diasBloqueados = [];

document.title = CONFIG.nomeBarbearia;

/* ================= SUPABASE CONFIG ================= */

const SUPABASE_URL = CONFIG.SUPABASE_URL;
const SUPABASE_KEY = CONFIG.SUPABASE_KEY;

/* ================= WHATS ================= */

function agendar(){

if(!barbearia.whatsapp){
alert("WhatsApp não configurado");
return;
}

let msg = `Olá, gostaria de agendar um horário na ${barbearia.nome}.`;

window.open(
`https://wa.me/${barbearia.whatsapp}?text=${encodeURIComponent(msg)}`,
"_blank"
);

}

/* ================= ADMIN ================= */

function mostrarAdmin(){
let admin = document.querySelector(".admin");

if(admin.style.display === "block"){
admin.style.display = "none";
}else{
admin.style.display = "block";
window.scrollTo({top:admin.offsetTop - 80,behavior:"smooth"});
}
}

function loginAdmin(){
let senha = document.getElementById("adminSenha").value;

if(senha === senhaAdmin){
document.getElementById("loginArea").style.display="none";
document.getElementById("adminArea").style.display="block";
renderAdmin();
fetchAppointments();
fetchAppointmentsBarbeiro();

}else{
alert("Senha incorreta!");
}
}

function logoutAdmin(){
document.getElementById("loginArea").style.display="block";
document.getElementById("adminArea").style.display="none";
document.getElementById("adminSenha").value="";
}

const BARBERSHOP_ID = "7ba3db5b-320e-490b-b065-c4737fa55db2";

async function carregarBarbearia(){

const { data, error } = await db
.from("barbershops")
.select("*")
.eq("id", BARBERSHOP_ID)
.single();

if(error){
console.error("Erro ao carregar barbearia:", error);
return;
}

barbearia = data;

/* TEXTOS */

document.getElementById("nomeBarbearia").innerText = "✂ " + (data.nome || "");
document.getElementById("footerNome").innerText = data.nome || "";
document.getElementById("footerEndereco").innerText = data.endereco || "";
document.getElementById("footerTelefone").innerText = data.telefone || "";

/* REDES SOCIAIS */

const insta = document.getElementById("linkInstagram");
const face = document.getElementById("linkFacebook");
const whats = document.getElementById("linkWhatsApp");

if(insta && data.instagram){
insta.href = `https://instagram.com/${data.instagram}`
}

if(face && data.facebook){
face.href = `https://facebook.com/${data.facebook}`
}

if(whats && data.whatsapp){
whats.href = `https://wa.me/${data.whatsapp}`;
}

}

/* ================= SERVIÇOS ================= */

let services = [];
let editIndex = null;

/* ===== BUSCAR SERVIÇOS ===== */

async function fetchServices(){

const { data, error } = await db
.from("services")
.select("*")
.order("id", { ascending: true });

if(error){
console.error("Erro ao buscar serviços:", error);
return;
}

services = data;

renderServices();
renderAdmin();
carregarServicosSelect(); // 👈 agora integra com o agendamento
}
/* ===== RENDER FRONT ===== */

function renderServices(){
let container=document.getElementById("servicesContainer");
container.innerHTML="";

services.forEach((s)=>{
container.innerHTML+=`
<div class="card">
<h3>${s.name}</h3>
<p>${s.desc}</p>
<div class="price">${s.price}</div>
</div>`;
});
}

/* ===== RENDER ADMIN ===== */

function renderAdmin(){
let list=document.getElementById("adminList");
list.innerHTML="";

services.forEach((s,i)=>{
list.innerHTML+=`
<div class="admin-item">
<div>
<strong>${s.name}</strong><br>
<span style="color:#aaa;font-size:13px;">${s.price}</span>
</div>
<div>
<button onclick="editarServico(${i})" style="margin-right:10px;">✏</button>
<button onclick="excluirServico(${s.id})">🗑</button>
</div>
</div>`;
});
}

/* ===== SALVAR ===== */

async function salvarServico(){

let name=document.getElementById("serviceName").value;
let desc=document.getElementById("serviceDesc").value;
let price=document.getElementById("servicePrice").value;
let btn = document.querySelector("#adminArea .btn");

if(!name || !desc || !price){
alert("Preencha todos os campos!");
return;
}

if(editIndex===null){

const { error } = await db
.from("services")
.insert([{ name, desc, price }]);

if(error){
console.error(error);
return;
}

alert("Serviço adicionado com sucesso!");

}else{

let id = services[editIndex].id;

const { error } = await db
.from("services")
.update({ name, desc, price })
.eq("id", id);

if(error){
console.error(error);
return;
}

alert("Serviço atualizado com sucesso!");
editIndex=null;
btn.textContent="Salvar Serviço";
}

limparCampos();
fetchServices();
}

/* ===== EDITAR ===== */

function editarServico(i){
let s=services[i];
document.getElementById("serviceName").value=s.name;
document.getElementById("serviceDesc").value=s.desc;
document.getElementById("servicePrice").value=s.price;
editIndex=i;

document.querySelector("#adminArea .btn").textContent="Atualizar Serviço";
}

/* ===== EXCLUIR ===== */

async function excluirServico(id){

if(confirm("Deseja excluir este serviço?")){

const { error } = await db
.from("services")
.delete()
.eq("id", id);

if(error){
console.error(error);
return;
}

fetchServices();
}
}

function limparCampos(){
document.getElementById("serviceName").value="";
document.getElementById("serviceDesc").value="";
document.getElementById("servicePrice").value="";
}

/* INIT */

document.addEventListener("DOMContentLoaded", async ()=>{

await fetchServices();
await fetchHorarios();
await fetchDiasBloqueados();
await fetchAppointmentsBarbeiro();
await gerarCalendario();
await carregarGaleria();
await carregarBarbearia();

let sairBtn = document.createElement("button");
sairBtn.textContent = "Sair do Painel";
sairBtn.className = "btn";
sairBtn.style.marginTop="20px";
sairBtn.onclick = logoutAdmin;

document.getElementById("adminArea").appendChild(sairBtn);

});
document.getElementById("ano").textContent = CONFIG.anoCriacao;

/* ================= AGENDAMENTO ================= */


/* ================= HORÁRIOS DINÂMICOS ================= */

// Horários disponíveis
async function fetchHorarios() {
    const { data, error } = await db
        .from("available_hours")
        .select("*")
        .order("hour", { ascending: true });

    if(error){
        console.error("Erro ao buscar horários:", error);
        return;
    }

    horariosDisponiveis = data.map(h => h.hour);
    renderHorariosAdmin();
}

// Dias bloqueados
async function fetchDiasBloqueados() {
    const { data, error } = await db
        .from("blocked_days")
        .select("*");

    if(error){
        console.error(error);
        return;
    }

    diasBloqueados = data.map(d => d.date);
    renderDiasBloqueados();
}

/* Mostrar horários no painel admin */
function renderHorariosAdmin(){

let container = document.getElementById("listaHorarios");
if(!container) return;

container.innerHTML = "";

horariosDisponiveis.forEach(h=>{
container.innerHTML += `
<div style="display:flex;justify-content:space-between;
background:#111;padding:8px;margin-bottom:5px;border-radius:5px;">
<span>${h}</span>
<button onclick="removerHorario('${h}')">🗑</button>
</div>
`;
});
}

/* ===== BUSCAR AGENDAMENTOS ===== */

async function fetchAppointments(){
    const { data, error } = await db
        .from("appointments")
        .select(`
            id,
            name,
            phone,
            date,
            time,
            service:service_id ( name )
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if(error){
        console.error("Erro ao buscar agendamentos:", error);
        return;
    }

    renderAppointments(data);
}
/* ===== RENDER TABELA ===== */

function renderAppointments(lista){

let container = document.getElementById("appointmentsTable");
if(!container) return;

container.innerHTML = `
<table style="width:100%;border-collapse:collapse;margin-top:20px;">
<thead>
<tr style="background:#111;">
<th>Data</th>
<th>Horário</th>
<th>Cliente</th>
<th>Telefone</th>
<th>Serviço</th>
<th></th>
</tr>
</thead>
<tbody>
${lista.map(a=>`
<tr style="text-align:center;border-bottom:1px solid #333;">
<td>${a.date}</td>
<td>${a.time}</td>
<td>${a.name}</td>
<td>${a.phone}</td>
<td>${a.service_id?.name || ""}</td>
<td>
<button onclick="cancelarAgendamento(${a.id})">❌</button>
</td>
</tr>
`).join("")}
</tbody>
</table>
`;
}

/* ===== CANCELAR ===== */

async function cancelarAgendamento(id){

if(!confirm("Deseja cancelar este agendamento?")) return;

await db
.from("appointments")
.delete()
.eq("id", id);

fetchAppointments();
fetchAppointmentsBarbeiro();
}

/* Adicionar novo horário */
async function adicionarHorario(){

let input = document.getElementById("novoHorario");
let hour = input.value;

if(!hour){
alert("Selecione um horário!");
return;
}

const { error } = await db
.from("available_hours")
.insert([{ hour }]);

if(error){
console.error(error);
alert("Erro ao adicionar horário");
return;
}

input.value = "";
fetchHorarios();
}

/* Remover horário */
async function removerHorario(hour){

const { error } = await db
.from("available_hours")
.delete()
.eq("hour", hour);

if(error){
console.error(error);
return;
}

fetchHorarios();
}

/* ===== CARREGAR SERVIÇOS NO SELECT ===== */

function carregarServicosSelect(){

let select = document.getElementById("servicoSelect");
if(!select) return;

select.innerHTML = "<option value=''>Selecione um serviço</option>";

services.forEach(s=>{
select.innerHTML += `
<option value="${s.id}">
${s.name} - ${s.price}
</option>`;
});
}

/* ===== CARREGAR HORÁRIOS DISPONÍVEIS ===== */

async function carregarHorarios(){

let dataEscolhida = dataSelecionada;
let select = document.getElementById("horarioSelect");

if(!dataEscolhida){
select.innerHTML = "<option value=''>Selecione uma data</option>";
return;
}

/* buscar horários ocupados nesse dia */

const { data, error } = await db
.from("appointments")
.select("time")
.eq("date", dataEscolhida);

if(error){
console.error(error);
return;
}

let horariosOcupados = data.map(a => a.time);

/* limpar select */

select.innerHTML = "";

/* mostrar apenas horários livres */

horariosDisponiveis.forEach(h=>{

if(!horariosOcupados.includes(h)){

select.innerHTML += `
<option value="${h}">
${h}
</option>
`;

}

});

/* se não houver horário */

if(select.innerHTML === ""){
select.innerHTML = "<option>Sem horários disponíveis</option>";
}

}

let dataSelecionada = null;

function gerarCalendario(){

let calendario = document.getElementById("calendario");
let hoje = new Date();

let ano = hoje.getFullYear();
let mes = hoje.getMonth();

let primeiroDia = new Date(ano, mes, 1).getDay();
let totalDias = new Date(ano, mes + 1, 0).getDate();

calendario.innerHTML = `
<div class="cal-header">
<span>${hoje.toLocaleString("pt-BR",{month:"long"})} ${ano}</span>
</div>

<div class="cal-grid" id="calGrid"></div>
`;

let grid = document.getElementById("calGrid");

/* espaços antes do primeiro dia */

for(let i=0;i<primeiroDia;i++){
grid.innerHTML += "<div></div>";
}

/* dias do mês */

for(let d=1; d<=totalDias; d++){

let dataObj = new Date(ano, mes, d);
let data = dataObj.toISOString().split("T")[0];

let hoje = new Date();
hoje.setHours(0,0,0,0);

/* BLOQUEAR DIAS PASSADOS */

let passado = dataObj < hoje;

/* BLOQUEIOS */

let bloqueado = diasBloqueados.includes(data) || passado;

grid.innerHTML += `
<div class="cal-dia ${bloqueado ? "cal-bloqueado":""}"
onclick="selecionarData('${data}', ${bloqueado})">
${d}
</div>
`;

}

}

function selecionarData(data, bloqueado){

if(bloqueado) return;

dataSelecionada = data;

/* salvar no input hidden */

document.getElementById("dataSelect").value = data;

document.querySelectorAll(".cal-dia").forEach(d=>{
d.classList.remove("cal-selecionado");
});

/* destacar dia */

event.target.classList.add("cal-selecionado");

/* carregar horários */

carregarHorarios();

}

/* ===== CONFIRMAR AGENDAMENTO ===== */

async function confirmarAgendamento(){
    let nome = document.getElementById("clienteNome").value;
    let telefone = document.getElementById("clienteTelefone").value;
    let service_id = parseInt(document.getElementById("servicoSelect").value);
    let date = document.getElementById("dataSelect").value;
    let time = document.getElementById("horarioSelect").value;

    if(!nome || !telefone || !service_id || !date || !time){
        alert("Preencha todos os campos!");
        return;
    }

    const { error } = await db
        .from("appointments")
        .insert([{ 
            name: nome, 
            phone: telefone, 
            service_id: service_id, 
            date: date, 
            time: time 
        }]);

    if(error){
    alert("Erro ao agendar: " + error.message);
    console.error("Erro completo:", error);
    return;
}

    alert("Agendamento confirmado com sucesso! 🎉");

    fetchAppointmentsBarbeiro();
    fetchAppointments();


    // Limpar campos
    document.getElementById("clienteNome").value = "";
    document.getElementById("clienteTelefone").value = "";
    document.getElementById("servicoSelect").value = "";
    document.getElementById("dataSelect").value = "";
    document.getElementById("horarioSelect").innerHTML =
        "<option value=''>Selecione uma data primeiro</option>";
}

// Buscar agendamentos para o barbeiro (todos)
async function fetchAppointmentsBarbeiro() {
    const { data, error } = await db
        .from("appointments")
        .select(`
            id,
            name,
            phone,
            date,
            time,
            service:service_id ( name )
        `)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

    if(error){
        console.error("Erro ao buscar agendamentos para barbeiro:", error);
        return;
    }

    renderAppointmentsBarbeiro(data);
}

// Renderizar na tabela do barbeiro
function renderAppointmentsBarbeiro(lista) {
    const container = document.querySelector("#barbeiroTable tbody");
    if(!container) return;

    container.innerHTML = lista.map(a => `
        <tr style="text-align:center;border-bottom:1px solid #333;">
            <td>${a.date}</td>
            <td>${a.time}</td>
            <td>${a.name}</td>
            <td>${a.phone}</td>
            <td>${a.service?.name || ""}</td>
        </tr>
    `).join("");
}

async function bloquearDia(){

let data = document.getElementById("diaBloqueado").value;
if(!data){
alert("Selecione um dia!");
return;
}

const { error } = await db
.from("blocked_days")
.insert([{ date: data }]);

if(error){
console.error(error);
return;
}

document.getElementById("diaBloqueado").value="";
fetchDiasBloqueados();
renderDiasBloqueados();
}


function renderDiasBloqueados(){

let container = document.getElementById("listaDiasBloqueados");
container.innerHTML="";

diasBloqueados.forEach(d=>{
container.innerHTML+=`
<div style="display:flex;justify-content:space-between;
background:#111;padding:8px;margin-bottom:5px;border-radius:5px;">
<span>${new Date(d).toLocaleDateString('pt-BR')}</span>
<button onclick="removerDia('${d}')">🗑</button>
</div>
`;
});
}


async function removerDia(data){

await db
.from("blocked_days")
.delete()
.eq("date", data);

fetchDiasBloqueados();
renderDiasBloqueados();
}

async function carregarGaleria(){

const { data, error } = await db
.from("gallery")
.select("*")
.order("id", { ascending: false });

if(error){
console.error("Erro ao carregar galeria:", error);
return;
}

const container = document.querySelector(".gallery");

if(!container) return;

container.innerHTML = "";

data.forEach(foto => {

if(!foto.image_url) return;

container.innerHTML += `
<div class="gallery-item">
<img src="${foto.image_url}">
</div>
`;

});

}

/* ===== EVENTO AO MUDAR DATA ===== */

document.addEventListener("change", function(e){
if(e.target && e.target.id === "dataSelect"){
carregarHorarios();
}
});

window.agendar = agendar;
window.mostrarAdmin = mostrarAdmin;
window.confirmarAgendamento = confirmarAgendamento;
window.loginAdmin = loginAdmin;
window.salvarServico = salvarServico;
window.editarServico = editarServico;
window.excluirServico = excluirServico;
window.adicionarHorario = adicionarHorario;
window.removerHorario = removerHorario;
window.bloquearDia = bloquearDia;
window.removerDia = removerDia;
window.cancelarAgendamento = cancelarAgendamento;
window.selecionarData = selecionarData;