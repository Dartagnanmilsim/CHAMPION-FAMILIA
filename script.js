// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
  authDomain: "champions-top8.firebaseapp.com",
  databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
  projectId: "champions-top8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EQUIPOS
const equiposData = [
  { nombre:"Real Madrid", logo:"https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"},
  { nombre:"Manchester City", logo:"https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg"},
  { nombre:"Bayern", logo:"https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo.svg"},
  { nombre:"PSG", logo:"https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg"},
  { nombre:"Barcelona", logo:"https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"},
  { nombre:"Arsenal", logo:"https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"},
  { nombre:"Inter", logo:"https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg"},
  { nombre:"Milan", logo:"https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg"},
  { nombre:"Atlético", logo:"https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg"},
  { nombre:"Dortmund", logo:"https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"},
  { nombre:"Napoli", logo:"https://upload.wikimedia.org/wikipedia/commons/2/2d/SSC_Napoli.svg"},
  { nombre:"Benfica", logo:"https://upload.wikimedia.org/wikipedia/en/a/a2/SL_Benfica_logo.svg"},
  { nombre:"Porto", logo:"https://upload.wikimedia.org/wikipedia/en/f/f1/FC_Porto.svg"},
  { nombre:"Leipzig", logo:"https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg"},
  { nombre:"Juventus", logo:"https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg"},
  { nombre:"Chelsea", logo:"https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg"},
];

const fases = ["cuartos","semifinal","final","campeon"];
const pesos = { cuartos:1, semifinal:2, final:3, campeon:5 };

let adminActivo=false;
let participantes={};
let resultados={};
let config={};

// CREAR UI EQUIPO
function crearEquipoUI(contenedor,equipo){
  const div=document.createElement("div");
  div.className="equipo";
  div.innerHTML=`<input type="checkbox" value="${equipo.nombre}">
  <img class="logo" src="${equipo.logo}">${equipo.nombre}`;
  div.onclick=()=>{
    const c=div.querySelector("input");
    c.checked=!c.checked;
    div.classList.toggle("activo");
  };
  contenedor.appendChild(div);
}

// PARTICIPANTE
const contEquipos=document.getElementById("equipos");
equiposData.forEach(e=>crearEquipoUI(contEquipos,e));

// RESULTADOS
fases.forEach(f=>{
  const cont=document.getElementById(f);
  equiposData.forEach(e=>crearEquipoUI(cont,e));
});

// GUARDAR PARTICIPANTE
function guardar(){

  const nombre=document.getElementById("nombre").value.trim();
  if(!nombre) return alert("Ingresa nombre");

  const existe=Object.values(participantes)
    .some(p=>p.nombre.toLowerCase()===nombre.toLowerCase());

  if(existe) return alert("Nombre ya registrado");

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
  }
}

// CONFIG
function guardarConfig(){

  config={
    cuartos:document.getElementById("act-cuartos").checked,
    semifinal:document.getElementById("act-semifinal").checked,
    final:document.getElementById("act-final").checked,
    campeon:document.getElementById("act-campeon").checked
  };

  db.ref("configuracion").set(config);
}

// RESULTADOS
function guardarResultados(){

  const data={};

  fases.forEach(f=>{
    const checks=document.querySelectorAll(`#${f} input:checked`);
    data[f]=Array.from(checks).map(c=>c.value);
  });

  db.ref("resultados").set(data);
}

// BORRAR
function borrar(id){
  db.ref("participantes/"+id).remove();
}

function borrarTodo(){
  db.ref("participantes").remove();
}

// CALCULAR PUNTOS
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

// LISTENERS
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

// RENDER
function render(){

  const lista=document.getElementById("lista");
  const rankingDiv=document.getElementById("ranking");

  lista.innerHTML="";
  rankingDiv.innerHTML="";

  const arr=[];

  Object.keys(participantes).forEach(id=>{

    const p=participantes[id];
    const puntos=calcularPuntos(p.top8);

    arr.push({nombre:p.nombre,puntos});

    let chips="";
    p.top8.forEach(eq=>{
      const logo=equiposData.find(e=>e.nombre===eq)?.logo;
      chips+=`<span class="chip"><img class="logo" src="${logo}">${eq}</span>`;
    });

    const div=document.createElement("div");
    div.className="participante";

    div.innerHTML=`
      <div class="nombre">${p.nombre}</div>
      <div class="puntos">⭐ ${puntos} puntos</div>
      <div class="chips">${chips}</div>
      ${adminActivo?`<button onclick="borrar('${id}')">Eliminar</button>`:""}
    `;

    lista.appendChild(div);

  });

  // RANKING
  arr.sort((a,b)=>b.puntos-a.puntos);

  arr.forEach((r,i)=>{
    rankingDiv.innerHTML+=`
      <div class="ranking-item">
        ${i+1}. ${r.nombre} — ${r.puntos} pts
      </div>
    `;
  });

}
