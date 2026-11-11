const { cargarPagina } = require('./cargarPagina');

let Actividad;

beforeEach(() => {
  ({ Actividad } = cargarPagina('actividades.html', 'actividades.js'));
});

const nombresVisibles = () =>
  [...document.querySelectorAll('#lista-actividades article h3')].map((h) => h.textContent);

const pastilla = (texto) =>
  [...document.querySelectorAll('#filtro-disciplina .pastilla')].find((b) => b.textContent === texto);

function escribirEdad(valor) {
  const input = document.getElementById('filtro-edad');
  input.value = valor;
  input.dispatchEvent(new Event('input'));
}

describe('clase Actividad', () => {
  let futbol;
  beforeEach(() => {
    futbol = new Actividad('Fútbol infantil', 'Fútbol', 'Lun y Mié', '18:00', 6, 12, 40, 18000, 'Diego Ferreyra');
  });

  test('esAptaParaEdad acepta los bordes del rango (6 y 12)', () => {
    expect(futbol.esAptaParaEdad(6)).toBe(true);
    expect(futbol.esAptaParaEdad(12)).toBe(true);
  });

  test('esAptaParaEdad rechaza edades fuera del rango (5 y 13)', () => {
    expect(futbol.esAptaParaEdad(5)).toBe(false);
    expect(futbol.esAptaParaEdad(13)).toBe(false);
  });

  test('cuotaFormateada usa el formato argentino', () => {
    expect(futbol.cuotaFormateada()).toBe('$ 18.000');
  });

  test('crearTarjeta arma el article como en el diseño', () => {
    const tarjeta = futbol.crearTarjeta();
    expect(tarjeta.tagName).toBe('ARTICLE');
    expect(tarjeta.querySelector('.etiqueta').textContent).toBe('Fútbol');
    expect(tarjeta.querySelector('h3').textContent).toBe('Fútbol infantil');

    const datos = [...tarjeta.querySelectorAll('.tarjeta__datos li')].map((li) => li.textContent);
    expect(datos).toEqual(['Lun y Mié · 18:00', '6 a 12 años', 'Prof. Diego Ferreyra']);
    expect(tarjeta.querySelectorAll('.tarjeta__datos svg')).toHaveLength(3);

    expect(tarjeta.querySelector('.precio').textContent).toBe('$ 18.000/mes');
    expect(tarjeta.querySelector('.lugares').textContent).toBe('40 lugares');
    const enlace = tarjeta.querySelector('a.boton');
    expect(enlace.textContent).toBe('Preinscribirme');
    expect(enlace.getAttribute('href')).toBe('preinscripcion.html?actividad=F%C3%BAtbol%20infantil');
  });
});

describe('catálogo en actividades.html', () => {
  test('al cargar muestra las 8 actividades del club', () => {
    expect(nombresVisibles()).toHaveLength(8);
    expect(document.getElementById('sin-resultados').hidden).toBe(true);
  });

  test('genera una pastilla por disciplina, sin repetir y en el orden del catálogo', () => {
    const textos = [...document.querySelectorAll('#filtro-disciplina .pastilla')].map((b) => b.textContent);
    expect(textos).toEqual(['Todas', 'Fútbol', 'Vóley', 'Básquet', 'Natación', 'Patín', 'Ajedrez', 'Fitness', 'Bienestar']);
    expect(pastilla('Todas').getAttribute('aria-pressed')).toBe('true');
  });

  test('al tocar una pastilla queda marcada y filtra por esa disciplina', () => {
    pastilla('Natación').click();

    expect(nombresVisibles()).toEqual(['Natación']);
    expect(pastilla('Natación').getAttribute('aria-pressed')).toBe('true');
    expect(pastilla('Todas').getAttribute('aria-pressed')).toBe('false');
  });

  test('"Todas" vuelve a mostrar el catálogo completo', () => {
    pastilla('Ajedrez').click();
    pastilla('Todas').click();
    expect(nombresVisibles()).toHaveLength(8);
  });

  test('filtrar por edad 14 saca Fútbol infantil (6 a 12) y deja las aptas', () => {
    escribirEdad('14');
    expect(nombresVisibles()).toEqual(['Vóley mixto', 'Básquet juvenil', 'Natación', 'Patín artístico', 'Ajedrez']);
  });

  test('disciplina y edad se combinan', () => {
    escribirEdad('70');
    pastilla('Natación').click();
    expect(nombresVisibles()).toEqual(['Natación']);
  });

  test('si ningún filtro coincide muestra el aviso "No hay actividades"', () => {
    pastilla('Fútbol').click();
    escribirEdad('14');
    expect(nombresVisibles()).toHaveLength(0);
    expect(document.getElementById('sin-resultados').hidden).toBe(false);
  });

  test('borrar la edad vuelve a mostrar todo', () => {
    escribirEdad('70');
    expect(nombresVisibles()).toEqual(['Natación', 'Ajedrez', 'Yoga']);
    escribirEdad('');
    expect(nombresVisibles()).toHaveLength(8);
  });
});
