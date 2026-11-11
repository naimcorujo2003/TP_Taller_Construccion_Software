// Catálogo de actividades: se genera con JavaScript a partir de un arreglo de objetos.

// ---------------------------------------------------------------------------
// Clase Actividad
// ---------------------------------------------------------------------------
class Actividad {
  constructor(nombre, disciplina, dias, horario, edadMinima, edadMaxima, cupoMaximo, cuotaMensual, profesor) {
    this.nombre = nombre;
    this.disciplina = disciplina;
    this.dias = dias;
    this.horario = horario;
    this.edadMinima = edadMinima;
    this.edadMaxima = edadMaxima;
    this.cupoMaximo = cupoMaximo;
    this.cuotaMensual = cuotaMensual;
    this.profesor = profesor;
  }

  // true si una persona de esa edad puede anotarse
  esAptaParaEdad(edad) {
    return edad >= this.edadMinima && edad <= this.edadMaxima;
  }

  // true si la actividad es para chicos (la edad máxima es menor a 18)
  esInfantil() {
    return this.edadMaxima < 18;
  }

  // Devuelve la cuota con formato de pesos argentinos, por ejemplo "$ 18.000"
  cuotaFormateada() {
    return '$ ' + this.cuotaMensual.toLocaleString('es-AR');
  }

  // Arma el <article> de la tarjeta usando el DOM (sin innerHTML)
  crearTarjeta() {
    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta';
    tarjeta.dataset.publico = this.esInfantil() ? 'infantil' : 'general';

    const titulo = document.createElement('h3');
    titulo.textContent = this.nombre;

    const disciplina = document.createElement('span');
    disciplina.className = 'disciplina';
    disciplina.textContent = this.disciplina;

    const datos = document.createElement('ul');
    agregarItem(datos, 'Días y horario: ', this.dias + ' ' + this.horario + ' h');
    agregarItem(datos, 'Edades: ', this.edadMinima + ' a ' + this.edadMaxima + ' años');
    agregarItem(datos, 'Profesor/a: ', this.profesor);
    agregarItem(datos, 'Cupo: ', this.cupoMaximo + ' lugares');

    const precio = document.createElement('p');
    precio.className = 'precio';
    precio.textContent = this.cuotaFormateada() + ' / mes';

    const enlace = document.createElement('a');
    enlace.className = 'boton';
    // Se pasa la actividad por la URL; preinscripcion.js la lee con location.search
    enlace.href = 'preinscripcion.html?actividad=' + encodeURIComponent(this.nombre);
    enlace.textContent = 'Preinscribirme';

    tarjeta.append(titulo, disciplina, datos, precio, enlace);
    return tarjeta;
  }
}

// Agrega un <li> con una etiqueta en negrita y un valor
function agregarItem(lista, etiqueta, valor) {
  const item = document.createElement('li');
  const negrita = document.createElement('strong');
  negrita.textContent = etiqueta;
  item.append(negrita, valor);
  lista.appendChild(item);
}

// ---------------------------------------------------------------------------
// Datos: las 8 actividades del club (sección 3.3 del enunciado)
// ---------------------------------------------------------------------------
const actividades = [
  new Actividad('Fútbol infantil', 'Fútbol', 'Lun y Mié', '18:00', 6, 12, 40, 18000, 'Diego Ferreyra'),
  new Actividad('Vóley mixto', 'Vóley', 'Mar y Jue', '19:00', 13, 60, 24, 20000, 'Laura Ceballos'),
  new Actividad('Básquet juvenil', 'Básquet', 'Lun y Vie', '19:30', 12, 17, 20, 19000, 'Martín Oviedo'),
  new Actividad('Natación', 'Natación', 'Mar y Jue', '17:00', 5, 70, 30, 26000, 'Sofía Bustos'),
  new Actividad('Patín artístico', 'Patín', 'Mié y Vie', '17:30', 5, 15, 25, 21000, 'Carla Peralta'),
  new Actividad('Ajedrez', 'Ajedrez', 'Sáb', '10:00', 8, 99, 16, 9000, 'Raúl Giménez'),
  new Actividad('Funcional adultos', 'Fitness', 'Lun, Mié y Vie', '20:30', 18, 65, 30, 22000, 'Paula Luna'),
  new Actividad('Yoga', 'Bienestar', 'Mar y Jue', '9:00', 16, 99, 15, 17000, 'Inés Arguello'),
];

// ---------------------------------------------------------------------------
// Referencias a elementos del DOM
// ---------------------------------------------------------------------------
const contenedor = document.getElementById('lista-actividades');
const selectDisciplina = document.getElementById('filtro-disciplina');
const inputEdad = document.getElementById('filtro-edad');
const botonLimpiar = document.getElementById('boton-limpiar');
const sinResultados = document.getElementById('sin-resultados');
const contador = document.getElementById('contador');

// Llena el <select> con las disciplinas, sin repetir
function cargarDisciplinas() {
  const disciplinas = [];
  actividades.forEach(function (actividad) {
    if (!disciplinas.includes(actividad.disciplina)) {
      disciplinas.push(actividad.disciplina);
    }
  });

  // localeCompare ordena bien las palabras con tilde (Básquet antes que Bienestar)
  disciplinas.sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (disciplina) {
    const opcion = document.createElement('option');
    opcion.value = disciplina;
    opcion.textContent = disciplina;
    selectDisciplina.appendChild(opcion);
  });
}

// Borra las tarjetas actuales y dibuja las de la lista recibida
function mostrarActividades(lista) {
  contenedor.innerHTML = '';

  lista.forEach(function (actividad) {
    contenedor.appendChild(actividad.crearTarjeta());
  });

  sinResultados.hidden = lista.length > 0;
  contador.textContent = '(' + lista.length + ' de ' + actividades.length + ')';
}

// Lee los filtros, arma la lista filtrada y redibuja
function filtrar() {
  const disciplina = selectDisciplina.value;
  const edad = parseInt(inputEdad.value, 10); // NaN si el campo está vacío

  const filtradas = actividades.filter(function (actividad) {
    const coincideDisciplina = disciplina === '' || actividad.disciplina === disciplina;
    const coincideEdad = isNaN(edad) || actividad.esAptaParaEdad(edad);
    return coincideDisciplina && coincideEdad;
  });

  mostrarActividades(filtradas);
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
selectDisciplina.addEventListener('change', filtrar);
inputEdad.addEventListener('input', filtrar);
botonLimpiar.addEventListener('click', function () {
  selectDisciplina.value = '';
  inputEdad.value = '';
  filtrar();
});

// Primera carga
cargarDisciplinas();
mostrarActividades(actividades);
