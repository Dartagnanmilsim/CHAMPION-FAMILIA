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

const fases = ["cuartos","semifinal","final","campeon"];
const pesos = { cuartos:1, semifinal:2, final:3, campeon:5 };

let adminActivo=false;
let participantes={};
let resultados={};
let config={};

function crearEquipos(containerId){

  const cont=document.getElementById(containerId);
  if(!cont) return;

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
}

crearEquipos("equipos");
fases.forEach(f=>crearEquipos(f));

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

function guardarConfig(){

  config={
    cuartos:document.getElementById("act-cuartos").checked,
    semifinal:document.getElementById("act-semifinal").checked,
    final:document.getElementById("act-final").checked,
    campeon:document.getElementById("act-campeon").checked
  };

  db.ref("configuracion").set(config);
}

function guardarResultados(){

  const data={};

  fases.forEach(f=>{
    const checks=document.querySelectorAll(`#${f} input:checked`);
    data[f]=Array.from(checks).map(c=>c.value);
  });

  db.ref("resultados").set(data);
}

function borrar(id){
  db.ref("participantes/"+id).remove();
}

function borrarTodo(){
  db.ref("participantes").remove();
}

function calcularPuntos(top8){

  let pts=0;

  fases.forEach(f=>{

    if(!config[f]) return;

    const lista=resultados[f]||[];

    lista.forEach(eq=>{
      if(top8.includes(eq)) pts+=pesos[f];
    });

  });

  return pts;
}

db.ref("participantes").on("value",snap=>{
  participantes=snap.val()||{};
  render();
});

db.ref("resultados").on("value",snap=>{
  resultados=snap.val()||{};
  render();
});

db.ref("configuracion").on("value",snap=>{
  config=snap.val()||{};
  render();
});

function render(){

  const lista=document.getElementById("lista");
  const ranking=document.getElementById("ranking");

  lista.innerHTML="";
  ranking.innerHTML="";

  const arr=[];

  Object.keys(participantes).forEach(id=>{

    const p=participantes[id];
    const puntos=calcularPuntos(p.top8);

    arr.push({nombre:p.nombre,puntos});

    let chips="";
    p.top8.forEach(eq=>{
      chips+=`<span class="chip">${eq}</span>`;
    });

    const div=document.createElement("div");
    div.className="participante";

    div.innerHTML=`
      <div><b>${p.nombre}</b></div>
      <div>⭐ ${puntos} puntos</div>
      <div>${chips}</div>
      ${adminActivo?`<button class="btn red" onclick="borrar('${id}')">Eliminar</button>`:""}
    `;

    lista.appendChild(div);

  });

  arr.sort((a,b)=>b.puntos-a.puntos);

  arr.forEach((r,i)=>{
    ranking.innerHTML+=`
      <div>${i+1}. ${r.nombre} — ${r.puntos} pts</div>
    `;
  });

}
