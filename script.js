// 🔥 CONFIGURAR FIREBASE
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT.firebaseapp.com",
  databaseURL: "https://PROJECT-default-rtdb.firebaseio.com",
  projectId: "PROJECT",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const equipos = [
  "Real Madrid","Manchester City","Bayern","PSG",
  "Barcelona","Arsenal","Inter","Milan",
  "Atlético","Dortmund","Napoli","Benfica",
  "Porto","Leipzig","Juventus","Chelsea"
];

let adminActivo = false;
let datosGlobal = {}; // guardar participantes en memoria

const contenedor = document.getElementById("equipos");

function renderEquipos() {
  equipos.forEach(nombre => {
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
  });
}

renderEquipos();

function guardar() {
  const nombre = document.getElementById("nombre").value.trim();

  if (!nombre) {
    alert("Ingresa tu nombre");
    return;
  }

  const checks = document.querySelectorAll(".equipo input:checked");

  if (checks.length !== 8) {
    alert("Debes seleccionar 8 equipos");
    return;
  }

  const top8 = Array.from(checks).map(c => c.value);

  db.ref("participantes").push({ nombre, top8 });

  alert("Guardado correctamente");
  location.reload();
}

// 🔥 ESCUCHAR PARTICIPANTES EN TIEMPO REAL
function escuchar() {
  db.ref("participantes").on("value", snap => {

    const data = snap.val();
    datosGlobal = data || {};

    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    if (!data) {
      lista.innerHTML = "<p>No hay participantes aún</p>";
      return;
    }

    Object.keys(data).forEach(id => {
      const p = data[id];

      const div = document.createElement("div");
      div.className = "participante";

      div.innerHTML = `
        <b>${p.nombre}</b>
        <br>
        <button onclick="ver('${id}')">Ver selección</button>
        ${adminActivo ? `<button onclick="borrar('${id}')">Eliminar</button>` : ""}
        <div id="detalle-${id}" style="margin-top:8px;"></div>
      `;

      lista.appendChild(div);
    });
  });
}

escuchar();

// 🔥 VER ELECCIÓN DE PARTICIPANTE
function ver(id) {
  const cont = document.getElementById("detalle-" + id);
  const p = datosGlobal[id];

  if (!p) return;

  cont.innerHTML = `
    <div style="background:#eee;padding:8px;border-radius:8px;">
      ${p.top8.join(" • ")}
    </div>
  `;
}

// 🔐 ADMIN
function activarAdmin() {
  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    adminActivo = true;
    document.getElementById("modo").innerText = "Modo 🔓 Administrador";
    escuchar();
  } else {
    alert("Clave incorrecta");
  }
}

function borrar(id) {
  db.ref("participantes/" + id).remove();
}

function borrarTodo() {
  const pass = document.getElementById("adminPass").value;

  if (pass !== "1234") {
    alert("Clave incorrecta");
    return;
  }

  db.ref("participantes").remove();
}
