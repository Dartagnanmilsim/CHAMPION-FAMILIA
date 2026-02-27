// 🔥 FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
  authDomain: "champions-top8.firebaseapp.com",
  databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
  projectId: "champions-top8",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// EQUIPOS
const equipos = [
  "Real Madrid","Manchester City","Bayern","PSG",
  "Barcelona","Arsenal","Inter","Milan",
  "Atlético","Dortmund","Napoli","Benfica",
  "Porto","Leipzig","Juventus","Chelsea"
];

const fases = ["cuartos","semifinal","final","campeon"];

let adminActivo = false;
let datosGlobal = {};
let resultadosGlobal = {};

// ================= CREAR EQUIPOS UI =================

function crearEquipoUI(contenedor, nombre) {

  const div = document.createElement("div");
  div.className = "equipo";

  div.innerHTML = `
    <input type="checkbox" value="${nombre}">
    ${nombre}
  `;

  div.onclick = () => {
    const check = div.querySelector("input");
    check.checked = !check.checked;
    div.classList.toggle("activo");
  };

  contenedor.appendChild(div);
}

// PARTICIPANTE UI
const contenedorEquipos = document.getElementById("equipos");
equipos.forEach(eq => crearEquipoUI(contenedorEquipos, eq));

// RESULTADOS UI
fases.forEach(f => {
  const cont = document.getElementById(f);
  equipos.forEach(eq => crearEquipoUI(cont, eq));
});

// ================= GUARDAR PARTICIPANTE =================

function guardar() {

  const nombre = document.getElementById("nombre").value.trim();

  if (!nombre) return alert("Ingresa tu nombre");

  const checks = document.querySelectorAll("#equipos input:checked");

  if (checks.length !== 8)
    return alert("Selecciona exactamente 8 equipos");

  const top8 = Array.from(checks).map(c => c.value);

  db.ref("participantes").push({ nombre, top8 });

  alert("Guardado");
}

// ================= ADMIN =================

function activarAdmin() {

  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {

    adminActivo = true;

    document.getElementById("modo").innerText =
      "Modo 🔓 Administrador";

    document.getElementById("panelResultados").style.display =
      "block";

    renderLista();

  } else {
    alert("Clave incorrecta");
  }
}

// ================= RESULTADOS =================

function guardarResultados() {

  const data = {};

  fases.forEach(f => {

    const checks = document.querySelectorAll(`#${f} input:checked`);

    data[f] = Array.from(checks).map(c => c.value);

  });

  db.ref("resultados").set(data);

  alert("Resultados guardados");
}

// ================= ELIMINAR =================

function borrar(id) {

  if (!confirm("¿Eliminar participante?")) return;

  db.ref("participantes/" + id).remove();
}

function borrarTodo() {

  const pass = document.getElementById("adminPass").value;

  if (pass !== "1234") return alert("Clave incorrecta");

  if (!confirm("¿Borrar todos los registros?")) return;

  db.ref("participantes").remove();
}

// ================= PUNTOS =================

function calcularPuntos(top8) {

  let puntos = 0;

  Object.values(resultadosGlobal).forEach(fase => {

    if (!fase) return;

    fase.forEach(eq => {
      if (top8.includes(eq)) puntos++;
    });

  });

  return puntos;
}

// ================= LISTENERS =================

db.ref("participantes").on("value", snap => {

  datosGlobal = snap.val() || {};
  renderLista();

});

db.ref("resultados").on("value", snap => {

  resultadosGlobal = snap.val() || {};
  renderLista();

});

// ================= RENDER =================

function renderLista() {

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  Object.keys(datosGlobal).forEach(id => {

    const p = datosGlobal[id];
    const puntos = calcularPuntos(p.top8);

    const div = document.createElement("div");
    div.className = "participante";

    let chips = "";

    p.top8.forEach(eq => {
      chips += `<span class="chip">${eq}</span>`;
    });

    div.innerHTML = `
      <div class="nombre">${p.nombre}</div>
      <div class="puntos">⭐ ${puntos} puntos</div>
      <div class="chips">${chips}</div>
      ${adminActivo ? `<button class="btn-mini btn-eliminar" onclick="borrar('${id}')">Eliminar</button>` : ""}
    `;

    lista.appendChild(div);

  });
}
