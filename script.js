import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
getDatabase,
ref,
set,
push,
onValue,
remove,
update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
authDomain: "champions-top8.firebaseapp.com",
databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
projectId: "champions-top8",
storageBucket: "champions-top8.firebasestorage.app",
messagingSenderId: "471933898603",
appId: "1:471933898603:web:7146cb6ea65bd7bf9d062e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const ADMIN_PASS = "1234";

let admin = false;
let participanteActual = "";
let seleccionActual = [];

/* ================= EQUIPOS CHAMPIONS 2026 ================= */

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

/* ================= UI EQUIPOS ================= */

const contEquipos = document.getElementById("equiposContainer");

equipos.forEach(eq=>{
const btn=document.createElement("button");
btn.textContent=eq;
btn.className="equipoBtn";

btn.onclick=()=>{
if(seleccionActual.includes(eq)){
seleccionActual=seleccionActual.filter(e=>e!==eq);
btn.classList.remove("equipoActivo");
}else{
seleccionActual.push(eq);
btn.classList.add("equipoActivo");
}
};

contEquipos.appendChild(btn);
});

/* ================= PARTICIPANTE ================= */

const participanteSelect = document.getElementById("participanteSelect");
const nuevoNombre = document.getElementById("nuevoNombre");

document.getElementById("guardarParticipante").onclick=()=>{

let nombre = nuevoNombre.value || participanteSelect.value;

if(!nombre) return alert("Nombre requerido");

participanteActual = nombre;

nuevoNombre.value="";
};

/* ================= GUARDAR EQUIPOS ================= */

document.getElementById("guardarEquipos").onclick=()=>{

if(!participanteActual) return alert("Selecciona participante");

const userRef = ref(db,"participantes/"+participanteActual);

set(userRef,{
equipos: seleccionActual,
puntos:0
});

alert("Guardado");
};

/* ================= ADMIN ================= */

document.getElementById("loginAdmin").onclick=()=>{

const pass=document.getElementById("adminPass").value;

if(pass===ADMIN_PASS){

admin=true;

document.querySelectorAll(".adminOnly").forEach(e=>{
e.style.display="block";
});

document.getElementById("modoAdmin").innerText="Modo 🔓 Admin";

}else{
alert("Clave incorrecta");
}

};

/* ================= BORRAR TODO ================= */

document.getElementById("borrarTodo").onclick=()=>{

if(!admin) return;

remove(ref(db,"participantes"));

};

/* ================= PARTICIPANTES LISTA ================= */

const listaDiv = document.getElementById("listaParticipantes");

onValue(ref(db,"participantes"),snap=>{

listaDiv.innerHTML="";
participanteSelect.innerHTML="<option value=''>Seleccionar</option>";

if(!snap.exists()) return;

snap.forEach(child=>{

const nombre=child.key;
const data=child.val();

participanteSelect.innerHTML+=`<option>${nombre}</option>`;

const div=document.createElement("div");
div.className="card";

div.innerHTML=`
<b>${nombre}</b>
<br>
${data.equipos ? data.equipos.join(", ") : ""}
${admin ? `<button onclick="eliminarUsuario('${nombre}')">Eliminar</button>`:""}
`;

listaDiv.appendChild(div);

});

});

/* ================= ELIMINAR ================= */

window.eliminarUsuario=(nombre)=>{
if(!admin) return;
remove(ref(db,"participantes/"+nombre));
};

/* ================= RANKING ================= */

const rankingDiv=document.getElementById("ranking");

onValue(ref(db,"participantes"),snap=>{

if(!snap.exists()) return;

let arr=[];

snap.forEach(child=>{
arr.push({
nombre:child.key,
puntos:child.val().puntos||0
});
});

arr.sort((a,b)=>b.puntos-a.puntos);

rankingDiv.innerHTML="";

arr.forEach((p,i)=>{
rankingDiv.innerHTML+=`
<div>
${i+1}. ${p.nombre} — ${p.puntos} pts
</div>
`;
});

});
