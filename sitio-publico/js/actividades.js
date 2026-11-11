// Catálogo de actividades: se genera con JavaScript a partir de un arreglo de objetos.

// ---------------------------------------------------------------------------
// Íconos SVG (líneas simples). Cada ícono es una lista de [etiqueta, atributos].
// ---------------------------------------------------------------------------
const ICONOS = {
  reloj: [['circle', { cx: 12, cy: 12, r: 10 }], ['path', { d: 'M12 6v6l4 2' }]],
  personas: [
    ['path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }],
    ['circle', { cx: 9, cy: 7, r: 4 }],
    ['path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' }],
  ],
  persona: [['path', { d: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' }], ['circle', { cx: 12, cy: 7, r: 4 }]],
  flecha: [['path', { d: 'M5 12h14M12 5l7 7-7 7' }]],
};

// Crea un <svg> con document.createElementNS (los SVG necesitan su propio "namespace")
function crearIcono(nombre, tamanio) {
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('width', tamanio);
  svg.setAttribute('height', tamanio);
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');

  ICONOS[nombre].forEach(function (forma) {
    const elemento = document.createElementNS(ns, forma[0]);
    Object.keys(forma[1]).forEach(function (atributo) {
      elemento.setAttribute(atributo, forma[1][atributo]);
    });
    svg.appendChild(elemento);
  });
  return svg;
}

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

    const etiqueta = document.createElement('span');
    etiqueta.className = 'etiqueta';
    etiqueta.textContent = this.disciplina;

    const titulo = document.createElement('h3');
    titulo.textContent = this.nombre;

    const datos = document.createElement('ul');
    datos.className = 'tarjeta__datos';
    agregarDato(datos, 'reloj', this.dias + ' · ' + this.horario);
    agregarDato(datos, 'personas', this.edadMinima + ' a ' + this.edadMaxima + ' años');
    agregarDato(datos, 'persona', 'Prof. ' + this.profesor);

    // Precio grande + "/mes" a la izquierda y el cupo a la derecha
    const filaPrecio = document.createElement('div');
    filaPrecio.className = 'tarjeta__precio';
    const precio = document.createElement('p');
    precio.className = 'precio';
    const porMes = document.createElement('small');
    porMes.textContent = '/mes';
    precio.append(this.cuotaFormateada(), porMes);
    const lugares = document.createElement('span');
    lugares.className = 'lugares';
    lugares.textContent = this.cupoMaximo + ' lugares';
    filaPrecio.append(precio, lugares);

    const enlace = document.createElement('a');
    enlace.className = 'boton boton--ancho';
    // Se pasa la actividad por la URL; preinscripcion.js la lee con location.search
    enlace.href = 'preinscripcion.html?actividad=' + encodeURIComponent(this.nombre);
    enlace.append('Preinscribirme', crearIcono('flecha', 16));

    tarjeta.append(etiqueta, titulo, datos, filaPrecio, enlace);
    return tarjeta;
  }
}

// Agrega un <li> con un ícono y un texto
function agregarDato(lista, icono, texto) {
  const item = document.createElement('li');
  item.append(crearIcono(icono, 15), texto);
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
// Referencias a elementos del DOM y estado del filtro
// ---------------------------------------------------------------------------
const contenedor = document.getElementById('lista-actividades');
const pastillas = document.getElementById('filtro-disciplina');
const inputEdad = document.getElementById('filtro-edad');
const sinResultados = document.getElementById('sin-resultados');

let disciplinaElegida = ''; // '' significa "Todas"

// Crea una pastilla (botón) por disciplina, sin repetir y en el orden del arreglo
function cargarDisciplinas() {
  const disciplinas = [];
  actividades.forEach(function (actividad) {
    if (!disciplinas.includes(actividad.disciplina)) {
      disciplinas.push(actividad.disciplina);
    }
  });

  disciplinas.forEach(function (disciplina) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'pastilla';
    boton.dataset.disciplina = disciplina;
    boton.setAttribute('aria-pressed', 'false');
    boton.textContent = disciplina;
    pastillas.appendChild(boton);
  });
}

// Borra las tarjetas actuales y dibuja las de la lista recibida
function mostrarActividades(lista) {
  contenedor.innerHTML = '';

  lista.forEach(function (actividad) {
    contenedor.appendChild(actividad.crearTarjeta());
  });

  sinResultados.hidden = lista.length > 0;
}

// Lee los filtros, arma la lista filtrada y redibuja
function filtrar() {
  const edad = parseInt(inputEdad.value, 10); // NaN si el campo está vacío

  const filtradas = actividades.filter(function (actividad) {
    const coincideDisciplina = disciplinaElegida === '' || actividad.disciplina === disciplinaElegida;
    const coincideEdad = isNaN(edad) || actividad.esAptaParaEdad(edad);
    return coincideDisciplina && coincideEdad;
  });

  mostrarActividades(filtradas);
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------

// Un solo listener en el contenedor atiende el clic de cualquier pastilla (delegación de eventos)
pastillas.addEventListener('click', function (evento) {
  const pastilla = evento.target.closest('.pastilla');
  if (!pastilla) {
    return;
  }

  disciplinaElegida = pastilla.dataset.disciplina;
  pastillas.querySelectorAll('.pastilla').forEach(function (boton) {
    boton.setAttribute('aria-pressed', boton === pastilla ? 'true' : 'false');
  });
  filtrar();
});

inputEdad.addEventListener('input', filtrar);

// Primera carga
cargarDisciplinas();
mostrarActividades(actividades);

// Solo para las pruebas con Jest: en el navegador "module" no existe y esto se ignora
if (typeof module !== 'undefined') {
  module.exports = { Actividad, actividades, filtrar };
}
