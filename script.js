import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  remove,
  onValue,
  get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
  authDomain: "champions-top8.firebaseapp.com",
  databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
  projectId: "champions-top8",
  storageBucket: "champions-top8.appspot.com",
  messagingSenderId: "471933898603",
  appId: "1:471933898603:web:7146cb6ea65bd7bf9d062e"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let admin = false;

let faseActual = "cuartos";

const limiteFase = {
  cuartos: 8,
  semifinal: 4,
  final: 2,
  campeon: 1
};

const equipos = [
  "Real Madrid","Manchester City","Bayern","PSG",
  "Barcelona","Arsenal","Inter","Milan",
  "Atlético","Dortmund","Napoli","Benfica",
  "Porto","Leipzig","Juventus","Chelsea"
];

let seleccion = [];

const equiposContainer = document.getElementById("equiposContainer");
const participantesDiv = document.getElementById("participantes");


// =====================
// RENDER EQUIPOS
// =====================

function renderEquipos() {

  equiposContainer.innerHTML = "";

  equipos.forEach(eq => {

    const btn = document.createElement("button");
    btn.textContent = eq;

    btn.onclick = () => {

      const max = limiteFase[faseActual];

      if (seleccion.includes(eq)) {

        seleccion = seleccion.filter(e => e !== eq);
        btn.classList.remove("activo");
        return;
      }

      if (seleccion.length >= max) {
        alert("Solo puedes elegir " + max + " equipos");
        return;
      }

      seleccion.push(eq);
      btn.classList.add("activo");
    };

    equiposContainer.appendChild(btn);
  });
}

renderEquipos();



// =====================
// GUARDAR SELECCIÓN
// =====================

window.guardarSeleccion = async function () {

  const nombre = document.getElementById("nombre").value.trim();

  if (!nombre) {
    alert("Ingresa nombre");
    return;
  }

  const max = limiteFase[faseActual];

  if (seleccion.length !== max) {
    alert("Debes elegir " + max + " equipos");
    return;
  }

  const participantesRef = ref(db, "participantes");

  const snapshot = await get(participantesRef);

  let existenteId = null;

  if (snapshot.exists()) {

    const data = snapshot.val();

    Object.keys(data).forEach(id => {

      if (data[id].nombre.toLowerCase() === nombre.toLowerCase()) {
        existenteId = id;
      }

    });
  }

  let participanteId;

  if (existenteId) {

    participanteId = existenteId;

  } else {

    const nuevo = push(participantesRef);
    participanteId = nuevo.key;

    await set(ref(db, "participantes/" + participanteId), {
      nombre,
      picks: {}
    });
  }

  await set(
    ref(db, `participantes/${participanteId}/picks/${faseActual}`),
    seleccion
  );

  alert("Guardado");

  seleccion = [];
  renderEquipos();
};



// =====================
// ADMIN LOGIN
// =====================

window.loginAdmin = function () {

  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    admin = true;
    document.getElementById("modo").innerText = "Modo 🔓 Administrador";
    alert("Admin activado");
  } else {
    alert("Clave incorrecta");
  }
};



// =====================
// ELIMINAR PARTICIPANTE
// =====================

window.eliminarParticipante = async function (id) {

  if (!admin) {
    alert("Solo admin");
    return;
  }

  if (!confirm("Eliminar participante?")) return;

  await remove(ref(db, "participantes/" + id));
};




// =====================
// MOSTRAR PARTICIPANTES
// =====================

const participantesRef = ref(db, "participantes");

onValue(participantesRef, snapshot => {

  participantesDiv.innerHTML = "";

  if (!snapshot.exists()) return;

  const data = snapshot.val();

  Object.keys(data).forEach(id => {

    const p = data[id];

    let picksHTML = "";

    if (p.picks) {

      Object.keys(p.picks).forEach(fase => {

        picksHTML += `
          <div>
            <b>${fase.toUpperCase()}</b>: 
            ${p.picks[fase].join(" • ")}
          </div>
        `;
      });
    }

    const div = document.createElement("div");

    div.className = "participante";

    div.innerHTML = `
      <strong>${p.nombre}</strong>
      ${admin ? `<br><button onclick="eliminarParticipante('${id}')">Eliminar</button>` : ""}
      <div>${picksHTML}</div>
    `;

    participantesDiv.appendChild(div);

  });

});
