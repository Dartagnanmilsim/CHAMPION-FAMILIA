// ================= FIREBASE =================

const firebaseConfig = {
apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
authDomain: "champions-top8.firebaseapp.com",
databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
projectId: "champions-top8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= DATA =================

const equipos = [
"Paris","Chelsea",
"Galatasaray","Liverpool",
"Real Madrid","Manchester City",
"Atalanta","Bayern Múnich",
"Newcastle","Barcelona",
"Atlético Madrid","Tottenham",
"Bodø/Glimt","Sporting CP",
"Bayer Leverkusen","Arsenal"
];

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


// ================= SELECT NOMBRES =================

function cargarSelectNombres(){

const select=document.getElementById("selectNombre");

select.innerHTML=`<option value="">Nuevo participante</option>`;

Object.keys(participantes).forEach(id=>{

const p=participantes[id];

select.innerHTML+=`
<option value="${p.nombre}">
${p.nombre}
</option>
`;

});

}

document.getElementById("selectNombre").addEventListener("change",function(){

const val=this.value;

if(val){
document.getElementById("nombre").value=val;
}

});


// ================= ELIMINAR =================

function eliminarParticipante(id){

if(!admin){
alert("Solo administrador");
return;
}

if(!confirm("¿Eliminar participante?")) return;

db.ref("participantes/"+id).remove();

}


// ================= PANEL PARTICIPANTE =================

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
div.innerText=eq;

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


// ================= CONFIG =================

function guardarConfig(){

config={
cuartos:document.getElementById("check-cuartos").checked,
semifinal:document.getElementById("check-semifinal").checked,
final:document.getElementById("check-final").checked,
campeon:document.getElementById("check-campeon").checked
};

db.ref("config").set(config);

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
div.innerText=eq;

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


// ================= LISTA =================

function renderLista(){

const cont=document.getElementById("lista");
cont.innerHTML="";

Object.keys(participantes).forEach(id=>{

const p=participantes[id];

let picksHTML="";

Object.keys(p.picks||{}).forEach(fase=>{

picksHTML+=`<div><b>${fase}</b>: ${p.picks[fase].join(" • ")}</div>`;

});

const puntos=calcularPuntos(p.picks);

cont.innerHTML+=`
<div class="participante">
<b>${p.nombre}</b> — ${puntos} pts

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

return{
nombre:p.nombre,
puntos:calcularPuntos(p.picks)
};

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
