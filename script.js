// ================= FIREBASE =================

const firebaseConfig = {
apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
authDomain: "champions-top8.firebaseapp.com",
databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
projectId: "champions-top8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= EQUIPOS =================

const equipos = [
"PSG","Chelsea","Galatasaray","Liverpool",
"Real Madrid","Manchester City","Atalanta","Bayern Múnich",
"Newcastle","Barcelona","Atlético","Tottenham",
"Bodø/Glimt","Sporting CP","Leverkusen","Arsenal"
];

const logosEquipos = {
"PSG":"https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
"Chelsea":"https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
"Galatasaray":"https://upload.wikimedia.org/wikipedia/en/5/5c/Galatasaray_Sports_Club_Logo.svg",
"Liverpool":"https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
"Real Madrid":"https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
"Manchester City":"https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
"Atalanta":"https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",
"Bayern Múnich":"https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo.svg",
"Newcastle":"https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
"Barcelona":"https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
"Atlético":"https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
"Tottenham":"https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
"Bodø/Glimt":"https://upload.wikimedia.org/wikipedia/en/9/9e/FK_Bodø_Glimt_logo.svg",
"Sporting CP":"https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
"Leverkusen":"https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
"Arsenal":"https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
};


// ================= CONFIG =================

const limites = {
cuartos:8,
semifinal:4,
final:2,
campeon:1
};

const puntosFase = {
cuartos:1,
semifinal:2,
final:3,
campeon:5
};

let admin=false;
let config={};
let resultados={};
let participantes={};


// ================= ADMIN =================

function loginAdmin(){

const pass=document.getElementById("adminPass").value;

if(pass==="1234"){

admin=true;

document.getElementById("modo").innerText="Modo 🔓 Administrador";
document.getElementById("adminFases").style.display="block";
document.getElementById("adminResultados").style.display="block";

renderResultadosAdmin();
renderLista();

}else{

alert("Clave incorrecta");

}

}


// ================= SELECT =================

function cargarSelectNombres(){

const select=document.getElementById("selectNombre");

select.innerHTML=`<option value="">Nuevo participante</option>`;

Object.keys(participantes).forEach(id=>{
const p=participantes[id];
select.innerHTML+=`<option value="${p.nombre}">${p.nombre}</option>`;
});

}

document.getElementById("selectNombre").addEventListener("change",function(){
const val=this.value;
if(val) document.getElementById("nombre").value=val;
});


// ================= PANEL =================

function renderPanel(){

const panel=document.getElementById("panelFases");
panel.innerHTML="";

Object.keys(limites).forEach(fase=>{

if(!config[fase]) return;

panel.innerHTML+=`
<h3>${fase.toUpperCase()} (${limites[fase]})</h3>
<div class="equipos" id="pick-${fase}"></div>
`;

const cont=document.getElementById(`pick-${fase}`);

equipos.forEach(eq=>{

const div=document.createElement("div");
div.className="equipo";

div.innerHTML=`
<img src="${logosEquipos[eq]}">
<div>${eq}</div>
`;

div.onclick=()=>{

const activos=cont.querySelectorAll(".activo");

if(!div.classList.contains("activo") && activos.length>=limites[fase]){
alert("Límite alcanzado");
return;
}

div.classList.toggle("activo");

};

cont.appendChild(div);

});

});

}


// ================= GUARDAR =================

function guardar(){

const nombre=document.getElementById("nombre").value.trim();
if(!nombre) return alert("Ingrese nombre");

const picks={};

Object.keys(limites).forEach(fase=>{

const cont=document.getElementById(`pick-${fase}`);
if(!cont) return;

const activos=cont.querySelectorAll(".activo");
const lista=Array.from(activos).map(e=>e.innerText);

if(lista.length>0) picks[fase]=lista;

});


let idExistente=null;

Object.keys(participantes).forEach(id=>{
if(participantes[id].nombre.toLowerCase()===nombre.toLowerCase())
idExistente=id;
});


if(idExistente){

const participante=participantes[idExistente];

let faseDuplicada=false;

Object.keys(picks).forEach(fase=>{
if(participante.picks && participante.picks[fase]){
faseDuplicada=true;
}
});

if(faseDuplicada){
alert("Esta persona ya registró esa fase");
return;
}

db.ref("participantes/"+idExistente+"/picks").update(picks);

}else{

db.ref("participantes").push({
nombre,
picks
});

}

}


// ================= RESULTADOS ADMIN =================

function renderResultadosAdmin(){

Object.keys(limites).forEach(fase=>{

const cont=document.getElementById("res-"+fase);

cont.innerHTML=`<h4>${fase}</h4><div class="equipos" id="res-grid-${fase}"></div>`;

const grid=document.getElementById(`res-grid-${fase}`);

equipos.forEach(eq=>{

const div=document.createElement("div");
div.className="equipo";

div.innerHTML=`
<img src="${logosEquipos[eq]}">
<div>${eq}</div>
`;

div.onclick=()=>{
if(!admin) return;
div.classList.toggle("activo");
};

grid.appendChild(div);

});

});

}


function guardarResultados(){

const data={};

Object.keys(limites).forEach(fase=>{
const activos=document.querySelectorAll(`#res-grid-${fase} .activo`);
data[fase]=Array.from(activos).map(e=>e.innerText);
});

db.ref("resultados").set(data);

}


// ================= PUNTOS =================

function calcularPuntos(picks){

let total=0;

Object.keys(picks||{}).forEach(fase=>{

if(!resultados[fase]) return;

picks[fase].forEach(eq=>{
if(resultados[fase].includes(eq))
total+=puntosFase[fase];
});

});

return total;

}


// ================= WHATSAPP =================

function enviarWhatsApp(id){

const p=participantes[id];
const puntos=calcularPuntos(p.picks);

let mensaje=`🏆 Champions Top 8\n\n`;
mensaje+=`Participante: ${p.nombre}\n`;
mensaje+=`Puntos: ${puntos}\n\n`;

Object.keys(p.picks||{}).forEach(fase=>{
mensaje+=`🔹 ${fase.toUpperCase()}\n`;

p.picks[fase].forEach(eq=>{
if(resultados[fase] && resultados[fase].includes(eq)){
mensaje+=`✅ ${eq}\n`;
}
});

mensaje+=`\n`;
});

const url=`https://wa.me/?text=${encodeURIComponent(mensaje)}`;
window.open(url,"_blank");

}


// ================= LISTA =================

function renderLista(){

const cont=document.getElementById("lista");
cont.innerHTML="";

Object.keys(participantes).forEach(id=>{

const p=participantes[id];
const puntos=calcularPuntos(p.picks);

let picksHTML="";

Object.keys(p.picks||{}).forEach(fase=>{
picksHTML+=`<div><b>${fase}</b>: ${p.picks[fase].join(" • ")}</div>`;
});

cont.innerHTML+=`
<div class="participante">
<b>${p.nombre}</b> — ${puntos} pts

<button onclick="enviarWhatsApp('${id}')">WhatsApp</button>

${admin ? `
<button class="eliminar" onclick="eliminarParticipante('${id}')">
Eliminar
</button>
` : ""}

${picksHTML}
</div>
`;

});

renderRanking();

}


// ================= RANKING =================

function renderRanking(){

const cont=document.getElementById("ranking");

let arr=Object.keys(participantes).map(id=>{
const p=participantes[id];
return{nombre:p.nombre,puntos:calcularPuntos(p.picks)};
});

arr.sort((a,b)=>b.puntos-a.puntos);

cont.innerHTML="";

arr.forEach((p,i)=>{
cont.innerHTML+=`<div>${i+1}. ${p.nombre} — ${p.puntos} pts</div>`;
});

}


// ================= FIREBASE =================

db.ref("config").on("value",snap=>{
config=snap.val()||{};
renderPanel();
});

db.ref("resultados").on("value",snap=>{
resultados=snap.val()||{};
renderLista();
});

db.ref("participantes").on("value",snap=>{
participantes=snap.val()||{};
renderLista();
cargarSelectNombres();
});
