const video=document.querySelector("#video");
const canvas=document.querySelector("#canvas");
const btnFoto=document.querySelector("#btn-foto");
const btnSelfie=document.querySelector("#btn-selfie");
const btnPublicar=document.querySelector("#btn-publicar");
const fotoAmbiente=document.querySelector("#foto-ambiente");
const fotoSelfie=document.querySelector("#foto-selfie");
const preview=document.querySelector("#preview");
const localTexto=document.querySelector("#local");
const statusTexto=document.querySelector("#status");
const feedConteudo=document.querySelector("#feed-conteudo");

let fotoAmbienteData=null;
let fotoSelfieData=null;
let latitude=null;
let longitude=null;
let localNome="Localização desconhecida";

async function iniciarCamera(){
  try {
    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
    video.srcObject=stream;
  } catch(erro) {
    console.error("Erro ao acessar câmera:",erro);
    statusTexto.innerText="Você precisa permitir o acesso à câmera.";
  }
}

iniciarCamera();

function tirarFoto(){

  if(!video.videoWidth||!video.videoHeight) {
    alert("A câmera ainda não está pronta.");
  return null;
}

canvas.width=video.videoWidth;
canvas.height=video.videoHeight;

const contexto=canvas.getContext("2d");

contexto.drawImage(video,0,0,canvas.width,canvas.height);

return canvas.toDataURL("image/png");
}

btnFoto.addEventListener("click",()=> {
  fotoAmbienteData=tirarFoto();

  if(!fotoAmbienteData)
    return;

fotoAmbiente.src=fotoAmbienteData;

btnFoto.style.display="none";

btnSelfie.style.display="inline-block";

statusTexto.innerText="Ambiente registrado! Agora tire sua selfie.";

});

btnSelfie.addEventListener("click",async()=> {
  const streamAtual=video.srcObject;
    if(streamAtual) {
      streamAtual.getTracks().forEach(track=>track.stop());
}

  try {

    const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"user"},audio:false});

video.srcObject=stream;

  } catch(erro) {
    console.error(erro);

alert("Não foi possível acessar a câmera frontal.");

return;
}
await new Promise(resolve=>{video.onloadedmetadata=resolve;});

fotoSelfieData=tirarFoto();

  if(!fotoSelfieData)
    return;

fotoSelfie.src=fotoSelfieData;

btnSelfie.style.display="none";

preview.style.display="block";

btnPublicar.style.display="inline-block";

statusTexto.innerText="Selfie registrada! Buscando sua localização...";

obterLocalizacao();

});

function obterLocalizacao() {
  if(!navigator.geolocation){

    localTexto.innerText="📍 Geolocalização não disponível.";
return;

}
navigator.geolocation.getCurrentPosition(async(posicao)=> {

latitude=posicao.coords.latitude;
longitude=posicao.coords.longitude;

await buscarLocal(latitude,longitude);
}, erro=> {
  console.error("Erro ao obter localização:",erro);

  localTexto.innerText="📍 Não foi possível obter sua localização.";

}, {enableHighAccuracy:true,timeout:10000,maximumAge:0});

}

async function buscarLocal(lat,lon){
  try{
    const url=`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
    const resposta=await fetch(url,{headers:{"Accept":"application/json"}});
    const dados=await resposta.json();
  if(dados.display_name) {

localNome=dados.display_name;

localTexto.innerText=`📍 ${localNome}`;

  } else {

localTexto.innerText="📍 Local não encontrado.";

}
} catch(erro) {

console.error("Erro ao buscar local:",erro);

localTexto.innerText="📍 Erro ao buscar o nome do local.";

}
}

btnPublicar.addEventListener("click",()=> {
  if(!fotoAmbienteData||!fotoSelfieData) {

alert("Você precisa tirar as duas fotos.");
return;
}

  if(latitude===null||longitude===null) {
alert("A localização ainda não foi encontrada.");
return;
}

const now={

id:Date.now(),

fotoAmbiente:fotoAmbienteData,

fotoSelfie:fotoSelfieData,

latitude:latitude,

longitude:longitude,

local:localNome,

data:new Date().toISOString()

};

localStorage.setItem("meuNow",JSON.stringify(now));
  const nows=JSON.parse(localStorage.getItem("nows"))||[];

  nows.push(now);
  localStorage.setItem("nows",JSON.stringify(nows));

  alert("Now publicado!");
verificarAcessoFeed();
});

function verificarAcessoFeed() {

  const meuNow=JSON.parse(localStorage.getItem("meuNow"));
  if(!meuNow) {

mostrarFeedBloqueado();

return;
}

  const dataPostagem=new Date(meuNow.data);
  const agora=new Date();
  const diferenca=agora-dataPostagem;
  const vinteQuatroHoras=24*60*60*1000;

  if(diferenca<=vinteQuatroHoras) {
  mostrarFeed();

    } else {

mostrarFeedBloqueado();

}
}

function mostrarFeedBloqueado(){

  feedConteudo.innerHTML=`<div class="bloqueado"><h3>🔒 Feed bloqueado</h3><p>Para ver os Nows de outras pessoas, você precisa publicar um Now nas últimas 24 horas.</p></div>`;
}

function mostrarFeed() {
  const nows=JSON.parse(localStorage.getItem("nows"))||[];
  
  if(nows.length===0) {
    feedConteudo.innerHTML=`<div class="bloqueado"><p>Nenhum Now encontrado.</p></div>`;
return;
}

feedConteudo.innerHTML="";
nows.forEach(now=>criarCardNow(now));

}

function criarCardNow(now){
  const card=document.createElement("div");

  card.classList.add("now-card");
  card.innerHTML=`<div class="fotos-card"><img src="${now.fotoAmbiente}" class="foto-card foto-ambiente" draggable="true" data-tipo="ambiente"><img src="${now.fotoSelfie}" class="foto-card foto-selfie" draggable="true" data-tipo="selfie"></div><div class="info-card"><p class="destaque">📍 ${now.local}</p><p>🕐 ${formatarData(now.data)}</p></div>`;
  feedConteudo.appendChild(card);

configurarDragAndDrop(card);

}

function configurarDragAndDrop(card) {
  const fotos=card.querySelectorAll(".foto-card");

  fotos.forEach(foto=> {
  foto.addEventListener("dragstart",evento=> {

  evento.dataTransfer.setData("text/plain",foto.dataset.tipo);
});

foto.addEventListener("dragover",evento=>{
evento.preventDefault();

});

foto.addEventListener("drop",evento=>{
evento.preventDefault();
  const tipoArrastado=evento.dataTransfer.getData("text/plain");
  const fotoArrastada=card.querySelector(`[data-tipo="${tipoArrastado}"]`);
  const fotoDestino=evento.currentTarget;
  if(fotoArrastada&&fotoDestino&&fotoArrastada!==fotoDestino) {

trocarFotos(fotoArrastada,fotoDestino);

}

});

});

}

function trocarFotos(foto1,foto2) {

const src1=foto1.src;
const src2=foto2.src;

foto1.src=src2;
foto2.src=src1;

const z1=foto1.style.zIndex;
const z2=foto2.style.zIndex;

foto1.style.zIndex=z2||1;
foto2.style.zIndex=z1||2;

}

function formatarData(data) {

  const dataObj=new Date(data);
  return dataObj.toLocaleString("pt-BR");

}

window.addEventListener("keydown",event=> {
  if(event.code==="Space") {
    event.preventDefault();

  if(btnFoto.style.display!=="none") {
    btnFoto.click();
  } else if(btnSelfie.style.display!=="none") {

btnSelfie.click();

}
}
});

verificarAcessoFeed();