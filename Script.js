// ⚠️ CONFIGURA TU FIREBASE AQUÍ
const firebaseConfig = {
  apiKey: "API_KEY",
  authDomain: "PROJECT.firebaseapp.com",
  databaseURL: "https://PROJECT-default-rtdb.firebaseio.com",
  projectId: "PROJECT",
  storageBucket: "PROJECT.appspot.com",
  messagingSenderId: "ID",
  appId: "APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const equipos = [
  "Real Madrid","Barcelona","Manchester City","PSG",
  "Bayern","Arsenal","Inter","Milan",
  "Atlético","Dortmund","Napoli","Benfica",
  "Porto","RB Leipzig","Juventus","Chelsea"
];

const equiposDiv = document.getElementById("equipos");

// Render equipos
function renderEquipos() {
  equipos.forEach(e => {
    const label = document.createElement("label");
    label.className = "equipo";
    label.innerHTML = `<input type="checkbox" value="${e}"> ${e}`;
    equiposDiv.appendChild(label);
  });
}

renderEquipos();

// Guardar participante
function guardar() {
  const nombre = document.getElementById("nombre").value;
  const checks = document.querySelectorAll("input[type=checkbox]:checked");

  if (checks.length !== 8) {
    alert("Debes seleccionar exactamente 8 equipos");
    return;
  }

  const top8 = Array.from(checks).map(c => c.value);

  db.ref("participantes").push({
    nombre,
    top8
  });

  alert("Guardado");
}

// Escuchar cambios en tiempo real
function escuchar() {
  db.ref("participantes").on("value", snapshot => {
    const data = snapshot.val();
    const lista = document.getElementById("lista");
    lista.innerHTML = "";

    for (let id in data) {
      const p = data[id];

      const div = document.createElement("div");
      div.innerHTML = `
        <b>${p.nombre}</b><br>
        ${p.top8.join(", ")}
        <br>
        <button onclick="borrar('${id}')">Borrar</button>
        <hr>
      `;

      lista.appendChild(div);
    }
  });
}

escuchar();

// Borrar (admin)
function borrar(id) {
  const pass = document.getElementById("adminPass").value;

  if (pass !== "admin123") {
    alert("Clave incorrecta");
    return;
  }

  db.ref("participantes/" + id).remove();
}
