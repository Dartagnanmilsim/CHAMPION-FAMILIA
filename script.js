// ================= FIREBASE =================

const firebaseConfig = {
apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
authDomain: "champions-top8.firebaseapp.com",
databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
projectId: "champions-top8",
storageBucket: "champions-top8.appspot.com",
messagingSenderId: "471933898603",
appId: "1:471933898603:web:7146cb6ea65bd7bf9d062e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= EQUIPOS 2026 =================

const equipos = [
"PSG",
"Chelsea",
"Galatasaray",
"Liverpool",
"Real Madrid",
"Manchester City",
"Atalanta",
"Bayern Múnich",
"Newcastle",
"Barcelona",
"Atlético Madrid",
"Tottenham",
"Bodø/Glimt",
"Sporting CP",
"Bayer Leverkusen",
"Arsenal"
];


// ================= VARIABLES =================

let admin = false;
let participantes = {};
let resultados = [];
let faseActiva = "cuartos";


// ================= CONTROL FASE =================

function limitePorFase(){

if(faseActiva === "cuartos") return 8;
if(faseActiva === "semifinal") return 4;
if(faseActiva === "final") return 2;
if(faseActiva === "campeon") return 1;

return 0;
}


// ================= LOGIN ADMIN =================

function loginAdmin(){

const clave = document.getElementById("claveAdmin").value;

if(clave === "1234"){
admin = true;
document.getElementById("modoAdmin").innerText = "Modo 🔓 Administrador";
renderParticipantes();
}

}


// ================= BORRAR TODO =================

function borrarTodo(){

if(!admin) return;

if(confirm("Eliminar todo?")){
db.ref("participantes").remove();
}

}


// ================= GUARDAR PARTICIPANTE =================

function guardarParticipante(){

const select = document.getElementById("selectorNombre");
const nuevo = document.getElementById("nombreNuevo").value.trim();

let nombre = nuevo || select.value;

if(!nombre) return;

let id = nombre.replace(/\s/g,"_");

if(participantes[id] && participantes[id][faseActiva]){
alert("Esta persona ya registró esta fase");
return;
}

db.ref("participantes/"+id+"/nombre").set(nombre);
db.ref("participantes/"+id+"/fase").set(faseActiva);

alert("Guardado");

}


// ================= ELIMINAR =================

function eliminarParticipante(id){

if(!admin) return;

if(confirm("Eliminar participante?")){
db.ref("participantes/"+id).remove();
}

}


// ================= FASES ADMIN =================

function guardarFases(){

if(!admin) return;

const fases = {
cuartos: document.getElementById("faseCuartos").checked,
semifinal: document.getElementById("faseSemi").checked,
final: document.getElementById("faseFinal").checked,
campeon: document.getElementById("faseCampeon").checked
};

db.ref("config/fases").set(fases);

}


// ================= RESULTADOS =================

function renderResultados(){

const cont = document.getElementById("equiposResultados");
cont.innerHTML = "";

equipos.forEach(eq => {

const div = document.createElement("div");
div.className = "equipoBtn";

if(resultados.includes(eq)){
div.classList.add("activo");
}

div.innerText = eq;

div.onclick = () => {

if(!admin) return;

if(resultados.includes(eq)){
resultados = resultados.filter(e=>e!==eq);
}else{
resultados.push(eq);
}

renderResultados();
};

cont.appendChild(div);

});

}


function guardarResultados(){

if(!admin) return;

db.ref("resultados/"+faseActiva).set(resultados);

alert("Resultados guardados");

}


// ================= RENDER PARTICIPANTES =================

function renderParticipantes(){

const cont = document.getElementById("listaParticipantes");
cont.innerHTML = "";

Object.keys(participantes).forEach(id=>{

const p = participantes[id];

const div = document.createElement("div");
div.className = "participante";

div.innerHTML = `
<b>${p.nombre}</b>
${admin ? `<button class="eliminar" onclick="eliminarParticipante('${id}')">Eliminar</button>` : ""}
`;

cont.appendChild(div);

});

}


// ================= REALTIME =================

db.ref("participantes").on("value", snap=>{

participantes = snap.val() || {};
renderParticipantes();

});


db.ref("config/fases").on("value", snap=>{

const f = snap.val();
if(!f) return;

if(f.cuartos) faseActiva="cuartos";
if(f.semifinal) faseActiva="semifinal";
if(f.final) faseActiva="final";
if(f.campeon) faseActiva="campeon";

});


db.ref("resultados").on("value", snap=>{
renderResultados();
});


// ================= INIT =================

renderResultados();
