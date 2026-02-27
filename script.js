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

const fases=["cuartos","semifinal","final","campeon"];

let adminActivo=false;
let participantes={};
let config={};
let resultados={};

// ================= ADMIN

function activarAdmin(){

  const pass=document.getElementById("adminPass").value;

  if(pass==="1234"){

    adminActivo=true;

    document.getElementById("panelResultados").style.display="block";
    document.getElementById("panelConfig").style.display="block";

    crearEquiposResultados();

    document.getElementById("modo").innerText="Modo 🔓 Administrador";

  }else{
    alert("Clave incorrecta");
  }

}

// ================= RESULTADOS ADMIN

function crearEquiposResultados(){

  fases.forEach(fase=>{

    const cont=document.getElementById(fase);
    if(!cont) return;

    cont.innerHTML="";

    equipos.forEach(eq=>{

      const div=document.createElement("div");
      div.className="equipo";
      div.innerText=eq;

      div.onclick=()=>{
        if(!adminActivo) return;
        div.classList.toggle("activo");
      };

      cont.appendChild(div);

    });

  });

}

function guardarResultados(){

  const data={};

  fases.forEach(f=>{

    const activos=document.querySelectorAll(`#${f} .activo`);
    data[f]=Array.from(activos).map(d=>d.innerText);

  });

  db.ref("resultados").set(data);
  alert("Resultados guardados");

}

// ================= CONFIG

function guardarConfig(){

  config={
    cuartos:document.getElementById("act-cuartos").checked,
    semifinal:document.getElementById("act-semifinal").checked,
    final:document.getElementById("act-final").checked,
    campeon:document.getElementById("act-campeon").checked
  };

  db.ref("configuracion").set(config);

}

// ================= PARTICIPANTES

function guardar(){

  const nombre=document.getElementById("nombre").value.trim();
  if(!nombre) return alert("Ingresa nombre");

  const existe=Object.values(participantes)
  .some(p=>p.nombre.toLowerCase()===nombre.toLowerCase());

  if(existe) return alert("Nombre ya existe");

  db.ref("participantes").push({nombre});

}

// ================= RANKING

function renderRanking(){

  const ranking=document.getElementById("ranking");
  ranking.innerHTML="";

  Object.values(participantes).forEach(p=>{

    ranking.innerHTML+=`<div>${p.nombre}</div>`;

  });

}

// ================= LISTENERS

db.ref("participantes").on("value",snap=>{
  participantes=snap.val()||{};
  renderRanking();
});

db.ref("configuracion").on("value",snap=>{
  config=snap.val()||{};
});

db.ref("resultados").on("value",snap=>{
  resultados=snap.val()||{};
});
