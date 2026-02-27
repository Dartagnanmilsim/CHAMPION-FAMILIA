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
    alert("Debes seleccionar exactamente 8 equipos");
    return;
  }

  const top8 = Array.from(checks).map(c => c.value);

  db.ref("participantes").push({
    nombre,
    top8
  });

  alert("Guardado correctamente");
  location.reload();
}

function escuchar() {
  db.ref("participantes").on("value", snap => {

    const data = snap.val();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    if (!data) return;

    Object.keys(data).forEach(id => {

      const p = data[id];

      const div = document.createElement("div");
      div.className = "card";

      div.innerHTML = `
        <b>${p.nombre}</b><br>
        ${p.top8.join(" • ")}
        ${adminActivo ? `<br><button onclick="borrar('${id}')">Eliminar</button>` : ""}
      `;

      lista.appendChild(div);
    });
  });
}

escuchar();

function activarAdmin() {
  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    adminActivo = true;
    alert("Modo administrador activado");
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
