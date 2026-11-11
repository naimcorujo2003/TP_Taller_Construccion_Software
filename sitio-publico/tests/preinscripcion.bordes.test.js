// Casos borde del formulario de preinscripción: buscan errores que las pruebas "normales" no ven.
const { cargarPagina } = require('./cargarPagina');

let formulario;

const campo = (nombre) => formulario.elements[nombre];
const error = (nombre) => document.getElementById('error-' + nombre).textContent;
const enviar = () => formulario.querySelector('button[type="submit"]').click();
const exitoVisible = () => !document.getElementById('mensaje-exito').hidden;

function completar(datos) {
  const base = {
    nombre: 'Ana',
    apellido: 'Paz',
    dni: '40111001',
    fechaNacimiento: '2000-05-10',
    email: 'ana@mail.com',
    telefono: '',
    actividad: 'Natación',
  };
  Object.entries({ ...base, ...datos }).forEach(([nombre, valor]) => {
    campo(nombre).value = valor;
  });
}

// "Ahora" fijo: 11/11/2026 a las 22:30 en Córdoba (01:30 del 12/11 en UTC)
const AHORA = new Date('2026-11-12T01:30:00Z');
const tzOriginal = process.env.TZ;

beforeEach(() => {
  process.env.TZ = 'America/Argentina/Cordoba';
  jest.useFakeTimers({ now: AHORA });
  cargarPagina('preinscripcion.html', 'preinscripcion.js', '/preinscripcion.html');
  formulario = document.getElementById('form-preinscripcion');
});

afterEach(() => {
  jest.useRealTimers();
  process.env.TZ = tzOriginal;
});

describe('fecha de nacimiento', () => {
  test('rechaza la fecha de mañana aunque sean más de las 21 h en Argentina', () => {
    // new Date('2026-11-12') es medianoche UTC = 21 h del 11/11 en Córdoba: ya "pasó" a las 22:30
    completar({ fechaNacimiento: '2026-11-12' });
    enviar();
    expect(error('fechaNacimiento')).toBe('La fecha no puede ser futura.');
    expect(exitoVisible()).toBe(false);
  });

  test('acepta a alguien que cumple años justo hoy', () => {
    completar({ fechaNacimiento: '1996-11-11', actividad: 'Yoga' }); // 30 años hoy
    enviar();
    expect(error('fechaNacimiento')).toBe('');
    expect(exitoVisible()).toBe(true);
  });

  test('rechaza fechas imposibles de tan viejas (más de 120 años)', () => {
    completar({ fechaNacimiento: '1850-01-01', actividad: 'Ajedrez' });
    enviar();
    expect(error('fechaNacimiento')).toBe('Revisá la fecha de nacimiento.');
  });
});

describe('edad según la actividad elegida', () => {
  test('un adulto no puede preinscribirse en Fútbol infantil (6 a 12)', () => {
    completar({ fechaNacimiento: '1990-03-01', actividad: 'Fútbol infantil' });
    enviar();
    expect(error('actividad')).toBe('Fútbol infantil es para edades de 6 a 12 años.');
    expect(exitoVisible()).toBe(false);
  });

  test('con 12 años recién cumplidos entra en Fútbol infantil (borde superior)', () => {
    completar({ fechaNacimiento: '2014-11-11', actividad: 'Fútbol infantil' });
    enviar();
    expect(error('actividad')).toBe('');
    expect(exitoVisible()).toBe(true);
  });

  test('si cumple 13 mañana todavía tiene 12 y entra', () => {
    completar({ fechaNacimiento: '2013-11-12', actividad: 'Fútbol infantil' });
    enviar();
    expect(error('actividad')).toBe('');
  });

  test('con 13 años cumplidos ya no entra en Fútbol infantil', () => {
    completar({ fechaNacimiento: '2013-11-11', actividad: 'Fútbol infantil' });
    enviar();
    expect(error('actividad')).toBe('Fútbol infantil es para edades de 6 a 12 años.');
  });
});

describe('campos de texto', () => {
  test('nombre y apellido con solo espacios cuentan como vacíos', () => {
    completar({ nombre: '   ', apellido: '\t' });
    enviar();
    expect(error('nombre')).toBe('Ingresá tu nombre.');
    expect(error('apellido')).toBe('Ingresá tu apellido.');
  });

  test('el DNI con espacios alrededor se acepta (se recortan)', () => {
    completar({ dni: '  40111001 ' });
    enviar();
    expect(error('dni')).toBe('');
  });

  test.each(['ana@@mail.com', 'ana @mail.com', 'ana@mail', '@mail.com'])('rechaza el email %s', (email) => {
    completar({ email });
    enviar();
    expect(error('email')).not.toBe('');
  });

  test.each(['------', '((((((', '   +   '])('rechaza un teléfono sin números: "%s"', (telefono) => {
    completar({ telefono });
    enviar();
    expect(error('telefono')).not.toBe('');
  });

  test('acepta un teléfono normal con código de área', () => {
    completar({ telefono: '(351) 555-1234' });
    enviar();
    expect(error('telefono')).toBe('');
  });
});

describe('comportamiento del formulario', () => {
  test('el foco va al primer campo con error, en el orden de la página', () => {
    completar({ nombre: '', email: 'mal' });
    enviar();
    expect(document.activeElement).toBe(campo('nombre'));
  });

  test('un envío con error oculta el mensaje de éxito anterior', () => {
    completar({});
    enviar();
    expect(exitoVisible()).toBe(true);

    enviar(); // el formulario quedó vacío después del reset
    expect(exitoVisible()).toBe(false);
  });

  test('al corregir un campo y salir de él, su error desaparece', () => {
    completar({ dni: '123' });
    enviar();
    expect(error('dni')).not.toBe('');

    campo('dni').value = '40111001';
    campo('dni').dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    expect(error('dni')).toBe('');
    expect(campo('dni').hasAttribute('aria-invalid')).toBe(false);
  });

  test('cada campo con error está asociado a su mensaje (aria-describedby) para lectores de pantalla', () => {
    ['nombre', 'apellido', 'dni', 'fechaNacimiento', 'email', 'telefono', 'actividad'].forEach((nombre) => {
      expect(campo(nombre).getAttribute('aria-describedby')).toBe('error-' + nombre);
    });
  });

  test('el nombre se muestra como texto aunque tenga etiquetas HTML (no se puede inyectar código)', () => {
    completar({ nombre: '<img src=x onerror=alert(1)>' });
    enviar();
    const titulo = document.getElementById('exito-titulo');
    expect(titulo.querySelector('img')).toBeNull();
    expect(titulo.textContent).toBe('¡Gracias, <img src=x onerror=alert(1)>!');
  });
});

describe('preselección por URL', () => {
  test('una actividad que no existe en la URL no rompe el formulario', () => {
    cargarPagina('preinscripcion.html', 'preinscripcion.js', '/preinscripcion.html?actividad=Tenis');
    formulario = document.getElementById('form-preinscripcion');
    expect(campo('actividad').value).toBe('');
  });

  test('código HTML en la URL no se inserta en la página', () => {
    cargarPagina('preinscripcion.html', 'preinscripcion.js',
      '/preinscripcion.html?actividad=' + encodeURIComponent('<script>alert(1)</script>'));
    expect(document.querySelectorAll('main script')).toHaveLength(0);
  });
});
