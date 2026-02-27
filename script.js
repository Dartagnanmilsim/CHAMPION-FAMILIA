// ================= FIREBASE =================

const firebaseConfig = {
apiKey: "AIzaSyDugdPoh8Hm0U6tcdKgd4AzXd9EWN4b4LY",
authDomain: "champions-top8.firebaseapp.com",
databaseURL: "https://champions-top8-default-rtdb.firebaseio.com",
projectId: "champions-top8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();


// ================= EQUIPOS =================

const equipos = [
"PSG","Chelsea","Galatasaray","Liverpool",
"Real Madrid","Manchester City","Atalanta","Bayern Múnich",
"Newcastle","Barcelona","Atlético","Tottenham",
"Bodø/Glimt","Sporting CP","Leverkusen","Arsenal"
];

const logosEquipos = {
"PSG":"https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg",
"Chelsea":"https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
"Galatasaray":"https://upload.wikimedia.org/wikipedia/en/5/5c/Galatasaray_Sports_Club_Logo.svg",
"Liverpool":"https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
"Real Madrid":"https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
"Manchester City":"https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
"Atalanta":"https://upload.wikimedia.org/wikipedia/en/6/66/AtalantaBC.svg",
"Bayern Múnich":"https://upload.wikimedia.org/wikipedia/en/1/1f/FC_Bayern_München_logo.svg",
"Newcastle":"https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg",
"Barcelona":"https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
"Atlético":"https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg",
"Tottenham":"https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",
"Bodø/Glimt":"https://upload.wikimedia.org/wikipedia/en/9/9e/FK_Bodø_Glimt_logo.svg",
"Sporting CP":"https://upload.wikimedia.org/wikipedia/en/e/e1/Sporting_Clube_de_Portugal_%28Logo%29.svg",
"Leverkusen":"https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg",
"Arsenal":"https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
};


// ================= CONFIG =================

const limites = {
cuartos:8,
semifinal:4,
final:2,
campeon:1
};

const puntosFase = {
cuartos:1,
semifinal:2,
final:3,
campeon:5
};

let admin=false;
let config={};
let resultados={};
let participantes={};


// ================= ADMIN =================

function loginAdmin(){

const pass=document.getElementById("adminPass").value;

if(pass==="1234"){

admin=true;

document.getElementById("modo").innerText="Modo 🔓 Administrador";
document.getElementById("adminFases").style.display="block";
document.getElementById("adminResultados").style.display="block";

renderResultadosAdmin();
renderLista();

}else{

alert("Clave incorrecta");

}

}


// ================= ELIMINAR CORREGIDO =================

function eliminarParticipante(id){

if(!admin){
alert("Solo administrador");
return;
}

if(!confirm("¿Eliminar participante?")) return;

db.ref("participantes/"+id).remove()
.then(()=>console.log("Eliminado"))
.catch(err=>alert("Error: "+err));

}


// ================= RESTO DEL CÓDIGO =================
// (idéntico a familia V3 original — sin cambios)
// Para no duplicar 1000 líneas aquí, todo lo demás permanece igual.
// Solo asegúrate que renderLista tenga el botón:

/*
<button class="eliminar" onclick="eliminarParticipante('${id}')">
Eliminar
</button>
*/
