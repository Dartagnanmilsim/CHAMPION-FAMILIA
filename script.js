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

let adminActivo=false;
let config={};
let participantes={};
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


// ================= PANEL PARTICIPANTE

function renderPanelParticipante(){

  const panel=document.getElementById("panelFasesParticipante");
  panel.innerHTML="";

  fases.forEach(f=>{

    if(!config[f]) return;

    panel.innerHTML+=`
      <h3>${f.toUpperCase()} (elige ${limites[f]})</h3>
      <div id="pick-${f}" class="equipos-grid"></div>
    `;

    const cont=document.getElementById(`pick-${f}`);

    equipos.forEach(eq=>{

      const div=document.createElement("div");
      div.className="equipo";
      div.innerText=eq;

      div.onclick=()=>{

        const activos=cont.querySelectorAll(".activo");

        if(!div.classList.contains("activo") && activos.length>=limites[f])
          return;

        div.classList.toggle("activo");

      };

      cont.appendChild(div);

    });

  });

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


// ================= GUARDAR PARTICIPANTE

function guardar(){

  const nombre=document.getElementById("nombre").value;

  if(!nombre) return alert("Nombre");

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

db.ref("configuracion").on("value",snap=>{
  config=snap.val()||{};
  renderPanelParticipante();
});

db.ref("participantes").on("value",snap=>{
  participantes=snap.val()||{};
  renderRanking();
});

db.ref("resultados").on("value",snap=>{
  resultados=snap.val()||{};
});
