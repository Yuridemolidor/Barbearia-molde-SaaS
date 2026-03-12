const SUPABASE_URL = "https://lwtourrhfehhevpixzgf.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dG91cnJoZmVoaGV2cGl4emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjk5MjYsImV4cCI6MjA4Nzc0NTkyNn0.3yDpHC6TZ-nTHdRS6Oq1HNWsMVzyjdGLuEc--tt5aio"

const db = supabase.createClient(
SUPABASE_URL,
SUPABASE_KEY
)

const BARBERSHOP_ID = "7ba3db5b-320e-490b-b065-c4737fa55db2"

async function carregarBarbearia(){

const { data } = await db
.from("barbershops")
.select("*")
.eq("id", BARBERSHOP_ID)
.maybeSingle()

if(!data) return

document.getElementById("nome").value = data.nome || ""
document.getElementById("telefone").value = data.telefone || ""
document.getElementById("whatsapp").value = data.whatsapp || ""
document.getElementById("endereco").value = data.endereco || ""
document.getElementById("instagram").value = data.instagram || ""
document.getElementById("facebook").value = data.facebook || ""

}

async function carregarAgendamentos(){

const { data } = await db
.from("appointments")
.select("*")
.order("date")

const tabela = document.querySelector("#agendamentos tbody")

tabela.innerHTML = ""

data.forEach(a => {

tabela.innerHTML += `
<tr>
<td>${a.date}</td>
<td>${a.time}</td>
<td>${a.client_name}</td>
<td>${a.phone}</td>
<td>${a.service}</td>
</tr>
`

})

}

document.getElementById("salvarInfo").onclick = async () => {

const nome = document.getElementById("nome").value
const telefone = document.getElementById("telefone").value
const whatsapp = document.getElementById("whatsapp").value
const endereco = document.getElementById("endereco").value
const instagram = document.getElementById("instagram").value
const facebook = document.getElementById("facebook").value

console.log("Tentando salvar dados...")

const { data, error } = await db
.from("barbershops")
.update({
nome,
telefone,
whatsapp,
endereco,
instagram,
facebook
})
.eq("id", BARBERSHOP_ID)

console.log("Resposta do banco:", data)
console.log("Erro:", error)

if(error){

alert("❌ ERRO AO SALVAR:\n" + error.message)

}else{

alert("✅ Informações salvas com sucesso!")

}

}

document.getElementById("addServico").onclick = async () => {

const nome = document.getElementById("servicoNome").value
const desc = document.getElementById("servicoDesc").value
const preco = document.getElementById("servicoPreco").value

const { data, error } = await db.from("services").insert({
name: nome,
desc: desc,
price: Number(preco),
barbershop_id: BARBERSHOP_ID,
})

console.log(data)
console.log(error)

if(error){
alert("Erro: " + error.message)
}else{
alert("Serviço adicionado!")
}

}

async function carregarServicos(){

const { data, error } = await db
.from("services")
.select("*")
.eq("barbershop_id", BARBERSHOP_ID);

if(error){
console.error("Erro ao carregar serviços:", error);
return;
}

const lista = document.getElementById("listaServicos");

lista.innerHTML = "";

data.forEach(servico => {

const item = document.createElement("div");

item.className = "servico-item";

item.innerHTML = `
<h3>${servico.nome}</h3>
<p>${servico.desc}</p>
<span>R$ ${servico.preco}</span>
`;

lista.appendChild(item);

});

}

document.getElementById("logout").onclick = () => {
window.location.href = "../site/index.html"
}

document.addEventListener("DOMContentLoaded", () => {

carregarBarbearia()
carregarAgendamentos()
carregarServicos();

})