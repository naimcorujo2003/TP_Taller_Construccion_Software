const { cargarPagina } = require('./cargarPagina');

let esDniValido;
let esEmailValido;
let formulario;

function cargar(url = '/preinscripcion.html') {
  ({ esDniValido, esEmailValido } = cargarPagina('preinscripcion.html', 'preinscripcion.js', url));
  formulario = document.getElementById('form-preinscripcion');
}

const error = (campo) => document.getElementById('error-' + campo).textContent;
const enviar = () => formulario.querySelector('button[type="submit"]').click();

function completarValido() {
  formulario.elements.nombre.value = 'Ana';
  formulario.elements.apellido.value = 'Paz';
  formulario.elements.dni.value = '40111001';
  formulario.elements.fechaNacimiento.value = '2000-05-10';
  formulario.elements.email.value = 'ana@mail.com';
  formulario.elements.actividad.value = 'Yoga';
}

beforeEach(() => {
  cargar();
  window.alert = jest.fn();
});

describe('esDniValido (RN7)', () => {
  test.each(['40111001', '5123456'])('acepta %s (7 u 8 dígitos)', (dni) => {
    expect(esDniValido(dni)).toBe(true);
  });

  test.each([
    ['con puntos', '40.111.001'],
    ['con letras', '40A11001'],
    ['con 6 dígitos', '123456'],
    ['con 9 dígitos', '123456789'],
    ['vacío', ''],
  ])('rechaza un DNI %s', (_caso, dni) => {
    expect(esDniValido(dni)).toBe(false);
  });
});

test('esEmailValido distingue un email correcto de uno incompleto', () => {
  expect(esEmailValido('ana@mail.com')).toBe(true);
  expect(esEmailValido('ana@')).toBe(false);
  expect(esEmailValido('ana.mail.com')).toBe(false);
});

describe('formulario de preinscripción', () => {
  test('enviado vacío muestra un error junto a cada campo obligatorio', () => {
    enviar();

    expect(error('nombre')).toBe('Ingresá tu nombre.');
    expect(error('apellido')).toBe('Ingresá tu apellido.');
    expect(error('dni')).toBe('Ingresá tu DNI.');
    expect(error('fechaNacimiento')).toBe('Ingresá tu fecha de nacimiento.');
    expect(error('email')).toBe('Ingresá tu email.');
    expect(error('actividad')).toBe('Elegí una actividad.');
    expect(formulario.elements.dni.classList.contains('campo-error')).toBe(true);
    expect(document.getElementById('mensaje-exito').hidden).toBe(true);
  });

  test('nunca usa alert() para mostrar errores', () => {
    enviar();
    expect(window.alert).not.toHaveBeenCalled();
  });

  test('un DNI con puntos tiene su propio mensaje', () => {
    completarValido();
    formulario.elements.dni.value = '40.111.001';
    enviar();
    expect(error('dni')).toBe('Escribí el DNI sin puntos.');
  });

  test.each(['123456', '123456789', '40A11001'])('el DNI %s muestra el error de longitud', (dni) => {
    completarValido();
    formulario.elements.dni.value = dni;
    enviar();
    expect(error('dni')).toBe('El DNI debe tener 7 u 8 números.');
  });

  test('un email mal escrito se marca junto al campo', () => {
    completarValido();
    formulario.elements.email.value = 'ana@';
    enviar();
    expect(error('email')).toMatch(/formato válido/);
  });

  test('con datos válidos muestra el mensaje de éxito, limpia el formulario y los errores', () => {
    enviar(); // primero con errores
    completarValido();
    enviar();

    const exito = document.getElementById('mensaje-exito');
    expect(exito.hidden).toBe(false);
    expect(document.getElementById('exito-titulo').textContent).toBe('¡Gracias, Ana!');
    expect(document.getElementById('exito-texto').textContent).toBe(
      'Recibimos tu preinscripción a Yoga. La secretaría se va a comunicar con vos para confirmarla.'
    );
    expect(formulario.elements.nombre.value).toBe('');
    expect(error('dni')).toBe('');
    expect(formulario.querySelectorAll('.campo-error')).toHaveLength(0);
  });

  test('con ?actividad=Ajedrez en la URL (location.search) preselecciona la actividad', () => {
    cargar('/preinscripcion.html?actividad=Ajedrez');
    expect(formulario.elements.actividad.value).toBe('Ajedrez');
  });
});
