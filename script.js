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

let seleccion = [];
let admin = false;
let participantes = {};


// ================= RENDER EQUIPOS =================

const contEquipos = document.getElementById("equiposContainer");

equipos.forEach(eq=>{

const div=document.createElement("div");
div.className="equipo";
div.innerText=eq;

div.onclick=()=>{

if(seleccion.includes(eq)){
seleccion=seleccion.filter(e=>e!==eq);
div.classList.remove("activo");
}else{
seleccion.push(eq);
div.classList.add("activo");
}

};

contEquipos.appendChild(div);

});


// ================= GUARDAR =================

function guardar(){

const nombre=document.getElementById("nombre").value.trim();

if(!nombre){
alert("Nombre requerido");
return;
}

if(seleccion.length===0){
alert("Selecciona equipos");
return;
}

const id=nombre.replace(/\s/g,"_");

db.ref("participantes/"+id).set({
nombre,
seleccion
});

alert("Guardado");

}


// ================= LOGIN =================

function login(){

const clave=document.getElementById("clave").value;

if(clave==="1234"){
admin=true;
document.getElementById("modo").innerText="Modo 🔓 Administrador";
render();
}

}


// ================= BORRAR TODO =================

function borrarTodo(){

if(!admin) return;

if(confirm("Eliminar todo?")){
db.ref("participantes").remove();
}

}


// ================= ELIMINAR =================

function eliminar(id){

if(!admin) return;

db.ref("participantes/"+id).remove();

}


// ================= RENDER PARTICIPANTES =================

function render(){

const lista=document.getElementById("lista");
lista.innerHTML="";

Object.keys(participantes).forEach(id=>{

const p=participantes[id];

const div=document.createElement("div");
div.className="participante";

div.innerHTML=`
<b>${p.nombre}</b>
${admin?`<button class="eliminar" onclick="eliminar('${id}')">Eliminar</button>`:""}
<br>
${p.seleccion.join(" • ")}
`;

lista.appendChild(div);

});

}


// ================= REALTIME =================

db.ref("participantes").on("value",snap=>{

participantes=snap.val()||{};
render();

});
