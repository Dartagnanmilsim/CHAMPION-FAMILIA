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

const limites = {
  cuartos:8,
  semifinal:4,
  final:2,
  campeon:1
};

const fases = Object.keys(limites);
const pesos = { cuartos:1, semifinal:2, final:3, campeon:5 };

let config = {};
let resultados = {};
let participantes = {};
let adminActivo=false;

// UI PARTICIPANTE POR FASE
function renderPanelParticipante(){

  const panel=document.getElementById("panelFasesParticipante");
  panel.innerHTML="";

  fases.forEach(f=>{

    if(!config[f]) return;

    panel.innerHTML+=`<h3>${f.toUpperCase()} (elige ${limites[f]})</h3>
    <div id="pick-${f}" class="equipos-grid"></div>`;

    const cont=document.getElementById(`pick-${f}`);

    equipos.forEach(eq=>{

      const div=document.createElement("div");
      div.className="equipo";
      div.innerText=eq;

      div.onclick=()=>{

        const activos=cont.querySelectorAll(".activo");

        if(!div.classList.contains("activo") && activos.length>=limites[f]) return;

        div.classList.toggle("activo");

      };

      cont.appendChild(div);

    });

  });

}

// GUARDAR PARTICIPANTE
function guardar(){

  const nombre=document.getElementById("nombre").value.trim();
  if(!nombre) return alert("Nombre");

  const existe=Object.values(participantes)
  .some(p=>p.nombre.toLowerCase()===nombre.toLowerCase());

  if(existe) return alert("Nombre ya existe");

  const picks={};

  fases.forEach(f=>{

    const cont=document.getElementById(`pick-${f}`);
    if(!cont) return;

    const activos=cont.querySelectorAll(".activo");
    picks[f]=Array.from(activos).map(d=>d.innerText);

  });

  db.ref("participantes").push({nombre,picks});
}

// ADMIN
function activarAdmin(){

  if(document.getElementById("adminPass").value==="1234"){

    adminActivo=true;

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

    const checks=document.querySelectorAll(`#${f} .activo`);
    data[f]=Array.from(checks).map(d=>d.innerText);

  });

  db.ref("resultados").set(data);
}

// PUNTOS
function calcular(picks){

  let pts=0;

  fases.forEach(f=>{

    if(!config[f]) return;

    const res=resultados[f]||[];
    const sel=picks[f]||[];

    sel.forEach(eq=>{
      if(res.includes(eq)) pts+=pesos[f];
    });

  });

  return pts;
}

// LISTENERS
db.ref("configuracion").on("value",s=>{
  config=s.val()||{};
  renderPanelParticipante();
});

db.ref("resultados").on("value",s=>{
  resultados=s.val()||{};
});

db.ref("participantes").on("value",s=>{
  participantes=s.val()||{};
  renderRanking();
});

// RANKING
function renderRanking(){

  const ranking=document.getElementById("ranking");
  ranking.innerHTML="";

  const arr=[];

  Object.values(participantes).forEach(p=>{
    arr.push({
      nombre:p.nombre,
      puntos:calcular(p.picks||{})
    });
  });

  arr.sort((a,b)=>b.puntos-a.puntos);

  arr.forEach((r,i)=>{
    ranking.innerHTML+=`<div>${i+1}. ${r.nombre} — ${r.puntos} pts</div>`;
  });

}
