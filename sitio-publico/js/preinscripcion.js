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
  const nombre = formulario.nombre.value.trim();
  const apellido = formulario.apellido.value.trim();
  const dni = formulario.dni.value.trim();
  const fechaNacimiento = formulario.fechaNacimiento.value;
  const email = formulario.email.value.trim();
  const telefono = formulario.telefono.value.trim();
  const actividad = formulario.actividad.value;

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
  } else if (new Date(fechaNacimiento) > new Date()) {
    errores.fechaNacimiento = 'La fecha no puede ser futura.';
  }

  if (email === '') {
    errores.email = 'Ingresá tu email.';
  } else if (!esEmailValido(email)) {
    errores.email = 'El email no tiene un formato válido (ej: nombre@mail.com).';
  }

  if (telefono !== '' && !/^[\d\s()+-]{6,20}$/.test(telefono)) {
    errores.telefono = 'El teléfono solo puede tener números, espacios y guiones.';
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

  const nombre = formulario.nombre.value.trim();
  const actividad = formulario.actividad.value;
  mensajeExito.textContent = '¡Gracias, ' + nombre + '! Recibimos tu preinscripción a ' + actividad +
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
  formulario.actividad.value = actividadElegida;
}
