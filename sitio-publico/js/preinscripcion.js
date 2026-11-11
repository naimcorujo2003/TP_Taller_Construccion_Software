// Validación del formulario de preinscripción.
// Los errores se muestran junto a cada campo (nunca con alert()).

const formulario = document.getElementById('form-preinscripcion');
const mensajeExito = document.getElementById('mensaje-exito');

// RN7: el DNI debe tener 7 u 8 dígitos numéricos, sin puntos
function esDniValido(dni) {
  return /^\d{7,8}$/.test(dni);
}

function esEmailValido(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Al menos 6 números; además se permiten espacios, guiones, paréntesis y "+"
function esTelefonoValido(telefono) {
  const cantidadDeNumeros = telefono.replace(/\D/g, '').length;
  return /^[\d\s()+-]{6,20}$/.test(telefono) && cantidadDeNumeros >= 6;
}

// Fecha de hoy en hora LOCAL con formato "AAAA-MM-DD", igual que el valor de un <input type="date">.
// No se usa new Date("AAAA-MM-DD") porque eso es medianoche en UTC (21 h del día anterior en Argentina).
function fechaDeHoy() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return hoy.getFullYear() + '-' + mes + '-' + dia;
}

// Años cumplidos a hoy (si el cumpleaños es mañana, todavía no suma)
function calcularEdad(fechaNacimiento) {
  const [anio, mes, dia] = fechaNacimiento.split('-').map(Number);
  const [anioHoy, mesHoy, diaHoy] = fechaDeHoy().split('-').map(Number);
  let edad = anioHoy - anio;
  if (mesHoy < mes || (mesHoy === mes && diaHoy < dia)) {
    edad--;
  }
  return edad;
}

// Muestra (o borra, si el mensaje está vacío) el error de un campo
function mostrarError(idCampo, mensaje) {
  const campo = document.getElementById(idCampo);
  const span = document.getElementById('error-' + idCampo);
  span.textContent = mensaje;

  if (mensaje) {
    campo.classList.add('campo-error');
    campo.setAttribute('aria-invalid', 'true');
  } else {
    campo.classList.remove('campo-error');
    campo.removeAttribute('aria-invalid');
  }
}

// Valida todos los campos; devuelve true si no hay errores
function validarFormulario() {
  const nombre = formulario.elements.nombre.value.trim();
  const apellido = formulario.elements.apellido.value.trim();
  const dni = formulario.elements.dni.value.trim();
  const fechaNacimiento = formulario.elements.fechaNacimiento.value;
  const email = formulario.elements.email.value.trim();
  const telefono = formulario.elements.telefono.value.trim();
  const actividad = formulario.elements.actividad.value;

  const errores = {
    nombre: nombre === '' ? 'Ingresá tu nombre.' : '',
    apellido: apellido === '' ? 'Ingresá tu apellido.' : '',
    dni: '',
    fechaNacimiento: '',
    email: '',
    telefono: '',
    actividad: actividad === '' ? 'Elegí una actividad.' : '',
  };

  if (dni === '') {
    errores.dni = 'Ingresá tu DNI.';
  } else if (dni.includes('.')) {
    errores.dni = 'Escribí el DNI sin puntos.';
  } else if (!esDniValido(dni)) {
    errores.dni = 'El DNI debe tener 7 u 8 números.';
  }

  if (fechaNacimiento === '') {
    errores.fechaNacimiento = 'Ingresá tu fecha de nacimiento.';
  } else if (fechaNacimiento > fechaDeHoy()) {
    // Las fechas "AAAA-MM-DD" se pueden comparar como texto: el orden alfabético es el cronológico
    errores.fechaNacimiento = 'La fecha no puede ser futura.';
  } else if (calcularEdad(fechaNacimiento) > 120) {
    errores.fechaNacimiento = 'Revisá la fecha de nacimiento.';
  }

  // Con una fecha válida y una actividad elegida, la edad tiene que entrar en el rango de esa actividad.
  // El rango sale de los atributos data-edad-min / data-edad-max de la opción del <select>.
  const opcion = formulario.elements.actividad.selectedOptions[0];
  if (actividad !== '' && fechaNacimiento !== '' && !errores.fechaNacimiento) {
    const edad = calcularEdad(fechaNacimiento);
    const minima = Number(opcion.dataset.edadMin);
    const maxima = Number(opcion.dataset.edadMax);
    if (edad < minima || edad > maxima) {
      errores.actividad = actividad + ' es para edades de ' + minima + ' a ' + maxima + ' años.';
    }
  }

  if (email === '') {
    errores.email = 'Ingresá tu email.';
  } else if (!esEmailValido(email)) {
    errores.email = 'El email no tiene un formato válido (ej: nombre@mail.com).';
  }

  if (telefono !== '' && !esTelefonoValido(telefono)) {
    errores.telefono = 'Ingresá al menos 6 números (podés usar espacios, guiones y paréntesis).';
  }

  let valido = true;
  Object.keys(errores).forEach(function (idCampo) {
    mostrarError(idCampo, errores[idCampo]);
    if (errores[idCampo]) {
      valido = false;
    }
  });

  return valido;
}

formulario.addEventListener('submit', function (evento) {
  evento.preventDefault(); // el formulario no se envía si hay errores
  mensajeExito.hidden = true;

  if (!validarFormulario()) {
    // Lleva el foco al primer campo con error
    formulario.querySelector('.campo-error').focus();
    return;
  }

  const nombre = formulario.elements.nombre.value.trim();
  const actividad = formulario.elements.actividad.value;
  document.getElementById('exito-titulo').textContent = '¡Gracias, ' + nombre + '!';
  document.getElementById('exito-texto').textContent = 'Recibimos tu preinscripción a ' + actividad +
    '. La secretaría se va a comunicar con vos para confirmarla.';
  mensajeExito.hidden = false;
  formulario.reset();
});

// Valida cada campo cuando el usuario sale de él, si ya tenía un error
formulario.addEventListener('focusout', function (evento) {
  if (evento.target.classList.contains('campo-error')) {
    validarFormulario();
  }
});

// Objeto "location": si se llegó desde una tarjeta del catálogo
// (preinscripcion.html?actividad=Yoga) se preselecciona esa actividad.
const parametros = new URLSearchParams(window.location.search);
const actividadElegida = parametros.get('actividad');
if (actividadElegida) {
  formulario.elements.actividad.value = actividadElegida;
}

// Solo para las pruebas con Jest: en el navegador "module" no existe y esto se ignora
if (typeof module !== 'undefined') {
  module.exports = { esDniValido, esEmailValido, esTelefonoValido, calcularEdad, validarFormulario };
}
