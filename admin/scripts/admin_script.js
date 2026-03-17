const SUPABASE_URL = "https://lwtourrhfehhevpixzgf.supabase.co"
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3dG91cnJoZmVoaGV2cGl4emdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjk5MjYsImV4cCI6MjA4Nzc0NTkyNn0.3yDpHC6TZ-nTHdRS6Oq1HNWsMVzyjdGLuEc--tt5aio"

const db = createClient(
  CONFIG.SUPABASE_URL,
  CONFIG.SUPABASE_KEY,
  {
    auth: {
      persistSession: false
    }
  }
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

const { data, error } = await db
.from("appointments")
.select(`
id,
name,
date,
time,
phone,
services (
name
)
`);

const tabela = document.querySelector("#agendamentos tbody")

tabela.innerHTML = ""

data.forEach(a => {

tabela.innerHTML += `
<tr>
<td>${formatarData(a.date)}</td>
<td>${a.time}</td>
<td>${a.name}</td>
<td>${a.phone}</td>
<td>${a.services?.name || "Serviço não encontrado"}</td>
<td>
<button onclick="apagarAgendamento('${a.id}')">
Apagar
</button>
</td>
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

const card = document.createElement("div");

card.className = "servico-card";

card.innerHTML = `
<div class="servico-info">
<h3>${servico.name}</h3>
<p>${servico.desc}</p>
<span class="servico-preco">R$ ${servico.price}</span>
</div>

<div class="servico-acoes">

<button class="btn-editar" onclick="editarServico('${servico.id}','${servico.name}','${servico.desc}','${servico.price}')">
Editar
</button>

<button class="btn-apagar" onclick="apagarServico('${servico.id}')">
Apagar
</button>

</div>
`;

lista.appendChild(card);

});

}

async function apagarServico(id){

const confirmar = confirm("Deseja apagar este serviço?");

if(!confirmar) return;

const { error } = await db
.from("services")
.delete()
.eq("id", id);

if(error){

alert("Erro ao apagar serviço");

console.error(error);

return;

}

alert("Serviço apagado");

carregarServicos();

}

async function editarServico(id,nome,desc,preco){

const novoNome = prompt("Nome do serviço:", nome);
const novaDesc = prompt("Descrição:", desc);
const novoPreco = prompt("Preço:", preco);

if(!novoNome || !novoPreco) return;

const { error } = await db
.from("services")
.update({
name: novoNome,
desc: novaDesc,
price: Number(novoPreco)
})
.eq("id", id);

if(error){

alert("Erro ao editar serviço");

console.error(error);

return;

}

alert("Serviço atualizado");

carregarServicos();

}

const inputFoto = document.getElementById("inputFoto");
const btnAddFoto = document.querySelector("#galeria .btn-gold");

btnAddFoto.onclick = async () => {
  if(inputFoto.files.length === 0){
    alert("❌ Selecione pelo menos uma foto");
    return;
  }

for(const file of inputFoto.files){

  const fileName = `${BARBERSHOP_ID}_${Date.now()}_${file.name}`;

  const { error: uploadError } = await db.storage
    .from("gallery")
    .upload(fileName, file);

  if(uploadError){
    console.error(uploadError);
    alert("Erro ao enviar " + file.name);
    continue;
  }

  const { data: urlData } = db.storage
    .from("gallery")
    .getPublicUrl(fileName);

  const publicUrl = urlData?.publicUrl;

  if(!publicUrl){
    console.error("URL inválida");
    continue;
  }

  const { error: insertError } = await db
  .from("gallery")
  .insert({
  image_url: publicUrl,
  barbershop_id: BARBERSHOP_ID
});
  if(insertError){
    console.error(insertError);
  }

}

  alert("Fotos enviadas com sucesso!");
  inputFoto.value = ""; // limpa o input
  carregarResumo();
  carregarGaleria(); // função para mostrar as fotos na tela
};

async function carregarGaleria(){
  const { data, error } = await db.from("gallery")
    .select("*")
    .eq("barbershop_id", BARBERSHOP_ID);

  const galleryContainer = document.querySelector(".gallery-admin");
  galleryContainer.innerHTML = "";

  data.forEach(foto => {

    if(!foto.image_url) return;

    const div = document.createElement("div");
    div.style.position = "relative"; // para posicionar o botão
    div.style.display = "inline-block";

    const img = document.createElement("img");
    img.src = foto.image_url;
    img.style.width = "200px";
    img.style.height = "160px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "10px";

    const btnApagar = document.createElement("button");
    btnApagar.innerText = "❌";
    btnApagar.style.position = "absolute";
    btnApagar.style.top = "5px";
    btnApagar.style.right = "5px";
    btnApagar.style.background = "rgba(255,0,0,0.7)";
    btnApagar.style.color = "#fff";
    btnApagar.style.border = "none";
    btnApagar.style.borderRadius = "50%";
    btnApagar.style.cursor = "pointer";
    btnApagar.onclick = () => apagarFoto(foto.id, foto.image_url);

    div.appendChild(img);
    div.appendChild(btnApagar);
    galleryContainer.appendChild(div);
  });
}

async function apagarFoto(id, image_url){
  const confirmar = confirm("Deseja realmente apagar esta foto?");
  if(!confirmar) return;

  try{
    // Extrai o caminho do arquivo no Storage a partir da URL
    // Supomos que a URL tem formato: https://xyz.supabase.co/storage/v1/object/public/gallery/NOME_DO_ARQUIVO
    const path = image_url.split("/gallery/")[1];

    // Apagar do Storage
    const { error: storageError } = await db.storage
      .from("gallery")
      .remove([path]);

    if(storageError){
      console.error(storageError);
      alert("Erro ao apagar arquivo do Storage");
      return;
    }

    // Apagar do banco
    const { error: dbError } = await db
      .from("gallery")
      .delete()
      .eq("id", id);

    if(dbError){
      console.error(dbError);
      alert("Erro ao apagar registro do banco");
      return;
    }

    alert("Foto apagada com sucesso!");
    carregarResumo();
    carregarGaleria();

  }catch(e){
    console.error(e);
    alert("Erro inesperado ao apagar a foto");
  }
}

async function carregarResumo(){

// DATA DE HOJE
const hoje = new Date().toISOString().split("T")[0]

// AGENDAMENTOS DE HOJE
const { data: agHoje, error } = await db
.from("appointments")
.select("id")
.eq("date", hoje)

if(error){
console.error(error)
}

document.getElementById("agHoje").innerText = agHoje?.length || 0


// TOTAL DE SERVIÇOS
const { data: servicos } = await db
.from("services")
.select("id")
.eq("barbershop_id", BARBERSHOP_ID)

document.getElementById("totalServicos").innerText = servicos?.length || 0


// TOTAL DE FOTOS
const { data: fotos } = await db
.from("gallery")
.select("id")
.eq("barbershop_id", BARBERSHOP_ID)

document.getElementById("totalFotos").innerText = fotos?.length || 0

}

async function apagarAgendamento(id){

const confirmar = confirm("Deseja apagar este agendamento?")

if(!confirmar) return

const { error } = await db
.from("appointments")
.delete()
.eq("id", id)

if(error){
alert("Erro ao apagar")
console.error(error)
return
}

alert("Agendamento apagado")

carregarAgendamentos()
carregarResumo()

}

async function limparAgendamentosAntigos(){

const agora = new Date()

const { data } = await db
.from("appointments")
.select("*")

if(!data) return

for(const a of data){

const horario = new Date(a.date + "T" + a.time)

horario.setMinutes(horario.getMinutes() + 30)

if(agora > horario){

await db
.from("appointments")
.delete()
.eq("id", a.id)

}

}

}

document.getElementById("logout").addEventListener("click", async () => {
window.location.href = "https://yuridemolidor.github.io/Barbearia-molde-SaaS/"
})
function formatarData(data){

const partes = data.split("-")

const ano = partes[0]
const mes = partes[1]
const dia = partes[2]

return `${dia}/${mes}/${ano}`

}

document.addEventListener("DOMContentLoaded", () => {

limparAgendamentosAntigos()

carregarBarbearia()
carregarAgendamentos()
carregarServicos()
carregarResumo()
carregarGaleria()

})