const firebaseConfig = {
  apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
  authDomain: "champions-top8.firebaseapp.com",
  databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
  projectId: "champions-top8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const equipos = [
"Real Madrid","Manchester City","Bayern","PSG","Barcelona","Arsenal",
"Inter","Milan","Atlético","Dortmund","Napoli","Benfica",
"Porto","Leipzig","Juventus","Chelsea"
];

let adminActivo=false;
let participantes={};

// CREAR EQUIPOS
const cont=document.getElementById("equipos");

equipos.forEach(eq=>{
  const div=document.createElement("div");
  div.className="equipo";
  div.innerHTML=`<input type="checkbox" value="${eq}">${eq}`;
  div.onclick=()=>{
    const c=div.querySelector("input");
    c.checked=!c.checked;
    div.classList.toggle("activo");
  };
  cont.appendChild(div);
});

// GUARDAR
function guardar(){

  const nombre=document.getElementById("nombre").value.trim();
  if(!nombre) return alert("Ingresa nombre");

  const existe=Object.values(participantes)
  .some(p=>p.nombre.toLowerCase()===nombre.toLowerCase());

  if(existe) return alert("Nombre ya existe");

  const checks=document.querySelectorAll("#equipos input:checked");
  if(checks.length!==8) return alert("Selecciona 8 equipos");

  const top8=Array.from(checks).map(c=>c.value);

  db.ref("participantes").push({nombre,top8});
}

// ADMIN
function activarAdmin(){

  const pass=document.getElementById("adminPass").value;

  if(pass==="1234"){
    adminActivo=true;

    document.getElementById("modo").innerText="Modo 🔓 Admin";
    document.getElementById("panelResultados").style.display="block";
    document.getElementById("panelConfig").style.display="block";

    render();
  }
}

// BORRAR
function borrar(id){
  db.ref("participantes/"+id).remove();
}

function borrarTodo(){
  db.ref("participantes").remove();
}

// LISTENER
db.ref("participantes").on("value",snap=>{
  participantes=snap.val()||{};
  render();
});

// RENDER
function render(){

  const lista=document.getElementById("lista");
  lista.innerHTML="";

  Object.keys(participantes).forEach(id=>{

    const p=participantes[id];

    let chips="";
    p.top8.forEach(eq=>{
      chips+=`<span class="chip">${eq}</span>`;
    });

    const div=document.createElement("div");
    div.className="participante";

    div.innerHTML=`
      <div class="nombre">${p.nombre}</div>
      <div class="chips">${chips}</div>
      ${adminActivo ? `<button class="btn red" onclick="borrar('${id}')">Eliminar</button>` : ``}
    `;

    lista.appendChild(div);

  });

}
