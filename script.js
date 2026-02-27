// 🔥 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
  authDomain: "champions-top8.firebaseapp.com",
  databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
  projectId: "champions-top8",
  storageBucket: "champions-top8.firebasestorage.app",
  messagingSenderId: "471933898603",
  appId: "1:471933898603:web:7146cb6ea65bd7bf9d062e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

console.log("Firebase conectado");

// EQUIPOS
const equipos = [
  "Real Madrid","Manchester City","Bayern","PSG",
  "Barcelona","Arsenal","Inter","Milan",
  "Atlético","Dortmund","Napoli","Benfica",
  "Porto","Leipzig","Juventus","Chelsea"
];

let adminActivo = false;
let datosGlobal = {};

const contenedor = document.getElementById("equipos");

// CREAR EQUIPOS
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

// GUARDAR
function guardar() {

  const nombre = document.getElementById("nombre").value.trim();

  if (!nombre) {
    alert("Ingresa tu nombre");
    return;
  }

  const checks = document.querySelectorAll(".equipo input:checked");

  if (checks.length !== 8) {
    alert("Selecciona exactamente 8 equipos");
    return;
  }

  const top8 = Array.from(checks).map(c => c.value);

  db.ref("participantes").push({
    nombre,
    top8
  });

  alert("Guardado correctamente");

}

// ESCUCHAR PARTICIPANTES
db.ref("participantes").on("value", snap => {

  const data = snap.val();
  datosGlobal = data || {};

  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  if (!data) {
    lista.innerHTML = "<p>No hay participantes</p>";
    return;
  }

  Object.keys(data).forEach(id => {

    const p = data[id];

    const div = document.createElement("div");
    div.className = "participante";

    div.innerHTML = `
      <b>${p.nombre}</b><br>
      <button onclick="ver('${id}')">Ver selección</button>
      ${adminActivo ? `<button onclick="borrar('${id}')">Eliminar</button>` : ""}
      <div id="detalle-${id}"></div>
    `;

    lista.appendChild(div);

  });

});

// VER ELECCIÓN
function ver(id) {

  const cont = document.getElementById("detalle-" + id);
  const p = datosGlobal[id];

  cont.innerHTML = `
    <div style="background:#eee;padding:10px;border-radius:10px;margin-top:5px;">
      ${p.top8.join(" • ")}
    </div>
  `;
}

// ADMIN
function activarAdmin() {

  const pass = document.getElementById("adminPass").value;

  if (pass === "1234") {
    adminActivo = true;
    document.getElementById("modo").innerText = "Modo 🔓 Administrador";
    alert("Admin activado");
  } else {
    alert("Clave incorrecta");
  }

}

// BORRAR UNO
function borrar(id) {
  db.ref("participantes/" + id).remove();
}

// BORRAR TODO
function borrarTodo() {

  const pass = document.getElementById("adminPass").value;

  if (pass !== "1234") {
    alert("Clave incorrecta");
    return;
  }

  db.ref("participantes").remove();

}
